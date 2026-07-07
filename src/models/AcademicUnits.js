// src/models/AcademicUnit.js
const mongoose = require("mongoose");

const academicUnitSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: false,
      index: true,
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: false,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Academic unit name is required"],
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

academicUnitSchema.index(
  { schoolId: 1, name: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("AcademicUnit", academicUnitSchema);