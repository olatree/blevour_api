
const Result = require("../models/Result");
const Enrollment = require("../models/Enrollment");
const TermReport = require("../models/TermReport");
const ResultPublication = require("../models/ResultPublication");
const Term = require("../models/Term");

const isValidNumber = (val) =>
  val !== undefined && val !== null && val !== "" && !isNaN(Number(val));

const buildEnrollmentFilter = ({ academicUnitId, classId, armId, sessionId }) => {
  const filter = {};

  if (academicUnitId) filter.academicUnitId = academicUnitId;
  if (classId) filter.classId = classId;
  if (armId) filter.armId = armId;
  if (sessionId) filter.sessionId = sessionId;

  return filter;
};

// ----------------------------
// Add or Update Results
// ----------------------------
exports.addOrUpdateResults = async (req, res) => {
  const { subjectId, termId, sessionId, results } = req.body;

  try {
    if (!subjectId || !termId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "subjectId, termId and sessionId are required",
      });
    }

    if (!Array.isArray(results)) {
      return res.status(400).json({
        success: false,
        message: "Results array is required",
      });
    }

    const savedResults = [];

    for (const r of results) {
      const enrollment = await Enrollment.findById(r.enrollmentId).select(
        "academicUnitId classId armId sessionId studentId"
      );

      if (!enrollment) continue;

      let existing = await Result.findOne({
        enrollmentId: r.enrollmentId,
        subjectId,
        termId,
        sessionId,
      });

      if (existing) {
        if (!existing.academicUnitId && enrollment.academicUnitId) {
          existing.academicUnitId = enrollment.academicUnitId;
        }

        if (isValidNumber(r.ca1)) existing.ca1 = Number(r.ca1);
        if (isValidNumber(r.ca2)) existing.ca2 = Number(r.ca2);
        if (isValidNumber(r.ca3)) existing.ca3 = Number(r.ca3);
        if (isValidNumber(r.ca4)) existing.ca4 = Number(r.ca4);
        if (isValidNumber(r.exam)) existing.exam = Number(r.exam);
      } else {
        existing = new Result({
          academicUnitId: enrollment.academicUnitId,
          enrollmentId: r.enrollmentId,
          subjectId,
          termId,
          sessionId,
          ca1: isValidNumber(r.ca1) ? Number(r.ca1) : 0,
          ca2: isValidNumber(r.ca2) ? Number(r.ca2) : 0,
          ca3: isValidNumber(r.ca3) ? Number(r.ca3) : 0,
          ca4: isValidNumber(r.ca4) ? Number(r.ca4) : 0,
          exam: isValidNumber(r.exam) ? Number(r.exam) : 0,
        });
      }

      existing.total =
        Number(existing.ca1 || 0) +
        Number(existing.ca2 || 0) +
        Number(existing.ca3 || 0) +
        Number(existing.ca4 || 0) +
        Number(existing.exam || 0);

      await existing.save();
      savedResults.push(existing);
    }

    res.status(200).json({
      success: true,
      message: "Results saved",
      results: savedResults,
    });
  } catch (error) {
    console.error("addOrUpdateResults error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------------------
// Get Results for a Class
// ----------------------------
exports.getClassResults = async (req, res) => {
  const { academicUnitId, subjectId, termId, sessionId, classId, armId } =
    req.query;

  try {
    const enrollmentFilter = buildEnrollmentFilter({
      academicUnitId,
      classId,
      armId,
      sessionId,
    });

    const enrollments = await Enrollment.find(enrollmentFilter).populate(
      "studentId",
      "name admissionNumber"
    );

    const validEnrollments = enrollments.filter((e) => e.studentId);
    const enrollmentIds = validEnrollments.map((e) => e._id);

    const results = await Result.find({
      enrollmentId: { $in: enrollmentIds },
      subjectId,
      sessionId,
      termId,
    })
      .populate("academicUnitId", "name")
      .populate("subjectId", "name")
      .populate({
        path: "enrollmentId",
        populate: [
          { path: "studentId", select: "name admissionNumber" },
          { path: "classId", select: "name" },
          { path: "armId", select: "name" },
        ],
      });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("getClassResults error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------------------
// Get ALL Results for a Class
// ----------------------------
exports.getAllClassResults = async (req, res) => {
  const { academicUnitId, termId, sessionId, classId, armId } = req.query;

  try {
    const enrollmentFilter = buildEnrollmentFilter({
      academicUnitId,
      classId,
      armId,
      sessionId,
    });

    const enrollments = await Enrollment.find(enrollmentFilter).populate(
      "studentId",
      "name admissionNumber"
    );

    const validEnrollments = enrollments.filter((e) => e.studentId);

    if (!validEnrollments.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const enrollmentIds = validEnrollments.map((e) => e._id);

    const results = await Result.find({
      enrollmentId: { $in: enrollmentIds },
      sessionId,
      termId,
    })
      .populate("academicUnitId", "name")
      .populate("subjectId", "name")
      .populate({
        path: "enrollmentId",
        populate: { path: "studentId", select: "name admissionNumber" },
      });

    const groupedResults = {};

    for (const r of results) {
      if (!r.enrollmentId?.studentId) continue;

      const studentId = r.enrollmentId.studentId._id.toString();

      if (!groupedResults[studentId]) {
        groupedResults[studentId] = {
          student: r.enrollmentId.studentId,
          subjects: [],
        };
      }

      groupedResults[studentId].subjects.push({
        subject: r.subjectId?.name,
        ca1: r.ca1,
        ca2: r.ca2,
        ca3: r.ca3,
        ca4: r.ca4,
        exam: r.exam,
        total: r.total,
        grade: r.grade,
      });
    }

    res.status(200).json({
      success: true,
      count: Object.values(groupedResults).length,
      data: Object.values(groupedResults),
    });
  } catch (error) {
    console.error("getAllClassResults error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------------------
// Get Student Term Results
// ----------------------------
exports.getStudentTermResults = async (req, res) => {
  const { sessionId, termId } = req.query;

  try {
    if (!sessionId || !termId) {
      return res.status(400).json({
        success: false,
        message: "Session and Term are required.",
      });
    }

    if (!req.student) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      req.student.blocked ||
      req.student.archived 
      // req.student.status === "graduated"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view results.",
      });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.student._id,
      sessionId,
    }).select("_id academicUnitId studentId classId armId sessionId")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("academicUnitId", "name");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Student enrollment not found.",
      });
    }

    const academicUnitId =
      enrollment.academicUnitId?._id || enrollment.academicUnitId;

    const publicationFilter = {
      sessionId,
      termId,
      isPublished: true,
    };

    if (academicUnitId) {
      publicationFilter.academicUnitId = academicUnitId;
    }

    const publication = await ResultPublication.findOne( {sessionId, termId, isPublished: true,});

    if (!publication) {
      return res.status(403).json({
        success: false,
        message: "This result has not been published.",
      });
    }

    const { termResults, termAverage } = await Result.computeTermly(
      enrollment._id,
      sessionId,
      termId
    );

    if (!termResults || termResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No results found.",
      });
    }

    const report = await TermReport.findOne({
      enrollmentId: enrollment._id,
      sessionId,
      termId,
    });

    return res.status(200).json({
      success: true,
      results: termResults,
      termAverage,
      classId: enrollment.classId,   // { _id, name } for the SELECTED session
      armId: enrollment.armId,       // { _id, name } for the SELECTED session
      academicUnitId: enrollment.academicUnitId, // NEW
      comments: {
        classTeacher: report?.classTeacherComment || "",
        principal: report?.principalComment || "",
        headTeacher: report?.headTeacherComment || "",
      },
    });
  } catch (err) {
    console.error("getStudentTermResults error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ----------------------------
// Get Student Yearly Results
// ----------------------------
exports.getStudentYearlyResults = async (req, res) => {
  const { enrollmentId, sessionId } = req.query;

  try {
    if (!enrollmentId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Enrollment and Session are required.",
      });
    }

    if (
      req.student?.blocked ||
      req.student?.archived ||
      req.student?.status === "graduated"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view results. Contact the school.",
      });
    }

    const enrollment = await Enrollment.findById(enrollmentId).select(
      "academicUnitId"
    );

    const terms = await Term.find({ sessionId }).select("_id name");

    if (terms.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No terms found for this session.",
      });
    }

    const publicationFilter = {
      sessionId,
      isPublished: true,
    };

    if (enrollment?.academicUnitId) {
      publicationFilter.academicUnitId = enrollment.academicUnitId;
    }

    const publications = await ResultPublication.find(publicationFilter).select(
      "termId"
    );

    const publishedTermIds = publications.map((p) => p.termId.toString());

    const unpublishedTerms = terms.filter(
      (term) => !publishedTermIds.includes(term._id.toString())
    );

    if (unpublishedTerms.length > 0) {
      return res.status(403).json({
        success: false,
        message:
          "Yearly results are not yet available because not all terms have been published.",
        unpublishedTerms: unpublishedTerms.map((t) => t.name),
      });
    }

    const yearlyResult = await Result.computeYearly(enrollmentId, sessionId);

    res.status(200).json({
      success: true,
      data: yearlyResult,
    });
  } catch (error) {
    console.error("Get yearly results error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------------------
// Get Results By Subject
// ----------------------------
exports.getResultsBySubject = async (req, res) => {
  const { academicUnitId, subjectId, classId, armId, sessionId, termId } =
    req.query;

  try {
    const enrollmentFilter = buildEnrollmentFilter({
      academicUnitId,
      classId,
      armId,
      sessionId,
    });

    const enrollments = await Enrollment.find(enrollmentFilter).populate(
      "studentId",
      "name admissionNumber"
    );

    const validEnrollments = enrollments.filter((enroll) => enroll.studentId);

    if (!validEnrollments.length) {
      return res.status(404).json({
        success: false,
        message: "No students enrolled",
      });
    }

    const enrollmentIds = validEnrollments.map((e) => e._id);

    const resultFilter = {
      enrollmentId: { $in: enrollmentIds },
      subjectId,
      sessionId,
      termId,
    };

    if (academicUnitId) resultFilter.academicUnitId = academicUnitId;

    const results = await Result.find(resultFilter);

    const formatted = validEnrollments.map((enroll) => {
      const existing = results.find(
        (r) => r.enrollmentId.toString() === enroll._id.toString()
      );

      return {
        enrollmentId: enroll._id,
        academicUnitId: enroll.academicUnitId,
        student: {
          id: enroll.studentId._id,
          name: enroll.studentId.name,
          admissionNumber: enroll.studentId.admissionNumber,
        },
        subjectId,
        termId,
        sessionId,
        ca1: existing?.ca1 ?? "",
        ca2: existing?.ca2 ?? "",
        ca3: existing?.ca3 ?? "",
        ca4: existing?.ca4 ?? "",
        exam: existing?.exam ?? "",
        total: existing?.total ?? "",
        grade: existing?.grade ?? "",
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("getResultsBySubject error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// ----------------------------
// Get Results By Student
// ----------------------------
exports.getResultsByStudent = async (req, res) => {
  const { studentId, academicUnitId, sessionId, termId } = req.query;

  try {
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const enrollmentFilter = { studentId };
    if (academicUnitId) enrollmentFilter.academicUnitId = academicUnitId;
    if (sessionId) enrollmentFilter.sessionId = sessionId;

    const enrollments = await Enrollment.find(enrollmentFilter)
      .populate("academicUnitId", "name")
      .populate("studentId", "name admissionNumber gender parentContact image")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("sessionId", "name terms")
      .lean();

    if (!enrollments.length) {
      return res.status(404).json({
        success: false,
        message: "No enrollment found for this student",
      });
    }

    const enrollmentIds = enrollments.map((enrollment) => enrollment._id);

    const resultFilter = {
      enrollmentId: { $in: enrollmentIds },
    };

    if (academicUnitId) resultFilter.academicUnitId = academicUnitId;
    if (sessionId) resultFilter.sessionId = sessionId;
    if (termId) resultFilter.termId = termId;

    const results = await Result.find(resultFilter)
      .populate("academicUnitId", "name")
      .populate("subjectId", "name")
      .populate("termId", "name")
      .populate("sessionId", "name")
      .lean();

    const enrollmentMap = new Map(
      enrollments.map((enrollment) => [enrollment._id.toString(), enrollment])
    );

    const grouped = {};

    for (const result of results) {
      const enrollment = enrollmentMap.get(result.enrollmentId.toString());
      if (!enrollment) continue;

      const key = `${result.sessionId?._id || result.sessionId}-${
        result.termId?._id || result.termId
      }`;

      if (!grouped[key]) {
        grouped[key] = {
          academicUnit:
            result.academicUnitId?.name ||
            enrollment.academicUnitId?.name ||
            "N/A",
          session: result.sessionId?.name || enrollment.sessionId?.name || "N/A",
          term: result.termId?.name || "N/A",
          class: enrollment.classId?.name || "N/A",
          arm: enrollment.armId?.name || "N/A",
          subjects: [],
          average: 0,
        };
      }

      // grouped[key].subjects.push({
      //   subject: result.subjectId?.name || "Unknown Subject",
      //   ca1: result.ca1,
      //   ca2: result.ca2,
      //   ca3: result.ca3,
      //   ca4: result.ca4,
      //   exam: result.exam,
      //   total: result.total,
      //   grade: result.grade,
      // });
      grouped[key].subjects.push({
  _id: result._id,
  resultId: result._id,

  subjectId: result.subjectId?._id || result.subjectId,
  subject: result.subjectId?.name || "Unknown Subject",

  ca1: result.ca1,
  ca2: result.ca2,
  ca3: result.ca3,
  ca4: result.ca4,
  exam: result.exam,
  total: result.total,
  grade: result.grade,
});
    }

    const groupedResults = Object.values(grouped).map((group) => {
      const total = group.subjects.reduce(
        (sum, subject) => sum + (Number(subject.total) || 0),
        0
      );

      return {
        ...group,
        average:
          group.subjects.length > 0
            ? Math.round(total / group.subjects.length)
            : 0,
      };
    });

    res.status(200).json({
      success: true,
      totalRecords: results.length,
      data: {
        student: enrollments[0].studentId,
        totalRecords: results.length,
        results: groupedResults,
      },
    });
  } catch (error) {
    console.error("getResultsByStudent error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student results",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// ----------------------------
// Get Student Profile
// ----------------------------
exports.getStudentProfile = async (req, res) => {
  const { studentId, academicUnitId, sessionId } = req.query;

  try {
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const enrollmentFilter = { studentId };
    if (academicUnitId) enrollmentFilter.academicUnitId = academicUnitId;
    if (sessionId) enrollmentFilter.sessionId = sessionId;

    const enrollments = await Enrollment.find(enrollmentFilter)
      .populate("academicUnitId", "name")
      .populate("studentId", "name admissionNumber gender parentContact image")
      .populate("classId", "name")
      .populate("armId", "name")
      .populate("sessionId", "name")
      .lean();

    if (!enrollments.length) {
      return res.status(404).json({
        success: false,
        message: "No enrollment found for this student",
      });
    }

    const enrollmentIds = enrollments.map((enrollment) => enrollment._id);

    const resultFilter = {
      enrollmentId: { $in: enrollmentIds },
    };

    if (academicUnitId) resultFilter.academicUnitId = academicUnitId;

    const results = await Result.find(resultFilter)
      .populate("academicUnitId", "name")
      .populate("subjectId", "name")
      .populate("termId", "name")
      .populate("sessionId", "name")
      .lean();

    const enrollmentMap = new Map(
      enrollments.map((enrollment) => [enrollment._id.toString(), enrollment])
    );

    const history = {};

    for (const result of results) {
      const enrollment = enrollmentMap.get(result.enrollmentId.toString());
      if (!enrollment) continue;

      const unitKey =
        result.academicUnitId?._id?.toString() ||
        enrollment.academicUnitId?._id?.toString() ||
        "unknown-unit";

      const sessionKey =
        result.sessionId?._id?.toString() || result.sessionId?.toString();

      const termKey =
        result.termId?._id?.toString() || result.termId?.toString();

      const historyKey = `${unitKey}-${sessionKey}`;

      if (!history[historyKey]) {
        history[historyKey] = {
          academicUnit:
            result.academicUnitId?.name ||
            enrollment.academicUnitId?.name ||
            "N/A",
          session: result.sessionId?.name || enrollment.sessionId?.name || "N/A",
          class: enrollment.classId?.name || "N/A",
          arm: enrollment.armId?.name || "N/A",
          terms: {},
        };
      }

      if (!history[historyKey].terms[termKey]) {
        history[historyKey].terms[termKey] = {
          term: result.termId?.name || "N/A",
          subjects: [],
          average: 0,
        };
      }

      // history[historyKey].terms[termKey].subjects.push({
      //   subject: result.subjectId?.name || "Unknown Subject",
      //   ca1: result.ca1,
      //   ca2: result.ca2,
      //   ca3: result.ca3,
      //   ca4: result.ca4,
      //   exam: result.exam,
      //   total: result.total,
      //   grade: result.grade,
      // });

      history[historyKey].terms[termKey].subjects.push({
  _id: result._id,
  resultId: result._id,

  subjectId: result.subjectId?._id || result.subjectId,
  subject: result.subjectId?.name || "Unknown Subject",

  ca1: result.ca1,
  ca2: result.ca2,
  ca3: result.ca3,
  ca4: result.ca4,
  exam: result.exam,
  total: result.total,
  grade: result.grade,
});
    }

    const academicHistory = Object.values(history).map((session) => {
      const terms = Object.values(session.terms).map((term) => {
        const total = term.subjects.reduce(
          (sum, subject) => sum + (Number(subject.total) || 0),
          0
        );

        return {
          ...term,
          average:
            term.subjects.length > 0
              ? Math.round(total / term.subjects.length)
              : 0,
        };
      });

      return {
        ...session,
        terms,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        student: enrollments[0].studentId,
        academicHistory,
      },
    });
  } catch (error) {
    console.error("getStudentProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student profile",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};


exports.deleteSingleResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await Result.findByIdAndDelete(resultId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Result deleted successfully",
      deletedResult: result,
    });
  } catch (error) {
    console.error("deleteSingleResult error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};