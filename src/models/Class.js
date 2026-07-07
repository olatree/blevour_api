// // // const mongoose = require("mongoose");

// // // const classSchema = new mongoose.Schema(
// // //   {
// // //     name: { type: String, required: true, unique: true }, // e.g., "JSS 1"
    
// // //   },
// // //   { timestamps: true }
// // // );

// // // module.exports = mongoose.model("Class", classSchema);


// // const mongoose = require("mongoose");

// // const classSchema = new mongoose.Schema(
// //   {
// //       sectionId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Section",
// //       required: [true, "Section is required"],
// //     },

// //     name: {
// //       type: String,
// //       required: true,
// //       unique: true,
// //       trim: true,
// //     },

// //     isGraduatingClass: {
// //       type: Boolean,
// //       default: false,
// //       index: true,
// //     },
// //   },
// //   { timestamps: true }
// // );


// // // Same class name can exist in different sections,
// // // but not twice inside the same section.
// // classSchema.index({ sectionId: 1, name: 1 }, { unique: true });

// // module.exports = mongoose.model("Class", classSchema);

// const mongoose = require("mongoose");

// const classSchema = new mongoose.Schema(
//   {
//     academicUnitId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AcademicUnit",
//       required: false,
//       index: true,
//     },

//     // keep sectionId temporarily if you already added it
//     sectionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Section",
//       required: false,
//       index: true,
//     },

//     name: {
//       type: String,
//       required: [true, "Class name is required"],
//       trim: true,
//     },

//     isGraduatingClass: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },
//   },
//   { timestamps: true }
// );

// // New safe index
// classSchema.index(
//   { academicUnitId: 1, name: 1 },
//   { unique: true, sparse: true }
// );

// module.exports = mongoose.model("Class", classSchema);

const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    academicUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicUnit",
      required: false,
      index: true,
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: false,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },

    isGraduatingClass: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

classSchema.index(
  { academicUnitId: 1, name: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("Class", classSchema);