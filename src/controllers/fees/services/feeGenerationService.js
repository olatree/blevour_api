const FeeAccount = require("../../../models/fees/FeeAccount");
const Enrollment = require("../../../models/Enrollment");
const Term = require("../../../models/Term");

const { recalculateFeeAccount } = require("../../../utils/feeUtils");

const {
  getPreviousBalance,
} = require("./carryForwardService");

const {
  getEffectiveStudentCategory,
  findFeeStructureMapping,
  getFeeStructureById,
  buildFeeAccountFeesFromMapping,
} = require("./feeStructureService");

const buildEnrollmentQuery = (feeStructure) => {
  const query = {
    sessionId: feeStructure.sessionId?._id || feeStructure.sessionId,
    classId: feeStructure.classId?._id || feeStructure.classId,
  };

  if (feeStructure.academicUnitId) {
    query.academicUnitId =
      feeStructure.academicUnitId?._id || feeStructure.academicUnitId;
  }

  if (feeStructure.armId) {
    query.armId = feeStructure.armId?._id || feeStructure.armId;
  }

  return query;
};

const createFeeAccountForEnrollment = async ({
  enrollment,
  feeStructure,
  currentTerm,
}) => {
  if (!enrollment.studentId) {
    return {
      status: "skipped",
      reason: "Missing student",
    };
  }

  const studentId = enrollment.studentId._id || enrollment.studentId;

  const existingAccount = await FeeAccount.findOne({
    studentId,
    sessionId: feeStructure.sessionId?._id || feeStructure.sessionId,
    termId: feeStructure.termId?._id || feeStructure.termId,
  });

  if (existingAccount) {
    return {
      status: "skipped",
      reason: "Fee account already exists",
    };
  }

  const effectiveCategory = getEffectiveStudentCategory(
    enrollment,
    feeStructure
  );

  const mapping = findFeeStructureMapping({
    feeStructure,
    studentCategory: effectiveCategory,
  });

  if (!mapping) {
    return {
      status: "skipped",
      reason: `No fee template mapping found for ${effectiveCategory}`,
    };
  }

  const fees = buildFeeAccountFeesFromMapping(mapping);

  if (!fees.length) {
    return {
      status: "skipped",
      reason: `No fees found for ${effectiveCategory}`,
    };
  }

  const { previousBalance, previousFeeAccountId } = await getPreviousBalance({
    studentId,
    currentTerm,
  });

  const feeAccount = new FeeAccount({
    studentId,
    enrollmentId: enrollment._id,

    academicUnitId:
      enrollment.academicUnitId ||
      feeStructure.academicUnitId?._id ||
      feeStructure.academicUnitId,

    sessionId: feeStructure.sessionId?._id || feeStructure.sessionId,
    termId: feeStructure.termId?._id || feeStructure.termId,
    classId: feeStructure.classId?._id || feeStructure.classId,
    armId: enrollment.armId,

    feeStructureId: feeStructure._id,

    billingCategory: effectiveCategory,

    previousBalance,
    previousBalancePaid: 0,
    previousFeeAccountId,

    fees,
  });

  if (typeof feeAccount.recalculate === "function") {
    feeAccount.recalculate();
  } else {
    recalculateFeeAccount(feeAccount);
  }

  await feeAccount.save();

  return {
    status: "created",
    feeAccount,
    carriedOver: previousBalance > 0,
  };
};

const generateFeeAccountsFromStructure = async ({ feeStructureId }) => {
  if (!feeStructureId) {
    const error = new Error("Fee structure ID is required");
    error.statusCode = 400;
    throw error;
  }

  const feeStructure = await getFeeStructureById(feeStructureId);

  const enrollmentQuery = buildEnrollmentQuery(feeStructure);

  const enrollments = await Enrollment.find(enrollmentQuery)
    .populate("studentId", "name admissionNumber")
    .lean();

  if (!enrollments.length) {
    const error = new Error("No students found for this fee structure selection");
    error.statusCode = 404;
    throw error;
  }

  const currentTerm = await Term.findById(
    feeStructure.termId?._id || feeStructure.termId
  );

  let created = 0;
  let skipped = 0;
  let carriedOver = 0;

  const skippedDetails = [];

  for (const enrollment of enrollments) {
    const result = await createFeeAccountForEnrollment({
      enrollment,
      feeStructure,
      currentTerm,
    });

    if (result.status === "created") {
      created++;

      if (result.carriedOver) {
        carriedOver++;
      }
    } else {
      skipped++;
      skippedDetails.push({
        student: enrollment.studentId?.name || "Unknown student",
        admissionNumber: enrollment.studentId?.admissionNumber || "",
        reason: result.reason,
      });
    }
  }

  return {
    success: true,
    message: "Fee accounts generated successfully",
    created,
    skipped,
    carriedOver,
    totalStudents: enrollments.length,
    skippedDetails,
  };
};

const generateSingleStudentFeeAccountFromStructure = async ({
  studentId,
  feeStructureId,
}) => {
  if (!studentId || !feeStructureId) {
    const error = new Error("studentId and feeStructureId are required");
    error.statusCode = 400;
    throw error;
  }

  const feeStructure = await getFeeStructureById(feeStructureId);

  const enrollmentQuery = {
    studentId,
    sessionId: feeStructure.sessionId?._id || feeStructure.sessionId,
    classId: feeStructure.classId?._id || feeStructure.classId,
  };

  if (feeStructure.academicUnitId) {
    enrollmentQuery.academicUnitId =
      feeStructure.academicUnitId?._id || feeStructure.academicUnitId;
  }

  if (feeStructure.armId) {
    enrollmentQuery.armId = feeStructure.armId?._id || feeStructure.armId;
  }

  const enrollment = await Enrollment.findOne(enrollmentQuery)
    .populate("studentId", "name admissionNumber")
    .lean();

  if (!enrollment) {
    const error = new Error("Enrollment not found for this student/class/session");
    error.statusCode = 404;
    throw error;
  }

  const currentTerm = await Term.findById(
    feeStructure.termId?._id || feeStructure.termId
  );

  const result = await createFeeAccountForEnrollment({
    enrollment,
    feeStructure,
    currentTerm,
  });

  if (result.status !== "created") {
    const error = new Error(result.reason || "Fee account was not created");
    error.statusCode = 400;
    throw error;
  }

  return {
    success: true,
    message: "Student fee account generated successfully",
    data: result.feeAccount,
  };
};

module.exports = {
  generateFeeAccountsFromStructure,
  generateSingleStudentFeeAccountFromStructure,
};