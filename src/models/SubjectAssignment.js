// const mongoose = require("mongoose");

// const subjectAssignmentSchema = new mongoose.Schema({
//   class: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Class",
//     required: true,
//   },
//   arm: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Arm",
//     required: true,
//   },
//   subject: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Subject",
//     required: true,
//   },
// });

// module.exports = mongoose.model("SubjectAssignment", subjectAssignmentSchema);


const mongoose = require("mongoose");

const subjectAssignmentSchema = new mongoose.Schema(
  {
    academicUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicUnit",
      required: false,
      index: true,
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

subjectAssignmentSchema.index(
  { academicUnitId: 1, class: 1, arm: 1, subject: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("SubjectAssignment", subjectAssignmentSchema);