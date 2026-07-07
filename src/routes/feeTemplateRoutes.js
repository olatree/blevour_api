const express = require("express");
const router = express.Router();

const { protect, restrictToRoles } = require("../middleware/authMiddleware");

const {
  createFeeTemplate,
  getFeeTemplates,
  getFeeTemplate,
  updateFeeTemplate,
  deleteFeeTemplate,
} = require("../controllers/feeTemplateController");

router.use(protect);

router.use(
  restrictToRoles(
    "admin",
    "super_admin",
    "master_admin",
    "principal"
  )
);

router.post("/", createFeeTemplate);
router.get("/", getFeeTemplates);
router.get("/:id", getFeeTemplate);
router.put("/:id", updateFeeTemplate);
router.delete("/:id", deleteFeeTemplate);

module.exports = router;