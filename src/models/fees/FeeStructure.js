// // // src/models/fees/FeeStructure.js

// // const mongoose = require("mongoose");

// // const feeStructureSchema = new mongoose.Schema(
// //   {
// //     sessionId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Session",
// //       required: true,
// //     },

// //     termId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Term",
// //       required: true,
// //     },

// //     classId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Class",
// //       required: true,
// //     },

// //     armId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Arm",
// //       default: null,
// //     },

// //     fees: [
// //       {
// //         feeTypeId: {
// //           type: mongoose.Schema.Types.ObjectId,
// //           ref: "FeeType",
// //           required: true,
// //         },

// //         feeTypeName: {
// //           type: String,
// //           required: true,
// //         },

// //         amount: {
// //           type: Number,
// //           required: true,
// //           min: 0,
// //         },
// //       },
// //     ],

// //     totalAmount: {
// //       type: Number,
// //       default: 0,
// //     },

// //     isActive: {
// //       type: Boolean,
// //       default: true,
// //     },

// //     createdBy: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //     },
// //   },
// //   { timestamps: true }
// // );

// // feeStructureSchema.index(
// //   { sessionId: 1, termId: 1, classId: 1, armId: 1 },
// //   { unique: true }
// // );

// // feeStructureSchema.pre("save", function (next) {
// //   this.totalAmount = this.fees.reduce(
// //     (sum, fee) => sum + Number(fee.amount || 0),
// //     0
// //   );

// //   next();
// // });

// // module.exports =
// //   mongoose.models.FeeStructure ||
// //   mongoose.model("FeeStructure", feeStructureSchema);


// const mongoose = require("mongoose");

// const feeItemSchema = new mongoose.Schema(
//   {
//     feeType: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     isCompulsory: {
//       type: Boolean,
//       default: true,
//     },
//     appliesOnce: {
//       type: Boolean,
//       default: false,
//     },
//     description: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//   },
//   { _id: true }
// );

// const feeStructureSchema = new mongoose.Schema(
//   {
//     academicUnitId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "AcademicUnit",
//       required: true,
//       index: true,
//     },

//     sessionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Session",
//       required: true,
//       index: true,
//     },

//     termId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Term",
//       required: true,
//       index: true,
//     },

//     classId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Class",
//       required: true,
//       index: true,
//     },

//     armId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Arm",
//       default: null,
//       index: true,
//     },

//     studentCategory: {
//       type: String,
//       enum: ["returning", "new_intake", "transfer", "all"],
//       default: "all",
//       index: true,
//     },

//     feeTemplateId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "FeeTemplate",
//       default: null,
//     },

//     additionalFees: {
//       type: [feeItemSchema],
//       default: [],
//     },

//     removedFeeTypes: {
//       type: [String],
//       default: [],
//     },

//     // Final calculated fees copied here for backward compatibility
//     fees: {
//       type: [feeItemSchema],
//       default: [],
//     },

//     totalAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     isPublished: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },
//   },
//   { timestamps: true }
// );

// feeStructureSchema.index(
//   {
//     academicUnitId: 1,
//     sessionId: 1,
//     termId: 1,
//     classId: 1,
//     armId: 1,
//     studentCategory: 1,
//   },
//   { unique: true }
// );

// module.exports = mongoose.model("FeeStructure", feeStructureSchema);


const mongoose = require("mongoose");

const feeItemSchema = new mongoose.Schema(
  {
    feeType: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    isCompulsory: { type: Boolean, default: true },
    appliesOnce: { type: Boolean, default: false },
    description: { type: String, default: "", trim: true },
  },
  { _id: true }
);

const templateMappingSchema = new mongoose.Schema(
  {
    studentCategory: {
      type: String,
      enum: ["returning", "new_intake", "transfer"],
      required: true,
    },

    feeTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeTemplate",
      required: true,
    },

    additionalFees: {
      type: [feeItemSchema],
      default: [],
    },

    removedFeeTypes: {
      type: [String],
      default: [],
    },

    fees: {
      type: [feeItemSchema],
      default: [],
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
);

const feeStructureSchema = new mongoose.Schema(
  {
    academicUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicUnit",
      required: true,
      index: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },

    termId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Term",
      required: true,
      index: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },

    armId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Arm",
      default: null,
      index: true,
    },

    templateMappings: {
      type: [templateMappingSchema],
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

feeStructureSchema.index(
  {
    academicUnitId: 1,
    sessionId: 1,
    termId: 1,
    classId: 1,
    armId: 1,
  },
  { unique: true }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);