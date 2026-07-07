const FeeStructure = require("../../../models/fees/FeeStructure");

const getId = (value) => {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
};

const getEffectiveStudentCategory = (enrollment, feeStructure) => {
  const category = enrollment.studentCategory || "returning";

  if (!["new_intake", "transfer"].includes(category)) {
    return "returning";
  }

  const enrollmentTermId = getId(enrollment.termId);
  const feeStructureTermId = getId(feeStructure.termId);

  if (
    enrollmentTermId &&
    feeStructureTermId &&
    enrollmentTermId === feeStructureTermId
  ) {
    return category;
  }

  return "returning";
};

const findFeeStructureMapping = ({ feeStructure, studentCategory }) => {
  const mappings = Array.isArray(feeStructure.templateMappings)
    ? feeStructure.templateMappings
    : [];

  const exactMapping = mappings.find(
    (mapping) => mapping.studentCategory === studentCategory
  );

  if (exactMapping) return exactMapping;

  const returningMapping = mappings.find(
    (mapping) => mapping.studentCategory === "returning"
  );

  return returningMapping || null;
};

const getFeeStructureById = async (feeStructureId) => {
  const feeStructure = await FeeStructure.findById(feeStructureId)
    .populate("academicUnitId", "name")
    .populate("sessionId", "name")
    .populate("termId", "name session")
    .populate("classId", "name")
    .populate("armId", "name")
    .populate("templateMappings.feeTemplateId", "name studentCategory");

  if (!feeStructure) {
    const error = new Error("Fee structure not found");
    error.statusCode = 404;
    throw error;
  }

  if (!feeStructure.isActive) {
    const error = new Error("Cannot generate accounts from an inactive fee structure");
    error.statusCode = 400;
    throw error;
  }

  if (!feeStructure.isPublished) {
    const error = new Error("Cannot generate accounts from an unpublished fee structure");
    error.statusCode = 400;
    throw error;
  }

  return feeStructure;
};

const buildFeeAccountFeesFromMapping = (mapping) => {
  return (mapping.fees || []).map((fee) => ({
    feeTypeId: null,
    feeTypeName: fee.feeType,
    amount: Number(fee.amount || 0),
    discount: 0,
    netAmount: Number(fee.amount || 0),
    paid: 0,
    due: Number(fee.amount || 0),
  }));
};

module.exports = {
  getEffectiveStudentCategory,
  findFeeStructureMapping,
  getFeeStructureById,
  buildFeeAccountFeesFromMapping,
};