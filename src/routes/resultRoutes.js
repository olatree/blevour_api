
// routes/resultRoutes.js
const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");
const { verifyStudent } = require("../middleware/studentAuth");
const { protect, restrictToRoles } = require("../middleware/authMiddleware");

router.post("/add-or-update", resultController.addOrUpdateResults);

router.get("/class", resultController.getClassResults);
router.get("/class/all-subjects", resultController.getAllClassResults);

router.get("/student-term", verifyStudent, resultController.getStudentTermResults);
router.get("/student/yearly", resultController.getStudentYearlyResults);

router.delete(
  "/:resultId",
  protect,
  restrictToRoles("admin", "super_admin", "master_admin", "principal"),
  resultController.deleteSingleResult
);

router.get("/by-subject", resultController.getResultsBySubject);

// New admin result lookup routes
router.get("/by-student", resultController.getResultsByStudent);
router.get("/student-profile", resultController.getStudentProfile);

module.exports = router;