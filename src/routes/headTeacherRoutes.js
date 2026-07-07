// server/routes/headTeacherRoutes.js
const express = require("express");
const multer = require("multer");
const { protect, restrictToRoles } = require("../middleware/authMiddleware");

const {
  createHeadTeacher,
  getHeadTeachers,
  updateHeadTeacher,
  deleteHeadTeacher,
} = require("../controllers/headTeacherController");

const router = express.Router();

// only super_admin can manage head teachers
// router.use(protect, restrictToRoles("super_admin"));

// Important: Use memoryStorage so file is available as buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

router.post(
  "/",
  upload.fields([
    { name: "picture", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  createHeadTeacher
);

router.put(
  "/:id",
  upload.fields([
    { name: "picture", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  updateHeadTeacher
);

// create a new head teacher
// router.post("/", createHeadTeacher);

// view all head teachers
router.get("/", getHeadTeachers);

// update a head teacher (role, name, email, block/unblock)
// router.put("/:id", updateHeadTeacher);

// delete a head teacher
router.delete("/:id", deleteHeadTeacher);

module.exports = router;
