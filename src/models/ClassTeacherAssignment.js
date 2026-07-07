


// const mongoose = require("mongoose");

// const classTeacherAssignmentSchema = new mongoose.Schema(
//   {
//     academicUnitId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AcademicUnit",
//       required: false,
//       index: true,
//     },

//     teacher: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     classId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Class",
//       required: true,
//     },

//     armId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Arm",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // One class teacher per academicUnit + class + arm
// classTeacherAssignmentSchema.index(
//   { academicUnitId: 1, classId: 1, armId: 1 },
//   { unique: true, sparse: true }
// );

// module.exports = mongoose.model(
//   "ClassTeacherAssignment",
//   classTeacherAssignmentSchema
// );


const mongoose = require("mongoose");

const classTeacherAssignmentSchema = new mongoose.Schema(
  {
    academicUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicUnit",
      required: true,
      index: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    armId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Arm",
      required: true,
    },
  },
  { timestamps: true }
);

classTeacherAssignmentSchema.index(
  {
    academicUnitId: 1,
    classId: 1,
    armId: 1,
  },
  { unique: true }
);

module.exports =
  mongoose.models.ClassTeacherAssignment ||
  mongoose.model("ClassTeacherAssignment", classTeacherAssignmentSchema);