


const Subject = require("../models/Subject");
const SubjectTeacher = require("../models/SubjectTeacher");
const SubjectClass = require("../models/SubjectClass");
const SubjectAssignment = require("../models/SubjectAssignment");
const AcademicUnit = require("../models/AcademicUnits");

// Create Subject
exports.createSubject = async (req, res) => {
  try {
    const { academicUnitId, name, category, isCompulsory } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    if (academicUnitId) {
      const unit = await AcademicUnit.findById(academicUnitId);
      if (!unit) {
        return res.status(404).json({ message: "Academic unit not found" });
      }
    }

    const normalizedName = name.trim();

    const duplicateFilter = academicUnitId
      ? { academicUnitId, name: normalizedName }
      : { name: normalizedName };

    const exists = await Subject.findOne(duplicateFilter);

    if (exists) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    const subject = await Subject.create({
      academicUnitId: academicUnitId || undefined,
      name: normalizedName,
      category: category || "general",
      isCompulsory: !!isCompulsory,
    });

    const populated = await Subject.findById(subject._id)
      .populate("academicUnitId")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create subject error:", err);

    if (err.code === 11000) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    res.status(500).json({ message: err.message });
  }
};

// Get Subjects
// exports.getSubjects = async (req, res) => {
//   try {
//     const { academicUnitId } = req.query;

//     const filter = {};

//     if (academicUnitId) {
//       filter.academicUnitId = academicUnitId;
//     }

//     const subjects = await Subject.find(filter)
//       .populate("academicUnitId")
//       .sort({ name: 1 })
//       .lean();

//     res.json(subjects);
//   } catch (err) {
//     console.error("Get subjects error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.getSubjects = async (req, res) => {
  try {
    const { academicUnitId } = req.query;

    const query = {};

    if (academicUnitId) {
      query.academicUnitId = academicUnitId;
    }

    const subjects = await Subject.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Subject
exports.updateSubject = async (req, res) => {
  try {
    const { academicUnitId, name, category, isCompulsory } = req.body;

    const updates = {};

    if (academicUnitId !== undefined) {
      if (academicUnitId) {
        const unit = await AcademicUnit.findById(academicUnitId);
        if (!unit) {
          return res.status(404).json({ message: "Academic unit not found" });
        }

        updates.academicUnitId = academicUnitId;
      } else {
        updates.$unset = { academicUnitId: "" };
      }
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Subject name is required" });
      }

      updates.name = name.trim();
    }

    if (category !== undefined) updates.category = category;
    if (isCompulsory !== undefined) updates.isCompulsory = !!isCompulsory;

    const subject = await Subject.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("academicUnitId");

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (err) {
    console.error("Update subject error:", err);

    if (err.code === 11000) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    res.status(500).json({ message: err.message });
  }
};

// Delete Subject
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Subject deleted" });
  } catch (err) {
    console.error("Delete subject error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Assign Subject to Teacher
exports.assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const subjectId = req.params.id;

    const exists = await SubjectTeacher.findOne({
      subject: subjectId,
      teacher: teacherId,
    });

    if (exists) {
      return res.status(400).json({ message: "Already assigned" });
    }

    const record = await SubjectTeacher.create({
      subject: subjectId,
      teacher: teacherId,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all classes with arms offering a subject
exports.getClassesForSubject = async (req, res) => {
  const { subjectId } = req.params;

  try {
    const assignments = await SubjectAssignment.find({ subject: subjectId })
      .populate("class")
      .populate("arm");

    if (!assignments.length) {
      return res.status(404).json({
        error: "No classes found for this subject",
      });
    }

    const classMap = {};

    assignments.forEach((a) => {
      if (!a.class) return;

      if (!classMap[a.class._id]) {
        classMap[a.class._id] = {
          classId: a.class._id,
          className: a.class.name,
          arms: [],
        };
      }

      if (a.arm) {
        classMap[a.class._id].arms.push({
          armId: a.arm._id,
          armName: a.arm.name,
        });
      }
    });

    res.status(200).json(Object.values(classMap));
  } catch (error) {
    console.error("getClassesForSubject error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Assign Subject to Class
exports.assignSubjectToClass = async (req, res) => {
  try {
    const { classId } = req.body;
    const subjectId = req.params.id;

    const exists = await SubjectClass.findOne({
      subject: subjectId,
      class: classId,
    });

    if (exists) {
      return res.status(400).json({ message: "Already assigned" });
    }

    const record = await SubjectClass.create({
      subject: subjectId,
      class: classId,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Teachers of a Subject
exports.getSubjectTeachers = async (req, res) => {
  try {
    const records = await SubjectTeacher.find({
      subject: req.params.id,
    }).populate("teacher");

    res.json(records.map((r) => r.teacher).filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Classes of a Subject
exports.getSubjectClasses = async (req, res) => {
  try {
    const records = await SubjectClass.find({
      subject: req.params.id,
    }).populate("class");

    res.json(records.map((r) => r.class).filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


