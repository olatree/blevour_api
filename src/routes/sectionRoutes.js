const express = require("express");
const router = express.Router();

const { protect, restrictToRoles } = require("../middleware/authMiddleware");

const {
  createSection,
  getSections,
  getSection,
  updateSection,
  deleteSection,
} = require("../controllers/sectionController");

router.use(protect);
router.use(restrictToRoles("master_admin", "super_admin", "admin", "principal"));

router.post("/", createSection);
router.get("/", getSections);
router.get("/:id", getSection);
router.put("/:id", updateSection);
router.delete("/:id", deleteSection);

module.exports = router;