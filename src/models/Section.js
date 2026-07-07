// src/models/Section.js
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: [true, "School is required"],
    },

    name: {
      type: String,
      required: [true, "Section name is required"],
      trim: true,
      // Examples: Nursery, Primary, Junior Secondary, Senior Secondary
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

sectionSchema.index({ schoolId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Section", sectionSchema);