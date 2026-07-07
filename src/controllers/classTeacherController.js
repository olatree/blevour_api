
const ClassTeacherAssignment = require("../models/ClassTeacherAssignment");
const User = require("../models/User");
const Class = require("../models/Class");

exports.assignClassTeacher = async (req, res) => {
  try {
    const { academicUnitId, teacherId, classId, armId } = req.body;

    if (!academicUnitId || !teacherId || !classId || !armId) {
      return res.status(400).json({
        message: "Academic unit, class, arm and teacher are required",
      });
    }

    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });

    if (!teacher) {
      return res.status(404).json({ message: "Invalid teacher selected" });
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

    const exists = await ClassTeacherAssignment.findOne({
      academicUnitId,
      classId,
      armId,
    });

    if (exists) {
      return res.status(400).json({
        message: "A teacher is already assigned to this class and arm",
      });
    }

    const assignment = await ClassTeacherAssignment.create({
      academicUnitId,
      teacher: teacherId,
      classId,
      armId,
    });

    const updatedTeacher = await User.findByIdAndUpdate(
      teacherId,
      {
        $set: {
          isClassTeacher: true,
          classTeacherOf: {
            academicUnitId,
            classId,
            armId,
          },
        },
      },
      { new: true, runValidators: true }
    );

    const populated = await ClassTeacherAssignment.findById(assignment._id)
      .populate("academicUnitId", "name")
      .populate("teacher", "name email phone picture signature")
      .populate("classId", "name academicUnitId")
      .populate("armId", "name");

    res.status(201).json({
      message: "Class teacher assigned successfully",
      assignment: populated,
      teacher: updatedTeacher,
    });
  } catch (err) {
    console.error("Assign class teacher error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "A teacher is already assigned to this class and arm",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.getAllClassTeachers = async (req, res) => {
  try {
    const { academicUnitId } = req.query;

    const filter = {};

    if (academicUnitId) {
      filter.academicUnitId = academicUnitId;
    }

    const assignments = await ClassTeacherAssignment.find(filter)
      .populate("academicUnitId", "name")
      .populate("teacher", "name email phone picture signature")
      .populate("classId", "name academicUnitId")
      .populate("armId", "name")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    console.error("Get class teachers error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getClassTeacher = async (req, res) => {
  try {
    const { classId, armId } = req.params;
    const { academicUnitId } = req.query;

    const filter = { classId, armId };

    if (academicUnitId) {
      filter.academicUnitId = academicUnitId;
    }

    const assignment = await ClassTeacherAssignment.findOne(filter)
      .populate("academicUnitId", "name")
      .populate("teacher", "name email phone picture signature")
      .populate("classId", "name academicUnitId")
      .populate("armId", "name");

    if (!assignment) {
      return res.status(404).json({ message: "No teacher assigned" });
    }

    res.json(assignment);
  } catch (err) {
    console.error("Get class teacher error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteClassTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await ClassTeacherAssignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    await assignment.deleteOne();

    // Optional: only reset teacher if they have no other class-teacher assignment
    const remaining = await ClassTeacherAssignment.countDocuments({
      teacher: assignment.teacher,
    });

    if (remaining === 0) {
      await User.findByIdAndUpdate(assignment.teacher, {
        $set: {
          isClassTeacher: false,
          classTeacherOf: null,
        },
      });
    }

    res.json({ message: "Class teacher unassigned successfully" });
  } catch (err) {
    console.error("Delete class teacher error:", err);
    res.status(500).json({ message: "Server error" });
  }
};