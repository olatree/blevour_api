
// src/routes/lessonRoutes.js
const express = require("express");
const multer = require("multer");

const {
  createLesson,
  getLessons,
  getLesson,
  updateLesson,
  deleteLesson,
  getStudentLessons,
  addLessonResources,
  removeLessonResource,
  updateLessonStatus,
  getStudentLesson,
  downloadLessonResource,
} = require("../controllers/lessonController");


const { protect, restrictToRoles } = require("../middleware/authMiddleware");
const { verifyStudent } = require("../middleware/studentAuth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

router.get("/student/:id", verifyStudent, getStudentLesson);
router.get("/student", verifyStudent, getStudentLessons);
router.get(
  "/student/:lessonId/resources/:resourceId/download",
  verifyStudent,
  downloadLessonResource
);

router.use(protect);

router.get(
  "/",
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher", "teacher", "util_admin"),
  getLessons
);

router.post(
  "/",
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher", "teacher", "util_admin"),
  upload.array("files", 10),
  createLesson
);

router.get(
  "/:id",
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher", "teacher"),
  getLesson
);

router.put(
  "/:id",
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher", "teacher", "util_admin"),
  updateLesson
);

router.patch(
  "/:id/status",
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher", "teacher", "util_admin"),
  updateLessonStatus
);

router.post(
  "/:id/resources",
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher", "teacher"),
  upload.array("files", 10),
  addLessonResources
);

router.delete(
  "/:lessonId/resources/:resourceId",
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher", "teacher", "util_admin"),
  removeLessonResource
);

router.delete(
  "/:id",
  restrictToRoles("admin", "super_admin", "master_admin", "principal", "head_teacher", "teacher", "util_admin"),
  deleteLesson
);

module.exports = router;