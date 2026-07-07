// // routes/fees/feeStructureRoutes.js

// const express = require("express");
// const router = express.Router();

// const {
//   createFeeStructure,
//   getFeeStructures,
//   getFeeStructure,
//   updateFeeStructure,
//   deactivateFeeStructure,
// } = require("../../controllers/fees/feeStructureController");

// const {
//   protect,
//   restrictToRoles,
// } = require("../../middleware/authMiddleware");

// const ADMIN_ROLES = [
//   "admin",
//   "super_admin",
//   "master_admin",
// ];

// router.get("/", protect, getFeeStructures);

// router.get("/:id", protect, getFeeStructure);

// router.post(
//   "/",
//   protect,
//   restrictToRoles(...ADMIN_ROLES),
//   createFeeStructure
// );

// router.put(
//   "/:id",
//   protect,
//   restrictToRoles(...ADMIN_ROLES),
//   updateFeeStructure
// );

// router.patch(
//   "/:id/deactivate",
//   protect,
//   restrictToRoles(...ADMIN_ROLES),
//   deactivateFeeStructure
// );

// module.exports = router;

const express = require("express");
const router = express.Router();

const { protect, restrictToRoles } = require("../../middleware/authMiddleware");

const {
  createFeeStructure,
  getFeeStructures,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  recalculateFeeStructure,
} = require("../../controllers/fees/feeStructureController");

router.use(protect);

router.use(
  restrictToRoles("admin", "super_admin", "master_admin", "principal")
);

router.post("/", createFeeStructure);
router.get("/", getFeeStructures);
router.get("/:id", getFeeStructure);
router.put("/:id", updateFeeStructure);
router.patch("/:id/recalculate", recalculateFeeStructure);
router.delete("/:id", deleteFeeStructure);

module.exports = router;