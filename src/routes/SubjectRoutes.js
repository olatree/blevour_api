// const express = require("express");
// // const { authMiddleware, authorizeRoles } = require("../middleware/auth");
// const { protect, restrictToRoles } = require("../middleware/authMiddleware");
// const {
//   createSubject,
//   getSubjects,
//   updateSubject,
//   deleteSubject,
//   assignSubjectToTeacher,
//   assignSubjectToClass,
//   getSubjectTeachers,
//   getSubjectClasses,
//   getClassesForSubject,
// } = require("../controllers/SubjectController");

// const router = express.Router();


// // Subject CRUD
// router.post("/", protect, restrictToRoles("super_admin", "master_admin", "principal", "admin"), createSubject);
// router.get("/", getSubjects);
// // Get classes offering a subject
// router.get("/:subjectId/classes", getClassesForSubject);
// router.put("/:id", protect, restrictToRoles("super_admin", "master_admin"), updateSubject);
// router.delete("/:id", protect, restrictToRoles("super_admin", "master_admin"), deleteSubject);

// // Assignments
// router.post("/:id/assign-teacher", protect, restrictToRoles("super_admin", "admin", "master_admin"), assignSubjectToTeacher);
// router.post("/:id/assign-class", protect, restrictToRoles("super_admin", "admin", "master_admin"), assignSubjectToClass);

// router.get("/:id/teachers", protect, restrictToRoles("super_admin", "admin", "master_admin"), getSubjectTeachers);
// router.get("/:id/classes", protect, restrictToRoles("super_admin", "admin", "master_admin"), getSubjectClasses);

// module.exports = router;


const express = require("express");
const { protect, restrictToRoles } = require("../middleware/authMiddleware");

const {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  assignSubjectToTeacher,
  assignSubjectToClass,
  getSubjectTeachers,
  getSubjectClasses,
  getClassesForSubject,
} = require("../controllers/SubjectController");

const router = express.Router();

router.post(
  "/",
  protect,
  restrictToRoles("super_admin", "master_admin", "principal", "admin"),
  createSubject
);

router.get("/", getSubjects);

router.put(
  "/:id",
  protect,
  restrictToRoles("super_admin", "master_admin", "principal", "admin"),
  updateSubject
);

router.delete(
  "/:id",
  protect,
  restrictToRoles("super_admin", "master_admin"),
  deleteSubject
);

router.post(
  "/:id/assign-teacher",
  protect,
  restrictToRoles("super_admin", "admin", "master_admin"),
  assignSubjectToTeacher
);

router.post(
  "/:id/assign-class",
  protect,
  restrictToRoles("super_admin", "admin", "master_admin"),
  assignSubjectToClass
);

router.get(
  "/:id/teachers",
  protect,
  restrictToRoles("super_admin", "admin", "master_admin"),
  getSubjectTeachers
);

// Old SubjectClass records
router.get(
  "/:id/assigned-classes",
  protect,
  restrictToRoles("super_admin", "admin", "master_admin"),
  getSubjectClasses
);

// SubjectAssignment class + arm records
router.get("/:subjectId/classes", getClassesForSubject);

module.exports = router;