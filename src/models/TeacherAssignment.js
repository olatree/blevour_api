const mongoose = require("mongoose");

const teacherAssignmentSchema = new mongoose.Schema(
  {
    academicUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicUnit",
      required: false,
      index: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    arm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Arm",
      required: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  { timestamps: true }
);

teacherAssignmentSchema.index(
  { academicUnitId: 1, teacher: 1, class: 1, arm: 1, subject: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("TeacherAssignment", teacherAssignmentSchema);