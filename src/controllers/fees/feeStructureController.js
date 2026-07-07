

// const FeeStructure = require("../../models/fees/FeeStructure");
// const FeeType = require("../../models/fees/FeeType");
// const FeeAccount = require("../../models/fees/FeeAccount");

// const { recalculateFeeAccount } = require("../../utils/feeUtils");

// // =========================
// // HELPER: PREPARE FEES
// // =========================
// const prepareFees = async (fees) => {
//   const preparedFees = [];

//   for (const fee of fees) {
//     const feeType = await FeeType.findById(fee.feeTypeId);

//     if (!feeType) {
//       throw new Error("One of the selected fee types was not found");
//     }

//     if (!feeType.isActive) {
//       throw new Error(`${feeType.name} is archived and cannot be used`);
//     }

//     preparedFees.push({
//       feeTypeId: feeType._id,
//       feeTypeName: feeType.name,
//       amount: Number(fee.amount || 0),
//     });
//   }

//   return preparedFees;
// };

// // =========================
// // HELPER: SYNC ACCOUNTS
// // =========================
// const syncFeeAccountsWithStructure = async (feeStructure) => {
//   const accounts = await FeeAccount.find({
//     feeStructureId: feeStructure._id,
//   });

//   let updatedAccounts = 0;

//   for (const account of accounts) {
//     for (const structureFee of feeStructure.fees) {
//       const existingFee = account.fees.find(
//         (fee) =>
//           fee.feeTypeId?.toString() === structureFee.feeTypeId.toString()
//       );

//       // New fee added to structure, add it to existing student account
//       if (!existingFee) {
//         account.fees.push({
//           feeTypeId: structureFee.feeTypeId,
//           feeTypeName: structureFee.feeTypeName,
//           amount: structureFee.amount,
//           discount: 0,
//           netAmount: structureFee.amount,
//           paid: 0,
//           due: structureFee.amount,
//         });

//         continue;
//       }

//       // Existing fee: update only if no payment has been made on that item
//       const hasPayment = Number(existingFee.paid || 0) > 0;

//       if (!hasPayment) {
//         existingFee.amount = structureFee.amount;
//         existingFee.feeTypeName = structureFee.feeTypeName;
//       }
//     }

//     // Remove fee items that were removed from structure,
//     // but only if no payment has been made on that fee item.
//     account.fees = account.fees.filter((accountFee) => {
//       const stillExistsInStructure = feeStructure.fees.some(
//         (structureFee) =>
//           structureFee.feeTypeId.toString() === accountFee.feeTypeId?.toString()
//       );

//       const hasPayment = Number(accountFee.paid || 0) > 0;

//       return stillExistsInStructure || hasPayment;
//     });

//     recalculateFeeAccount(account);

//     await account.save();

//     updatedAccounts++;
//   }

//   return updatedAccounts;
// };

// // =========================
// // CREATE FEE STRUCTURE
// // =========================
// exports.createFeeStructure = async (req, res) => {
//   try {
//     const { sessionId, termId, classId, armId, fees } = req.body;

//     if (!sessionId || !termId || !classId || !fees || !fees.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Session, term, class, and fees are required",
//       });
//     }

//     const existing = await FeeStructure.findOne({
//       sessionId,
//       termId,
//       classId,
//       armId: armId || null,
//     });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Fee structure already exists for this class/arm, session, and term",
//       });
//     }

//     let preparedFees;

//     try {
//       preparedFees = await prepareFees(fees);
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//     }

//     const totalAmount = preparedFees.reduce(
//       (sum, fee) => sum + Number(fee.amount || 0),
//       0
//     );

//     const feeStructure = await FeeStructure.create({
//       sessionId,
//       termId,
//       classId,
//       armId: armId || null,
//       fees: preparedFees,
//       totalAmount,
//       createdBy: req.user?._id,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Fee structure created successfully",
//       data: feeStructure,
//     });
//   } catch (error) {
//     console.error("Create fee structure error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // =========================
// // GET ALL FEE STRUCTURES
// // =========================
// exports.getFeeStructures = async (req, res) => {
//   try {
//     const { sessionId, termId, classId, armId } = req.query;

//     const query = {};

//     if (sessionId) query.sessionId = sessionId;
//     if (termId) query.termId = termId;
//     if (classId) query.classId = classId;
//     if (armId) query.armId = armId;

//     const feeStructures = await FeeStructure.find(query)
//       .populate("sessionId", "name")
//       .populate("termId", "name")
//       .populate("classId", "name")
//       .populate("armId", "name")
//       .populate("createdBy", "name email role")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: feeStructures.length,
//       data: feeStructures,
//     });
//   } catch (error) {
//     console.error("Get fee structures error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // =========================
// // GET SINGLE FEE STRUCTURE
// // =========================
// exports.getFeeStructure = async (req, res) => {
//   try {
//     const feeStructure = await FeeStructure.findById(req.params.id)
//       .populate("sessionId", "name")
//       .populate("termId", "name")
//       .populate("classId", "name")
//       .populate("armId", "name")
//       .populate("fees.feeTypeId", "name isCompulsory isActive")
//       .populate("createdBy", "name email role");

//     if (!feeStructure) {
//       return res.status(404).json({
//         success: false,
//         message: "Fee structure not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: feeStructure,
//     });
//   } catch (error) {
//     console.error("Get fee structure error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // =========================
// // UPDATE FEE STRUCTURE + SYNC ACCOUNTS
// // =========================
// exports.updateFeeStructure = async (req, res) => {
//   try {
//     const { fees, isActive } = req.body;

//     const feeStructure = await FeeStructure.findById(req.params.id);

//     if (!feeStructure) {
//       return res.status(404).json({
//         success: false,
//         message: "Fee structure not found",
//       });
//     }

//     let accountsUpdated = 0;

//     if (fees && fees.length > 0) {
//       let preparedFees;

//       try {
//         preparedFees = await prepareFees(fees);
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           message: error.message,
//         });
//       }

//       feeStructure.fees = preparedFees;
//       feeStructure.totalAmount = preparedFees.reduce(
//         (sum, fee) => sum + Number(fee.amount || 0),
//         0
//       );
//     }

//     if (typeof isActive === "boolean") {
//       feeStructure.isActive = isActive;
//     }

//     await feeStructure.save();

//     if (fees && fees.length > 0) {
//       accountsUpdated = await syncFeeAccountsWithStructure(feeStructure);
//     }

//     res.status(200).json({
//       success: true,
//       message: "Fee structure updated successfully",
//       accountsUpdated,
//       data: feeStructure,
//     });
//   } catch (error) {
//     console.error("Update fee structure error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // =========================
// // DELETE / DEACTIVATE
// // =========================
// exports.deactivateFeeStructure = async (req, res) => {
//   try {
//     const feeStructure = await FeeStructure.findById(req.params.id);

//     if (!feeStructure) {
//       return res.status(404).json({
//         success: false,
//         message: "Fee structure not found",
//       });
//     }

//     feeStructure.isActive = false;
//     await feeStructure.save();

//     res.status(200).json({
//       success: true,
//       message: "Fee structure deactivated successfully",
//     });
//   } catch (error) {
//     console.error("Deactivate fee structure error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



// const FeeStructure = require("../../models/fees/FeeStructure");
// const FeeTemplate = require("../../models/FeeTemplate");
// const AcademicUnit = require("../../models/AcademicUnits");
// const Class = require("../../models/Class");
// const Arm = require("../../models/Arm");
// const Session = require("../../models/Session");
// const Term = require("../../models/Term");

// const normalizeFeeType = (value) => String(value || "").trim();

// const calculateEffectiveFees = async ({
//   feeTemplateId,
//   additionalFees = [],
//   removedFeeTypes = [],
// }) => {
//   let templateFees = [];

//   if (feeTemplateId) {
//     const template = await FeeTemplate.findById(feeTemplateId).lean();

//     if (!template) {
//       const error = new Error("Fee template not found");
//       error.statusCode = 404;
//       throw error;
//     }

//     templateFees = Array.isArray(template.fees) ? template.fees : [];
//   }

//   const removedSet = new Set(
//     (removedFeeTypes || []).map((item) => normalizeFeeType(item).toLowerCase())
//   );

//   const filteredTemplateFees = templateFees
//     .filter((fee) => !removedSet.has(normalizeFeeType(fee.feeType).toLowerCase()))
//     .map((fee) => ({
//       feeType: normalizeFeeType(fee.feeType),
//       amount: Number(fee.amount || 0),
//       isCompulsory: fee.isCompulsory !== false,
//       appliesOnce: !!fee.appliesOnce,
//       description: fee.description || "",
//     }));

//   const cleanedAdditionalFees = (additionalFees || [])
//     .map((fee) => ({
//       feeType: normalizeFeeType(fee.feeType),
//       amount: Number(fee.amount || 0),
//       isCompulsory: fee.isCompulsory !== false,
//       appliesOnce: !!fee.appliesOnce,
//       description: fee.description || "",
//     }))
//     .filter((fee) => fee.feeType);

//   const merged = [...filteredTemplateFees];

//   cleanedAdditionalFees.forEach((fee) => {
//     const existingIndex = merged.findIndex(
//       (item) => item.feeType.toLowerCase() === fee.feeType.toLowerCase()
//     );

//     if (existingIndex >= 0) {
//       merged[existingIndex] = fee;
//     } else {
//       merged.push(fee);
//     }
//   });

//   const totalAmount = merged.reduce(
//     (sum, fee) => sum + Number(fee.amount || 0),
//     0
//   );

//   return {
//     fees: merged,
//     totalAmount,
//   };
// };

// const validateReferences = async ({
//   academicUnitId,
//   sessionId,
//   termId,
//   classId,
//   armId,
//   feeTemplateId,
// }) => {
//   const [academicUnit, session, term, cls] = await Promise.all([
//     AcademicUnit.findById(academicUnitId),
//     Session.findById(sessionId),
//     Term.findById(termId),
//     Class.findById(classId),
//   ]);

//   if (!academicUnit) {
//     const error = new Error("Academic unit not found");
//     error.statusCode = 404;
//     throw error;
//   }

//   if (!session) {
//     const error = new Error("Session not found");
//     error.statusCode = 404;
//     throw error;
//   }

//   if (!term) {
//     const error = new Error("Term not found");
//     error.statusCode = 404;
//     throw error;
//   }

//   if (!cls) {
//     const error = new Error("Class not found");
//     error.statusCode = 404;
//     throw error;
//   }

//   if (String(cls.academicUnitId) !== String(academicUnitId)) {
//     const error = new Error("Selected class does not belong to this academic unit");
//     error.statusCode = 400;
//     throw error;
//   }

//   if (armId) {
//     const arm = await Arm.findById(armId);

//     if (!arm) {
//       const error = new Error("Arm not found");
//       error.statusCode = 404;
//       throw error;
//     }

//     if (String(arm.class) !== String(classId)) {
//       const error = new Error("Selected arm does not belong to this class");
//       error.statusCode = 400;
//       throw error;
//     }
//   }

//   if (feeTemplateId) {
//     const template = await FeeTemplate.findById(feeTemplateId);

//     if (!template) {
//       const error = new Error("Fee template not found");
//       error.statusCode = 404;
//       throw error;
//     }

//     if (String(template.academicUnitId) !== String(academicUnitId)) {
//       const error = new Error("Fee template does not belong to this academic unit");
//       error.statusCode = 400;
//       throw error;
//     }
//   }
// };

// exports.createFeeStructure = async (req, res) => {
//   try {
//     const {
//       academicUnitId,
//       sessionId,
//       termId,
//       classId,
//       armId,
//       studentCategory,
//       feeTemplateId,
//       additionalFees,
//       removedFeeTypes,
//       isPublished,
//       isActive,
//     } = req.body;

//     if (!academicUnitId || !sessionId || !termId || !classId) {
//       return res.status(400).json({
//         message: "Academic unit, session, term, and class are required",
//       });
//     }

//     await validateReferences({
//       academicUnitId,
//       sessionId,
//       termId,
//       classId,
//       armId,
//       feeTemplateId,
//     });

//     const calculated = await calculateEffectiveFees({
//       feeTemplateId,
//       additionalFees,
//       removedFeeTypes,
//     });

//     if (calculated.fees.length === 0) {
//       return res.status(400).json({
//         message: "Fee structure must contain at least one fee",
//       });
//     }

//     const structure = await FeeStructure.create({
//       academicUnitId,
//       sessionId,
//       termId,
//       classId,
//       armId: armId || null,
//       studentCategory: studentCategory || "all",
//       feeTemplateId: feeTemplateId || null,
//       additionalFees: additionalFees || [],
//       removedFeeTypes: removedFeeTypes || [],
//       fees: calculated.fees,
//       totalAmount: calculated.totalAmount,
//       isPublished: isPublished !== undefined ? !!isPublished : true,
//       isActive: isActive !== undefined ? !!isActive : true,
//     });

//     const populated = await FeeStructure.findById(structure._id)
//       .populate("academicUnitId", "name")
//       .populate("sessionId", "name")
//       .populate("termId", "name")
//       .populate("classId", "name")
//       .populate("armId", "name")
//       .populate("feeTemplateId", "name studentCategory")
//       .lean();

//     res.status(201).json(populated);
//   } catch (err) {
//     console.error("Create fee structure error:", err);

//     if (err.code === 11000) {
//       return res.status(400).json({
//         message: "Fee structure already exists for this selection",
//       });
//     }

//     res.status(err.statusCode || 500).json({ message: err.message });
//   }
// };

// exports.getFeeStructures = async (req, res) => {
//   try {
//     const {
//       academicUnitId,
//       sessionId,
//       termId,
//       classId,
//       armId,
//       studentCategory,
//       isPublished,
//       isActive,
//     } = req.query;

//     const filter = {};

//     if (academicUnitId) filter.academicUnitId = academicUnitId;
//     if (sessionId) filter.sessionId = sessionId;
//     if (termId) filter.termId = termId;
//     if (classId) filter.classId = classId;
//     if (armId) filter.armId = armId;
//     if (studentCategory) filter.studentCategory = studentCategory;
//     if (isPublished !== undefined) filter.isPublished = isPublished === "true";
//     if (isActive !== undefined) filter.isActive = isActive === "true";

//     const structures = await FeeStructure.find(filter)
//       .populate("academicUnitId", "name")
//       .populate("sessionId", "name")
//       .populate("termId", "name")
//       .populate("classId", "name")
//       .populate("armId", "name")
//       .populate("feeTemplateId", "name studentCategory")
//       .sort({ createdAt: -1 })
//       .lean();

//     res.json(structures);
//   } catch (err) {
//     console.error("Get fee structures error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.getFeeStructure = async (req, res) => {
//   try {
//     const structure = await FeeStructure.findById(req.params.id)
//       .populate("academicUnitId", "name")
//       .populate("sessionId", "name")
//       .populate("termId", "name")
//       .populate("classId", "name")
//       .populate("armId", "name")
//       .populate("feeTemplateId", "name studentCategory fees")
//       .lean();

//     if (!structure) {
//       return res.status(404).json({ message: "Fee structure not found" });
//     }

//     res.json(structure);
//   } catch (err) {
//     console.error("Get fee structure error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.updateFeeStructure = async (req, res) => {
//   try {
//     const existing = await FeeStructure.findById(req.params.id);

//     if (!existing) {
//       return res.status(404).json({ message: "Fee structure not found" });
//     }

//     const updatedPayload = {
//       academicUnitId: req.body.academicUnitId || existing.academicUnitId,
//       sessionId: req.body.sessionId || existing.sessionId,
//       termId: req.body.termId || existing.termId,
//       classId: req.body.classId || existing.classId,
//       armId:
//         req.body.armId !== undefined
//           ? req.body.armId || null
//           : existing.armId,
//       feeTemplateId:
//         req.body.feeTemplateId !== undefined
//           ? req.body.feeTemplateId || null
//           : existing.feeTemplateId,
//     };

//     await validateReferences(updatedPayload);

//     const additionalFees =
//       req.body.additionalFees !== undefined
//         ? req.body.additionalFees
//         : existing.additionalFees;

//     const removedFeeTypes =
//       req.body.removedFeeTypes !== undefined
//         ? req.body.removedFeeTypes
//         : existing.removedFeeTypes;

//     const calculated = await calculateEffectiveFees({
//       feeTemplateId: updatedPayload.feeTemplateId,
//       additionalFees,
//       removedFeeTypes,
//     });

//     if (calculated.fees.length === 0) {
//       return res.status(400).json({
//         message: "Fee structure must contain at least one fee",
//       });
//     }

//     const updates = {
//       ...updatedPayload,
//       studentCategory:
//         req.body.studentCategory !== undefined
//           ? req.body.studentCategory
//           : existing.studentCategory,
//       additionalFees,
//       removedFeeTypes,
//       fees: calculated.fees,
//       totalAmount: calculated.totalAmount,
//     };

//     if (req.body.isPublished !== undefined) {
//       updates.isPublished = !!req.body.isPublished;
//     }

//     if (req.body.isActive !== undefined) {
//       updates.isActive = !!req.body.isActive;
//     }

//     const structure = await FeeStructure.findByIdAndUpdate(
//       req.params.id,
//       updates,
//       { new: true, runValidators: true }
//     )
//       .populate("academicUnitId", "name")
//       .populate("sessionId", "name")
//       .populate("termId", "name")
//       .populate("classId", "name")
//       .populate("armId", "name")
//       .populate("feeTemplateId", "name studentCategory");

//     res.json(structure);
//   } catch (err) {
//     console.error("Update fee structure error:", err);

//     if (err.code === 11000) {
//       return res.status(400).json({
//         message: "Fee structure already exists for this selection",
//       });
//     }

//     res.status(err.statusCode || 500).json({ message: err.message });
//   }
// };

// exports.deleteFeeStructure = async (req, res) => {
//   try {
//     const structure = await FeeStructure.findByIdAndDelete(req.params.id);

//     if (!structure) {
//       return res.status(404).json({ message: "Fee structure not found" });
//     }

//     res.json({ message: "Fee structure deleted" });
//   } catch (err) {
//     console.error("Delete fee structure error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.recalculateFeeStructure = async (req, res) => {
//   try {
//     const structure = await FeeStructure.findById(req.params.id);

//     if (!structure) {
//       return res.status(404).json({ message: "Fee structure not found" });
//     }

//     const calculated = await calculateEffectiveFees({
//       feeTemplateId: structure.feeTemplateId,
//       additionalFees: structure.additionalFees,
//       removedFeeTypes: structure.removedFeeTypes,
//     });

//     structure.fees = calculated.fees;
//     structure.totalAmount = calculated.totalAmount;

//     await structure.save();

//     res.json({
//       message: "Fee structure recalculated",
//       data: structure,
//     });
//   } catch (err) {
//     console.error("Recalculate fee structure error:", err);
//     res.status(err.statusCode || 500).json({ message: err.message });
//   }
// };


const FeeStructure = require("../../models/fees/FeeStructure");
const FeeTemplate = require("../../models/FeeTemplate");
const AcademicUnit = require("../../models/AcademicUnits");
const Class = require("../../models/Class");
const Arm = require("../../models/Arm");
const Session = require("../../models/Session");
const Term = require("../../models/Term");

const normalizeFeeType = (value) => String(value || "").trim();

const calculateEffectiveFees = async ({
  feeTemplateId,
  additionalFees = [],
  removedFeeTypes = [],
}) => {
  const template = await FeeTemplate.findById(feeTemplateId).lean();

  if (!template) {
    const error = new Error("Fee template not found");
    error.statusCode = 404;
    throw error;
  }

  const removedSet = new Set(
    (removedFeeTypes || []).map((item) =>
      normalizeFeeType(item).toLowerCase()
    )
  );

  const templateFees = (template.fees || [])
    .filter(
      (fee) =>
        !removedSet.has(normalizeFeeType(fee.feeType).toLowerCase())
    )
    .map((fee) => ({
      feeType: normalizeFeeType(fee.feeType),
      amount: Number(fee.amount || 0),
      isCompulsory: fee.isCompulsory !== false,
      appliesOnce: !!fee.appliesOnce,
      description: fee.description || "",
    }));

  const cleanedAdditionalFees = (additionalFees || [])
    .map((fee) => ({
      feeType: normalizeFeeType(fee.feeType),
      amount: Number(fee.amount || 0),
      isCompulsory: fee.isCompulsory !== false,
      appliesOnce: !!fee.appliesOnce,
      description: fee.description || "",
    }))
    .filter((fee) => fee.feeType);

  const merged = [...templateFees];

  cleanedAdditionalFees.forEach((fee) => {
    const index = merged.findIndex(
      (item) => item.feeType.toLowerCase() === fee.feeType.toLowerCase()
    );

    if (index >= 0) {
      merged[index] = fee;
    } else {
      merged.push(fee);
    }
  });

  const totalAmount = merged.reduce(
    (sum, fee) => sum + Number(fee.amount || 0),
    0
  );

  return {
    fees: merged,
    totalAmount,
  };
};

const validateMainReferences = async ({
  academicUnitId,
  sessionId,
  termId,
  classId,
  armId,
}) => {
  const [academicUnit, session, term, cls] = await Promise.all([
    AcademicUnit.findById(academicUnitId),
    Session.findById(sessionId),
    Term.findById(termId),
    Class.findById(classId),
  ]);

  if (!academicUnit) {
    const error = new Error("Academic unit not found");
    error.statusCode = 404;
    throw error;
  }

  if (!session) {
    const error = new Error("Session not found");
    error.statusCode = 404;
    throw error;
  }

  if (!term) {
    const error = new Error("Term not found");
    error.statusCode = 404;
    throw error;
  }

  if (!cls) {
    const error = new Error("Class not found");
    error.statusCode = 404;
    throw error;
  }

  if (String(cls.academicUnitId) !== String(academicUnitId)) {
    const error = new Error("Selected class does not belong to this academic unit");
    error.statusCode = 400;
    throw error;
  }

  if (armId) {
    const arm = await Arm.findById(armId);

    if (!arm) {
      const error = new Error("Arm not found");
      error.statusCode = 404;
      throw error;
    }

    if (String(arm.class) !== String(classId)) {
      const error = new Error("Selected arm does not belong to this class");
      error.statusCode = 400;
      throw error;
    }
  }
};

const validateAndBuildMappings = async ({
  academicUnitId,
  templateMappings = [],
}) => {
  if (!Array.isArray(templateMappings) || templateMappings.length === 0) {
    const error = new Error("At least one template mapping is required");
    error.statusCode = 400;
    throw error;
  }

  const allowedCategories = ["returning", "new_intake", "transfer"];
  const seenCategories = new Set();

  const builtMappings = [];

  for (const mapping of templateMappings) {
    const {
      studentCategory,
      feeTemplateId,
      additionalFees = [],
      removedFeeTypes = [],
    } = mapping;

    if (!allowedCategories.includes(studentCategory)) {
      const error = new Error("Invalid student category in template mapping");
      error.statusCode = 400;
      throw error;
    }

    if (seenCategories.has(studentCategory)) {
      const error = new Error(
        `Duplicate template mapping for ${studentCategory}`
      );
      error.statusCode = 400;
      throw error;
    }

    seenCategories.add(studentCategory);

    if (!feeTemplateId) {
      const error = new Error(`Fee template is required for ${studentCategory}`);
      error.statusCode = 400;
      throw error;
    }

    const template = await FeeTemplate.findById(feeTemplateId).lean();

    if (!template) {
      const error = new Error(`Fee template not found for ${studentCategory}`);
      error.statusCode = 404;
      throw error;
    }

    if (String(template.academicUnitId) !== String(academicUnitId)) {
      const error = new Error(
        `Fee template for ${studentCategory} does not belong to this academic unit`
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      template.studentCategory !== "all" &&
      template.studentCategory !== studentCategory
    ) {
      const error = new Error(
        `Selected template does not match ${studentCategory} category`
      );
      error.statusCode = 400;
      throw error;
    }

    const calculated = await calculateEffectiveFees({
      feeTemplateId,
      additionalFees,
      removedFeeTypes,
    });

    if (calculated.fees.length === 0) {
      const error = new Error(
        `Template mapping for ${studentCategory} must contain at least one effective fee`
      );
      error.statusCode = 400;
      throw error;
    }

    builtMappings.push({
      studentCategory,
      feeTemplateId,
      additionalFees: additionalFees || [],
      removedFeeTypes: removedFeeTypes || [],
      fees: calculated.fees,
      totalAmount: calculated.totalAmount,
    });
  }

  return builtMappings;
};

exports.createFeeStructure = async (req, res) => {
  try {
    const {
      academicUnitId,
      sessionId,
      termId,
      classId,
      armId,
      templateMappings,
      isPublished,
      isActive,
    } = req.body;

    if (!academicUnitId || !sessionId || !termId || !classId) {
      return res.status(400).json({
        message: "Academic unit, session, term, and class are required",
      });
    }

    await validateMainReferences({
      academicUnitId,
      sessionId,
      termId,
      classId,
      armId,
    });

    const builtMappings = await validateAndBuildMappings({
      academicUnitId,
      templateMappings,
    });

    const structure = await FeeStructure.create({
      academicUnitId,
      sessionId,
      termId,
      classId,
      armId: armId || null,
      templateMappings: builtMappings,
      isPublished: isPublished !== undefined ? !!isPublished : true,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    const populated = await FeeStructure.findById(structure._id)
      .populate("academicUnitId", "name")
      .populate("sessionId", "name")
      .populate("termId", "name")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("templateMappings.feeTemplateId", "name studentCategory")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create fee structure error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Fee structure already exists for this academic unit/class/arm/session/term",
      });
    }

    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

exports.getFeeStructures = async (req, res) => {
  try {
    const {
      academicUnitId,
      sessionId,
      termId,
      classId,
      armId,
      isPublished,
      isActive,
    } = req.query;

    const filter = {};

    if (academicUnitId) filter.academicUnitId = academicUnitId;
    if (sessionId) filter.sessionId = sessionId;
    if (termId) filter.termId = termId;
    if (classId) filter.classId = classId;
    if (armId) filter.armId = armId;
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const structures = await FeeStructure.find(filter)
      .populate("academicUnitId", "name")
      .populate("sessionId", "name")
      .populate("termId", "name")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("templateMappings.feeTemplateId", "name studentCategory")
      .sort({ createdAt: -1 })
      .lean();

    res.json(structures);
  } catch (err) {
    console.error("Get fee structures error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.findById(req.params.id)
      .populate("academicUnitId", "name")
      .populate("sessionId", "name")
      .populate("termId", "name")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("templateMappings.feeTemplateId", "name studentCategory fees")
      .lean();

    if (!structure) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    res.json(structure);
  } catch (err) {
    console.error("Get fee structure error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const existing = await FeeStructure.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    const payload = {
      academicUnitId: req.body.academicUnitId || existing.academicUnitId,
      sessionId: req.body.sessionId || existing.sessionId,
      termId: req.body.termId || existing.termId,
      classId: req.body.classId || existing.classId,
      armId:
        req.body.armId !== undefined
          ? req.body.armId || null
          : existing.armId,
    };

    await validateMainReferences(payload);

    const mappingsSource =
      req.body.templateMappings !== undefined
        ? req.body.templateMappings
        : existing.templateMappings;

    const builtMappings = await validateAndBuildMappings({
      academicUnitId: payload.academicUnitId,
      templateMappings: mappingsSource,
    });

    const updates = {
      ...payload,
      templateMappings: builtMappings,
    };

    if (req.body.isPublished !== undefined) {
      updates.isPublished = !!req.body.isPublished;
    }

    if (req.body.isActive !== undefined) {
      updates.isActive = !!req.body.isActive;
    }

    const structure = await FeeStructure.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("academicUnitId", "name")
      .populate("sessionId", "name")
      .populate("termId", "name")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("templateMappings.feeTemplateId", "name studentCategory");

    res.json(structure);
  } catch (err) {
    console.error("Update fee structure error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Fee structure already exists for this academic unit/class/arm/session/term",
      });
    }

    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

exports.deleteFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.findByIdAndDelete(req.params.id);

    if (!structure) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    res.json({ message: "Fee structure deleted" });
  } catch (err) {
    console.error("Delete fee structure error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.recalculateFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);

    if (!structure) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    const rebuiltMappings = await validateAndBuildMappings({
      academicUnitId: structure.academicUnitId,
      templateMappings: structure.templateMappings,
    });

    structure.templateMappings = rebuiltMappings;
    await structure.save();

    const populated = await FeeStructure.findById(structure._id)
      .populate("academicUnitId", "name")
      .populate("sessionId", "name")
      .populate("termId", "name")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("templateMappings.feeTemplateId", "name studentCategory")
      .lean();

    res.json({
      message: "Fee structure recalculated",
      data: populated,
    });
  } catch (err) {
    console.error("Recalculate fee structure error:", err);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};