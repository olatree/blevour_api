

const FeeAccount = require("../../models/fees/FeeAccount");
const FeeStructure = require("../../models/fees/FeeStructure");

const {
  generateFeeAccountsFromStructure,
  generateSingleStudentFeeAccountFromStructure,
} = require("./services/feeGenerationService");

const {
  syncFeeAccountsFromStructure,
} = require("./services/feeAccountServices");

// ===============================
// GENERATE BULK FEE ACCOUNTS
// ===============================
exports.generateFeeAccounts = async (req, res) => {
  try {
    const result = await generateFeeAccountsFromStructure({
      feeStructureId: req.body.feeStructureId,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Generate fee accounts error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GENERATE SINGLE STUDENT FEE ACCOUNT
// ===============================
exports.generateSingleStudentFeeAccount = async (req, res) => {
  try {
    const result = await generateSingleStudentFeeAccountFromStructure({
      studentId: req.body.studentId,
      feeStructureId: req.body.feeStructureId,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Generate single student fee account error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET FEE ACCOUNTS
// ===============================
exports.getFeeAccounts = async (req, res) => {
  try {
    const {
      academicUnitId,
      sessionId,
      termId,
      classId,
      armId,
      studentId,
      status,
      billingCategory,
      page = 1,
      limit = 25,
    } = req.query;

    const query = {};

    if (academicUnitId) query.academicUnitId = academicUnitId;
    if (sessionId) query.sessionId = sessionId;
    if (termId) query.termId = termId;
    if (classId) query.classId = classId;
    if (armId) query.armId = armId;
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;
    if (billingCategory) query.billingCategory = billingCategory;

    const currentPage = Math.max(Number(page), 1);
    const pageLimit = Math.max(Number(limit), 1);
    const skip = (currentPage - 1) * pageLimit;

    const totalRecords = await FeeAccount.countDocuments(query);

    const accounts = await FeeAccount.find(query)
      .populate("academicUnitId", "name")
      .populate("studentId", "name admissionNumber image")
      .populate("enrollmentId")
      .populate("sessionId", "name")
      .populate("termId", "name")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("feeStructureId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      count: accounts.length,
      totalRecords,
      currentPage,
      totalPages: Math.ceil(totalRecords / pageLimit),
      data: accounts,
    });
  } catch (error) {
    console.error("Get fee accounts error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET SINGLE FEE ACCOUNT
// ===============================
exports.getFeeAccount = async (req, res) => {
  try {
    const account = await FeeAccount.findById(req.params.id)
      .populate("academicUnitId", "name")
      .populate("studentId", "name admissionNumber image gender parentContact")
      .populate("sessionId", "name")
      .populate("termId", "name")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("feeStructureId")
      .populate("previousFeeAccountId");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Fee account not found",
      });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Get fee account error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET STUDENT FEE ACCOUNT
// ===============================
exports.getStudentFeeAccount = async (req, res) => {
  try {
    const { studentId, sessionId, termId } = req.query;

    if (!studentId || !sessionId || !termId) {
      return res.status(400).json({
        success: false,
        message: "studentId, sessionId and termId are required",
      });
    }

    const account = await FeeAccount.findOne({
      studentId,
      sessionId,
      termId,
    })
      .populate("academicUnitId", "name")
      .populate("studentId", "name admissionNumber image gender parentContact")
      .populate("sessionId", "name")
      .populate("termId", "name")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("feeStructureId")
      .populate("previousFeeAccountId");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Fee account not found for this student",
      });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Get student fee account error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET STUDENT REPORT FEE INFO
// // ===============================
// exports.getStudentReportFeeInfo = async (req, res) => {
//   try {
//     const { studentId, sessionId, termId, nextSessionId, nextTermId } = req.query;

//     if (!studentId || !sessionId || !termId) {
//       return res.status(400).json({
//         success: false,
//         message: "studentId, sessionId and termId are required",
//       });
//     }

//     const currentAccount = await FeeAccount.findOne({
//       studentId,
//       sessionId,
//       termId,
//     }).sort({ createdAt: -1 });

//     let nextAccount = null;

//     if (nextSessionId && nextTermId) {
//       nextAccount = await FeeAccount.findOne({
//         studentId,
//         sessionId: nextSessionId,
//         termId: nextTermId,
//       }).sort({ createdAt: -1 });
//     }

//     return res.status(200).json({
//       success: true,
//       data: {
//         currentBalance: Number(currentAccount?.totalDue || 0),
//         nextTermFee: Number(
//           nextAccount?.netPayable ||
//             nextAccount?.totalAmount ||
//             nextAccount?.totalDue ||
//             0
//         ),
//         currentAccountId: currentAccount?._id || null,
//         nextAccountId: nextAccount?._id || null,
//       },
//     });
//   } catch (error) {
//     console.error("Report fee info error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.getStudentReportFeeInfo = async (req, res) => {
  try {
    const { studentId, sessionId, termId, nextSessionId, nextTermId } = req.query;

    if (!studentId || !sessionId || !termId) {
      return res.status(400).json({
        success: false,
        message: "studentId, sessionId and termId are required",
      });
    }

    const currentAccount = await FeeAccount.findOne({
      studentId,
      sessionId,
      termId,
    }).sort({ createdAt: -1 });

    let nextAccount = null;

    if (nextSessionId && nextTermId) {
      nextAccount = await FeeAccount.findOne({
        studentId,
        sessionId: nextSessionId,
        termId: nextTermId,
      }).sort({ createdAt: -1 });
    }

    const currentBalance = Number(currentAccount?.totalDue || 0);

    // Next term fee only, not old outstanding/carryover
    const nextTermFee = Number(nextAccount?.totalAmount || 0);

    return res.status(200).json({
      success: true,
      data: {
        currentBalance,
        nextTermFee,
        currentAccountId: currentAccount?._id || null,
        nextAccountId: nextAccount?._id || null,
      },
    });
  } catch (error) {
    console.error("Report fee info error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// STUDENT PORTAL: GET MY FEE ACCOUNTS
// ===============================
exports.getMyFeeAccounts = async (req, res) => {
  try {
    const { sessionId, termId } = req.query;

    const query = {
      studentId: req.student._id,
    };

    if (sessionId) query.sessionId = sessionId;
    if (termId) query.termId = termId;

    const accounts = await FeeAccount.find(query)
      .populate("academicUnitId", "name")
      .populate("sessionId", "name")
      .populate("termId", "name")
      .populate("classId", "name")
      .populate("armId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    console.error("Get my fee accounts error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.syncFeeAccounts = async (req, res) => {
  try {
    const result = await syncFeeAccountsFromStructure({
      feeStructureId: req.body.feeStructureId,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Sync fee accounts error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};