const mongoose = require("mongoose");

const feeItemSchema = new mongoose.Schema(
  {
    feeType: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    isCompulsory: {
      type: Boolean,
      default: true,
    },

    appliesOnce: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const feeTemplateSchema = new mongoose.Schema(
  {
    academicUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicUnit",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    studentCategory: {
      type: String,
      enum: ["returning", "new_intake", "transfer", "all"],
      default: "all",
      index: true,
    },

    fees: {
      type: [feeItemSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

feeTemplateSchema.index(
  { academicUnitId: 1, name: 1, studentCategory: 1 },
  { unique: true }
);

module.exports = mongoose.model("FeeTemplate", feeTemplateSchema);