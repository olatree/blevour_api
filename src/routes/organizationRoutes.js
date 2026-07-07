const express = require("express");
const router = express.Router();

const { protect, restrictToRoles } = require("../middleware/authMiddleware");

const {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} = require("../controllers/organizationController");

router.use(protect);
router.use(restrictToRoles("master_admin", "super_admin", "admin"));

router.post("/", createOrganization);
router.get("/", getOrganizations);
router.get("/:id", getOrganization);
router.put("/:id", updateOrganization);
router.delete("/:id", deleteOrganization);

module.exports = router;