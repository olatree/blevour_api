const TeacherAssignment = require("../models/TeacherAssignment");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// Assign multiple subjects
exports.assignSubjects = async (req, res) => {
  try {
    const { academicUnitId, teacherId, classId, armId, subjectIds } = req.body;

    if (
      !academicUnitId ||
      !teacherId ||
      !classId ||
      !armId ||
      !Array.isArray(subjectIds) ||
      subjectIds.length === 0
    ) {
      return res.status(400).json({
        message: "Academic unit, teacher, class, arm and subjects are required",
      });
    }

    const cls = await Class.findById(classId);

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (String(cls.academicUnitId) !== String(academicUnitId)) {
      return res.status(400).json({
        message: "Selected class does not belong to this academic unit",
      });
    }

    const validSubjects = await Subject.find({
      _id: { $in: subjectIds },
      academicUnitId,
    }).select("_id");

    const validSubjectIds = validSubjects.map((s) => String(s._id));

    if (validSubjectIds.length === 0) {
      return res.status(400).json({
        message: "No valid subjects found for this academic unit",
      });
    }

    const assignments = await Promise.all(
      validSubjectIds.map(async (subjectId) => {
        return TeacherAssignment.findOneAndUpdate(
          {
            academicUnitId,
            teacher: teacherId,
            class: classId,
            arm: armId,
            subject: subjectId,
          },
          {
            academicUnitId,
            teacher: teacherId,
            class: classId,
            arm: armId,
            subject: subjectId,
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        );
      })
    );

    res.status(201).json(assignments.filter(Boolean));
  } catch (error) {
    console.error("Assign teacher subjects error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "One or more assignments already exist",
      });
    }

    res.status(500).json({
      message: "Error assigning subjects",
      error: error.message,
    });
  }
};

// Get assignments for a teacher in a class+arm
exports.getAssignments = async (req, res) => {
  try {
    const { teacherId, classId, armId } = req.params;
    const { academicUnitId } = req.query;

    const filter = {
      teacher: teacherId,
      class: classId,
      arm: armId,
    };

    if (academicUnitId) {
      filter.academicUnitId = academicUnitId;
    }

    const assignments = await TeacherAssignment.find(filter)
      .populate("academicUnitId", "name")
      .populate("subject", "name category isCompulsory academicUnitId")
      .populate("class", "name academicUnitId")
      .populate("arm", "name");

    res.json(assignments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching assignments",
      error: error.message,
    });
  }
};

// Delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await TeacherAssignment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment removed" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting assignment",
      error: error.message,
    });
  }
};

// Get all subjects assigned to a teacher
exports.getTeacherSubjects = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { academicUnitId } = req.query;

    const filter = { teacher: teacherId };

    if (academicUnitId) {
      filter.academicUnitId = academicUnitId;
    }

    const assignments = await TeacherAssignment.find(filter)
      .populate("subject", "name academicUnitId")
      .select("subject");

    const uniqueSubjects = [
      ...new Map(
        assignments
          .filter((a) => a.subject)
          .map((a) => [String(a.subject._id), a.subject])
      ).values(),
    ];

    res.json(uniqueSubjects);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching teacher subjects",
      error: err.message,
    });
  }
};

// Get classes for a subject assigned to a teacher
exports.getTeacherClasses = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.params;
    const { academicUnitId } = req.query;

    const filter = {
      teacher: teacherId,
      subject: subjectId,
    };

    if (academicUnitId) {
      filter.academicUnitId = academicUnitId;
    }

    const assignments = await TeacherAssignment.find(filter).populate(
      "class",
      "name academicUnitId"
    );

    const uniqueClasses = [
      ...new Map(
        assignments
          .filter((a) => a.class)
          .map((a) => [String(a.class._id), a.class])
      ).values(),
    ];

    res.json(uniqueClasses);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching teacher classes",
      error: err.message,
    });
  }
};

// Get arms for a subject+class assigned to a teacher
exports.getTeacherArms = async (req, res) => {
  try {
    const { teacherId, subjectId, classId } = req.params;
    const { academicUnitId } = req.query;

    const filter = {
      teacher: teacherId,
      subject: subjectId,
      class: classId,
    };

    if (academicUnitId) {
      filter.academicUnitId = academicUnitId;
    }

    const assignments = await TeacherAssignment.find(filter).populate(
      "arm",
      "name"
    );

    const uniqueArms = [
      ...new Map(
        assignments
          .filter((a) => a.arm)
          .map((a) => [String(a.arm._id), a.arm])
      ).values(),
    ];

    res.json(uniqueArms);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching teacher arms",
      error: err.message,
    });
  }
};