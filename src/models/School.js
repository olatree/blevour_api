// src/models/School.js
const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
    },

    name: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
    },

    code: {
      type: String,
      trim: true,
      uppercase: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

schoolSchema.index({ organizationId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("School", schoolSchema);