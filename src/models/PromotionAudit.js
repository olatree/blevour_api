// // server/src/models/PromotionAudit.js
// const mongoose = require("mongoose");

// const editHistorySchema = new mongoose.Schema(
//   {
//     editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
//     previousToClassId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
//     previousToArmId: { type: mongoose.Schema.Types.ObjectId, ref: "Arm" },
//     previousAction: { type: String, enum: ["promote", "repeat"] },
//   },
//   { timestamps: true }
// );

// const promotionAuditSchema = new mongoose.Schema(
//   {
//     batchId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       index: true,
//     },
//     studentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Student",
//       required: true,
//       index: true,
//     },
//     action: {
//       type: String,
//       enum: ["promote", "repeat", "graduate"],
//       required: true,
//     },

//     // Where the student was moving from
//     fromSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
//     fromClassId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
//     fromArmId: { type: mongoose.Schema.Types.ObjectId, ref: "Arm" },
//     fromEnrollmentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Enrollment",
//     },

//     // Where the student moved to (promote/repeat only)
//     toSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
//     toClassId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
//     toArmId: { type: mongoose.Schema.Types.ObjectId, ref: "Arm" },
//     newEnrollmentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Enrollment",
//     },

//     // Snapshot of the student's prior state (graduate only) — needed to roll back safely
//     previousStudentStatus: { type: String, default: null },
//     previousGraduatedAt: { type: Date, default: null },
//     previousGraduatedSessionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Session",
//       default: null,
//     },

//     performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

//     rolledBack: { type: Boolean, default: false },
//     rolledBackAt: { type: Date, default: null },
//     rolledBackBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

//     editHistory: { type: [editHistorySchema], default: [] },
//   },
//   { timestamps: true }
// );

// promotionAuditSchema.index({ batchId: 1, rolledBack: 1 });

// module.exports = mongoose.model("PromotionAudit", promotionAuditSchema);

// server/src/models/PromotionAudit.js
const mongoose = require("mongoose");

const editHistorySchema = new mongoose.Schema(
  {
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    previousToClassId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    previousToArmId: { type: mongoose.Schema.Types.ObjectId, ref: "Arm" },
    previousAction: { type: String, enum: ["promote", "repeat"] },
  },
  { timestamps: true }
);

const promotionAuditSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["promote", "repeat", "graduate"],
      required: true,
    },

    // Where the student was moving from
    fromSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    fromClassId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    fromArmId: { type: mongoose.Schema.Types.ObjectId, ref: "Arm" },
    fromEnrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
    },

    // Where the student moved to (promote/repeat only)
    toSessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    toClassId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    toArmId: { type: mongoose.Schema.Types.ObjectId, ref: "Arm" },
    newEnrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
    },

    // Snapshot of the student's prior state (graduate only) — needed to roll back safely
    previousStudentStatus: { type: String, default: null },
    previousGraduatedAt: { type: Date, default: null },
    previousGraduatedSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },

    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

    rolledBack: { type: Boolean, default: false },
    rolledBackAt: { type: Date, default: null },
    rolledBackBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

    editHistory: { type: [editHistorySchema], default: [] },
  },
  { timestamps: true }
);

promotionAuditSchema.index({ batchId: 1, rolledBack: 1 });

module.exports = mongoose.model("PromotionAudit", promotionAuditSchema);