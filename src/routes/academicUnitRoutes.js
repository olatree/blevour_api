const express = require("express");
const router = express.Router();

const { protect, restrictToRoles } = require("../middleware/authMiddleware");

const {
  createAcademicUnit,
  getAcademicUnits,
  getAcademicUnit,
  updateAcademicUnit,
  deleteAcademicUnit,
} = require("../controllers/academicUnitController");

router.use(protect);

router.use(
  restrictToRoles(
    "master_admin",
    "super_admin",
    "admin",
    "principal",
    "head_teacher"
  )
);

router.post("/", createAcademicUnit);
router.get("/", getAcademicUnits);
router.get("/:id", getAcademicUnit);
router.put("/:id", updateAcademicUnit);
router.delete("/:id", deleteAcademicUnit);

module.exports = router;