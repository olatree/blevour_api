const FeeAccount = require("../../../models/fees/FeeAccount");
const Enrollment = require("../../../models/Enrollment");
const Term = require("../../../models/Term");

const {
  getEffectiveStudentCategory,
  findFeeStructureMapping,
  getFeeStructureById,
  buildFeeAccountFeesFromMapping,
} = require("./feeStructureService");

const getId = (value) => {
  if (!value) return null;
  return value._id ? String(value._id) : String(value);
};

const normalizeName = (value) => String(value || "").trim().toLowerCase();

const buildEnrollmentQuery = (feeStructure) => {
  const query = {
    sessionId: getId(feeStructure.sessionId),
    classId: getId(feeStructure.classId),
  };

  if (feeStructure.academicUnitId) {
    query.academicUnitId = getId(feeStructure.academicUnitId);
  }

  if (feeStructure.armId) {
    query.armId = getId(feeStructure.armId);
  }

  return query;
};

const syncSingleFeeAccount = async ({ account, mapping }) => {
  const latestFees = buildFeeAccountFeesFromMapping(mapping);

  let addedItems = 0;
  let updatedItems = 0;
  let skippedPaidItems = 0;

  latestFees.forEach((latestFee) => {
    const existingFee = account.fees.find(
      (fee) =>
        normalizeName(fee.feeTypeName) === normalizeName(latestFee.feeTypeName)
    );

    if (!existingFee) {
      account.fees.push(latestFee);
      addedItems++;
      return;
    }

    const alreadyPaid = Number(existingFee.paid || 0) > 0;

    if (alreadyPaid) {
      skippedPaidItems++;
      return;
    }

    const oldAmount = Number(existingFee.amount || 0);
    const newAmount = Number(latestFee.amount || 0);

    if (oldAmount !== newAmount) {
      existingFee.amount = newAmount;
      existingFee.netAmount =
        newAmount - Number(existingFee.discount || 0);
      existingFee.due =
        Number(existingFee.netAmount || 0) - Number(existingFee.paid || 0);

      updatedItems++;
    }
  });

  if (typeof account.recalculate === "function") {
    account.recalculate();
  }

  if (addedItems > 0 || updatedItems > 0) {
    await account.save();
  }

  return {
    changed: addedItems > 0 || updatedItems > 0,
    addedItems,
    updatedItems,
    skippedPaidItems,
  };
};

const syncFeeAccountsFromStructure = async ({ feeStructureId }) => {
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
    const error = new Error("No enrollments found for this fee structure");
    error.statusCode = 404;
    throw error;
  }

  const currentTerm = await Term.findById(getId(feeStructure.termId));

  let accountsChecked = 0;
  let accountsUpdated = 0;
  let accountsUnchanged = 0;
  let accountsMissing = 0;
  let totalAddedItems = 0;
  let totalUpdatedItems = 0;
  let totalSkippedPaidItems = 0;

  const details = [];

  for (const enrollment of enrollments) {
    const studentId = getId(enrollment.studentId);

    const account = await FeeAccount.findOne({
      studentId,
      sessionId: getId(feeStructure.sessionId),
      termId: getId(feeStructure.termId),
    });

    if (!account) {
      accountsMissing++;
      details.push({
        student: enrollment.studentId?.name || "Unknown student",
        admissionNumber: enrollment.studentId?.admissionNumber || "",
        status: "missing_account",
        message: "No fee account exists yet. Generate account first.",
      });
      continue;
    }

    accountsChecked++;

    const effectiveCategory = getEffectiveStudentCategory(
      enrollment,
      feeStructure
    );

    const mapping = findFeeStructureMapping({
      feeStructure,
      studentCategory: effectiveCategory,
    });

    if (!mapping) {
      accountsUnchanged++;
      details.push({
        student: enrollment.studentId?.name || "Unknown student",
        admissionNumber: enrollment.studentId?.admissionNumber || "",
        status: "skipped",
        message: `No mapping found for ${effectiveCategory}`,
      });
      continue;
    }

    const result = await syncSingleFeeAccount({ account, mapping });

    totalAddedItems += result.addedItems;
    totalUpdatedItems += result.updatedItems;
    totalSkippedPaidItems += result.skippedPaidItems;

    if (result.changed) {
      accountsUpdated++;
      details.push({
        student: enrollment.studentId?.name || "Unknown student",
        admissionNumber: enrollment.studentId?.admissionNumber || "",
        status: "updated",
        addedItems: result.addedItems,
        updatedItems: result.updatedItems,
        skippedPaidItems: result.skippedPaidItems,
      });
    } else {
      accountsUnchanged++;
    }
  }

  return {
    success: true,
    message: "Fee accounts synced successfully",
    totalEnrollments: enrollments.length,
    accountsChecked,
    accountsUpdated,
    accountsUnchanged,
    accountsMissing,
    totalAddedItems,
    totalUpdatedItems,
    totalSkippedPaidItems,
    details,
  };
};

module.exports = {
  syncFeeAccountsFromStructure,
};