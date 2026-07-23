// // server/src/routes/promotionRoutes.js
// const express = require("express");
// const router = express.Router();

// const { promoteOrRepeatStudents } = require("../controllers/PromotionController");
// const { protect, restrictToRoles } = require("../middleware/authMiddleware");

// router.post(
//   "/",
//   protect,
//   restrictToRoles("admin", "super_admin", "master_admin", "principal"),
//   promoteOrRepeatStudents
// );

// module.exports = router;

// server/src/routes/promotionRoutes.js
const express = require("express");
const router = express.Router();

const {
  promoteOrRepeatStudents,
  rollbackPromotionAudit,
  rollbackPromotionBatch,
  editPromotionAudit,
  getPromotionBatches,
  getPromotionBatchDetail,
} = require("../controllers/PromotionController");

// adjust to your existing auth middleware name/path
// I don tire ooo
// const { protect, authorize } = require("../middleware/authMiddleware");
const { protect, restrictToRoles } = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher"),
  promoteOrRepeatStudents
);

router.get(
  "/batches",
  protect,
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher"),
  getPromotionBatches
);

router.get(
  "/batches/:batchId",
  protect,
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher"),
  getPromotionBatchDetail
);

router.post(
  "/batches/:batchId/rollback",
  protect,
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher"),
  rollbackPromotionBatch
);

router.post(
  "/audits/:auditId/rollback",
  protect,
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher"),
  rollbackPromotionAudit
);

router.patch(
  "/audits/:auditId",
  protect,
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher"),
  editPromotionAudit
);

module.exports = router;