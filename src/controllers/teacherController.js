

// // server/controllers/teacherController.js
// const User = require("../models/User");
// const bcryptjs = require("bcryptjs");
// const cloudinary = require("cloudinary").v2;

// // Configure cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });


// // Helper: Upload image to Cloudinary and return secure URL
// const uploadToCloudinary = async (fileBuffer, folder = "teachers") => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream(
//         { folder: `school-app/${folder}`, resource_type: "image" },
//         (error, result) => {
//           if (error) return reject(error);
//           resolve({
//             url: result.secure_url,
//             public_id: result.public_id,
//           });
//         }
//       )
//       .end(fileBuffer);
//   });
// };

// // CREATE TEACHER
// exports.createTeacher = async (req, res) => {
//   try {
//     const { name, email, password, phone, isClassTeacher } = req.body;

//     // Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Name, email, and password are required" });
//     }

//     // Handle file uploads
//     let pictureUrl = null;
//     let signatureUrl = null;

//     if (req.files) {
//       if (req.files.picture) {
//         const pictureResult = await uploadToCloudinary(req.files.picture[0].buffer, "pictures");
//         pictureUrl = pictureResult.url;
//       }
//       if (req.files.signature) {
//         const sigResult = await uploadToCloudinary(req.files.signature[0].buffer, "signatures");
//         signatureUrl = sigResult.url;
//       }
//     }

//     // Create teacher
//     const teacher = await User.create({
//       name,
//       email,
//       password,
//       phone: phone || "",
//       role: "teacher", // or allow "class_teacher" if needed
//       picture: pictureUrl,
//       signature: signatureUrl,
//       isClassTeacher: isClassTeacher === "true" || isClassTeacher === true,
//       isActive: true,
//     });

//     res.status(201).json({
//       success: true,
//       teacher: {
//         _id: teacher._id,
//         name: teacher.name,
//         email: teacher.email,
//         userId: teacher.userId,
//         phone: teacher.phone,
//         picture: teacher.picture,
//         signature: teacher.signature,
//         isClassTeacher: teacher.isClassTeacher,
//         isActive: teacher.isActive,
//       },
//     });
//   } catch (error) {
//     console.error("Create Teacher error:", error);
//     res.status(500).json({ message: "Error creating teacher", error: error.message });
//   }
// };

// // UPDATE TEACHER (for Edit form)
// exports.updateTeacher = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, email, phone, password, isClassTeacher, isActive } = req.body;

//     const updates = {
//       name,
//       email,
//       phone: phone || "",
//       isClassTeacher: isClassTeacher === "true" || isClassTeacher === true,
//       isActive: isActive === "true" || isActive === true,
//     };

//     // Only update password if provided
//     if (password && password.trim() !== "") {
//       updates.password = password;
//     }

//     // Handle new image uploads (optional — old ones stay if not replaced)
//     if (req.files) {
//       if (req.files.picture) {
//         const result = await uploadToCloudinary(req.files.picture[0].buffer, "pictures");
//         updates.picture = result.url;
//       }
//       if (req.files.signature) {
//         const result = await uploadToCloudinary(req.files.signature[0].buffer, "signatures");
//         updates.signature = result.url;
//       }
//     }

//     const teacher = await User.findByIdAndUpdate(id, updates, { new: true });

//     if (!teacher) {
//       return res.status(404).json({ message: "Teacher not found" });
//     }

//     res.json({
//       success: true,
//       teacher,
//     });
//   } catch (error) {
//     console.error("Update Teacher error:", error);
//     res.status(500).json({ message: "Error updating teacher", error: error.message });
//   }
// };

// // ✅ Create teacher
// // exports.createTeacher = async (req, res) => {
// //   try {
// //     // Force role to "teacher" if not explicitly set
// //     const teacherData = { ...req.body, role: req.body.role || "teacher" };

// //     const teacher = await User.create(teacherData);
// //     res.status(201).json(teacher);
// //     console.log("Created teacher:", teacher);
// //   } catch (error) {
// //     console.error("Create Teacher error:", error);
// //     res.status(500).json({ message: "Error creating teacher", error });
// //   }
// // };


// // ✅ Get all teachers
// exports.getTeachers = async (req, res) => {
//   try {
//     const teachers = await User.find({ role: { $in: ["teacher", "class_teacher"] } })
//       .populate("subjects", "name")
//       .populate("classes", "name")
//       .populate("classTeacherOf", "name");

//     res.json(teachers);
//   } catch (err) {
//     console.error("Get Teachers error:", err);
//     res.status(500).json({ message: "Error fetching teachers", err });
//   }
// };

// // ✅ Get teacher by ID
// exports.getTeacherById = async (req, res) => {
//   try {
//     const teacher = await User.findOne({ _id: req.params.id, role: { $in: ["teacher", "class_teacher"] } })
//       .populate("subjects", "name")
//       .populate("classes", "name")
//       .populate("classTeacherOf", "name");

//     if (!teacher) return res.status(404).json({ message: "Teacher not found" });
//     res.json(teacher);
//   } catch (error) {
//     console.error("Get Teacher by ID error:", error);
//     res.status(500).json({ message: "Error fetching teacher", error });
//   }
// };


// // ✅ Delete teacher
// exports.deleteTeacher = async (req, res) => {
//   try {
//     const teacher = await User.findOneAndDelete({ _id: req.params.id, role: { $in: ["teacher", "class_teacher"] } });

//     if (!teacher) return res.status(404).json({ message: "Teacher not found" });
//     res.json({ message: "Teacher deleted successfully" });
//   } catch (error) {
//     console.error("Delete Teacher error:", error);
//     res.status(500).json({ message: "Error deleting teacher", error });
//   }
// };



// server/controllers/teacherController.js
const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (fileBuffer, folder = "teachers") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: `school-app/${folder}`, resource_type: "image" },
        (error, result) => {
          if (error) return reject(error);

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      )
      .end(fileBuffer);
  });
};

// CREATE TEACHER
exports.createTeacher = async (req, res) => {
  try {
    const {
      academicUnitId,
      name,
      email,
      password,
      phone,
      isClassTeacher,
      isActive,
    } = req.body;

    if (!academicUnitId || !name || !email || !password) {
      return res.status(400).json({
        message: "Academic unit, name, email, and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    let pictureUrl = null;
    let signatureUrl = null;

    if (req.files) {
      if (req.files.picture) {
        const pictureResult = await uploadToCloudinary(
          req.files.picture[0].buffer,
          "pictures"
        );
        pictureUrl = pictureResult.url;
      }

      if (req.files.signature) {
        const sigResult = await uploadToCloudinary(
          req.files.signature[0].buffer,
          "signatures"
        );
        signatureUrl = sigResult.url;
      }
    }

    const teacher = await User.create({
      academicUnitId,
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone || "",
      role: "teacher",
      picture: pictureUrl,
      signature: signatureUrl,
      isClassTeacher: isClassTeacher === "true" || isClassTeacher === true,
      isActive: isActive === "false" ? false : true,
    });

    const populatedTeacher = await User.findById(teacher._id)
      .populate("academicUnitId", "name")
      .select("-password");

    res.status(201).json({
      success: true,
      data: populatedTeacher,
      teacher: populatedTeacher,
    });
  } catch (error) {
    console.error("Create Teacher error:", error);
    res.status(500).json({
      message: "Error creating teacher",
      error: error.message,
    });
  }
};

// UPDATE TEACHER
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      academicUnitId,
      name,
      email,
      phone,
      password,
      isClassTeacher,
      isActive,
    } = req.body;

    const teacher = await User.findOne({
      _id: id,
      role: { $in: ["teacher", "class_teacher"] },
    }).select("+password");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (academicUnitId) teacher.academicUnitId = academicUnitId;
    if (name) teacher.name = name.trim();

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      if (normalizedEmail !== teacher.email) {
        const exists = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: teacher._id },
        });

        if (exists) {
          return res.status(409).json({ message: "Email already exists" });
        }

        teacher.email = normalizedEmail;
      }
    }

    teacher.phone = phone || "";

    if (typeof isClassTeacher !== "undefined") {
      teacher.isClassTeacher =
        isClassTeacher === "true" || isClassTeacher === true;
    }

    if (typeof isActive !== "undefined") {
      teacher.isActive = isActive === "true" || isActive === true;
    }

    if (password && password.trim() !== "") {
      teacher.password = password.trim();
    }

    if (req.files) {
      if (req.files.picture) {
        const result = await uploadToCloudinary(
          req.files.picture[0].buffer,
          "pictures"
        );
        teacher.picture = result.url;
      }

      if (req.files.signature) {
        const result = await uploadToCloudinary(
          req.files.signature[0].buffer,
          "signatures"
        );
        teacher.signature = result.url;
      }
    }

    await teacher.save();

    const populatedTeacher = await User.findById(teacher._id)
      .populate("academicUnitId", "name")
      .populate("subjects", "name")
      .populate("classes", "name")
      .select("-password");

    res.json({
      success: true,
      data: populatedTeacher,
      teacher: populatedTeacher,
    });
  } catch (error) {
    console.error("Update Teacher error:", error);
    res.status(500).json({
      message: "Error updating teacher",
      error: error.message,
    });
  }
};

// GET ALL TEACHERS
exports.getTeachers = async (req, res) => {
  try {
    const { academicUnitId } = req.query;

    const filter = {
      role: { $in: ["teacher", "class_teacher"] },
    };

    if (academicUnitId) {
      filter.academicUnitId = academicUnitId;
    }

    const teachers = await User.find(filter)
      .populate("academicUnitId", "name")
      .populate("subjects", "name")
      .populate("classes", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (err) {
    console.error("Get Teachers error:", err);
    res.status(500).json({
      message: "Error fetching teachers",
      err: err.message,
    });
  }
};

// GET TEACHER BY ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: { $in: ["teacher", "class_teacher"] },
    })
      .populate("academicUnitId", "name")
      .populate("subjects", "name")
      .populate("classes", "name");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Get Teacher by ID error:", error);
    res.status(500).json({
      message: "Error fetching teacher",
      error: error.message,
    });
  }
};

// DELETE TEACHER
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findOneAndDelete({
      _id: req.params.id,
      role: { $in: ["teacher", "class_teacher"] },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Delete Teacher error:", error);
    res.status(500).json({
      message: "Error deleting teacher",
      error: error.message,
    });
  }
};