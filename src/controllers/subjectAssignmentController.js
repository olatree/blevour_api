// // Assign multiple subjects to class+arm
// exports.assignSubject = async (req, res) => {
//   try {
//     const { classId, armId, subjectIds } = req.body; // array of IDs

//     if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
//       return res.status(400).json({ message: "No subjects provided" });
//     }

//     const createdAssignments = [];

//     for (const subjectId of subjectIds) {
//       const exists = await SubjectAssignment.findOne({ 
//         class: classId, 
//         arm: armId, 
//         subject: subjectId 
//       });

//       if (!exists) {
//         const assignment = new SubjectAssignment({ class: classId, arm: armId, subject: subjectId });
//         await assignment.save();
//         createdAssignments.push(assignment);
//       }
//     }

//     if (createdAssignments.length === 0) {
//       return res.status(400).json({ message: "All selected subjects already assigned" });
//     }

//     res.status(201).json(createdAssignments);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// // Get subjects for a class+arm
// exports.getSubjectsForArm = async (req, res) => {
//   try {
//     const { classId, armId } = req.params;

//     const subjects = await SubjectAssignment.find({ class: classId, arm: armId }).populate("subject", "name");

//     res.json(subjects);
//     // res.json(subjects.map(s => s.subject));
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get all subject assignments for a class+arm
// // exports.getAssignments = async (req, res) => {
// // exports.getSubjectsForArm = async (req, res) => {
// //   try {
// //     const { classId, armId } = req.query;

// //     const subjects = await SubjectAssignment.find({ class: classId, arm: armId })
// //       .populate("subject", "name"); // 👈 only bring the subject name

// //     res.json(subjects);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // Remove subject from class+arm
// exports.removeSubject = async (req, res) => {
//   try {
//     const { assignmentId } = req.params;

//     await SubjectAssignment.findByIdAndDelete(assignmentId);

//     res.json({ message: "Subject removed from class/arm" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



const SubjectAssignment = require("../models/SubjectAssignment");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// Assign multiple subjects to class+arm
exports.assignSubject = async (req, res) => {
  try {
    const { academicUnitId, classId, armId, subjectIds } = req.body;

    if (!academicUnitId) {
      return res.status(400).json({ message: "Academic unit is required" });
    }

    if (!classId || !armId) {
      return res.status(400).json({ message: "Class and arm are required" });
    }

    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({ message: "No subjects provided" });
    }

    const cls = await Class.findById(classId);

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (String(cls.academicUnitId) !== String(academicUnitId)) {
      return res.status(400).json({
        message: "Selected class does not belong to this academic unit",
      });
    }

    const validSubjects = await Subject.find({
      _id: { $in: subjectIds },
      academicUnitId,
    }).select("_id");

    const validSubjectIds = validSubjects.map((s) => String(s._id));

    if (validSubjectIds.length === 0) {
      return res.status(400).json({
        message: "No valid subjects found for this academic unit",
      });
    }

    const createdAssignments = [];

    for (const subjectId of validSubjectIds) {
      const exists = await SubjectAssignment.findOne({
        academicUnitId,
        class: classId,
        arm: armId,
        subject: subjectId,
      });

      if (!exists) {
        const assignment = await SubjectAssignment.create({
          academicUnitId,
          class: classId,
          arm: armId,
          subject: subjectId,
        });

        createdAssignments.push(assignment);
      }
    }

    if (createdAssignments.length === 0) {
      return res.status(400).json({
        message: "All selected subjects already assigned",
      });
    }

    res.status(201).json(createdAssignments);
  } catch (err) {
    console.error("Assign subject error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Subject already assigned to this class/arm",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

// Get subjects for a class+arm
exports.getSubjectsForArm = async (req, res) => {
  try {
    const { classId, armId } = req.params;
    const { academicUnitId } = req.query;

    const filter = {
      class: classId,
      arm: armId,
    };

    if (academicUnitId) {
      filter.academicUnitId = academicUnitId;
    }

    const subjects = await SubjectAssignment.find(filter)
      .populate("academicUnitId", "name")
      .populate("subject", "name category isCompulsory academicUnitId")
      .populate("class", "name academicUnitId")
      .populate("arm", "name");

    res.json(subjects);
  } catch (err) {
    console.error("Get subjects for arm error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Remove subject from class+arm
exports.removeSubject = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await SubjectAssignment.findByIdAndDelete(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Subject removed from class/arm" });
  } catch (err) {
    console.error("Remove subject error:", err);
    res.status(500).json({ message: err.message });
  }
};