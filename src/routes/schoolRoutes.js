const express = require("express");
const router = express.Router();

const { protect, restrictToRoles } = require("../middleware/authMiddleware");

const {
  createSchool,
  getSchools,
  getSchool,
  updateSchool,
  deleteSchool,
} = require("../controllers/schoolController");

router.use(protect);
router.use(restrictToRoles("master_admin", "super_admin", "admin", "principal"));

router.post("/", createSchool);
router.get("/", getSchools);
router.get("/:id", getSchool);
router.put("/:id", updateSchool);
router.delete("/:id", deleteSchool);

module.exports = router;