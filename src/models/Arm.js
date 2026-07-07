// const mongoose = require("mongoose");

// const armSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true }, // e.g., "A", "B"
//     class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Arm", armSchema);


const mongoose = require("mongoose");

const armSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Arm name is required"],
      trim: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate arm name inside same class
armSchema.index({ class: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Arm", armSchema);