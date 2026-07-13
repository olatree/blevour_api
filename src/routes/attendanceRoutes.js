
// server/src/routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAttendanceSummary,
  saveAttendanceSummary,
  getStudentAttendance,
} = require("../controllers/attendanceController");

const { protect, restrictToRoles } = require("../middleware/authMiddleware");
const { verifyStudent } = require("../middleware/studentAuth");

// Staff routes
router.get(
  "/summary",
  protect,
  restrictToRoles(
    "teacher",
    "class_teacher",
    "principal",
    "admin",
    "super_admin",
    "master_admin",
    "util_admin"
  ),
  getAttendanceSummary
);

router.post(
  "/summary",
  protect,
  restrictToRoles(
    "teacher",
    "principal",
    "class_teacher",
    "admin",
    "super_admin",
    "master_admin",
    "util_admin"
  ),
  saveAttendanceSummary
);

// Student portal route
router.get("/student/me", verifyStudent, getStudentAttendance);

// Staff lookup route
router.get(
  "/student",
  protect,
  restrictToRoles(
    "teacher",
    "class_teacher",
    "principal",
    "admin",
    "super_admin",
    "master_admin",
    "util_admin"
  ),
  getStudentAttendance
);

module.exports = router;