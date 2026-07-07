// // server/src/models/Subject.js
// const mongoose = require("mongoose");

// const subjectSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       unique: true, // e.g., "Mathematics", "English Language"
//     },
//     category: {
//       type: String,
//       enum: ["science", "arts", "commercial", "general"],
//       default: "general",
//     },
//     isCompulsory: {
//       type: Boolean,
//       default: false, // English & Math => true
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Subject", subjectSchema);


const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    academicUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicUnit",
      required: false,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },

    category: {
      type: String,
      enum: ["science", "arts", "commercial", "general"],
      default: "general",
    },

    isCompulsory: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

subjectSchema.index(
  { academicUnitId: 1, name: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("Subject", subjectSchema);