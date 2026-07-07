
// server/controllers/adminController.js
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Upload image to Cloudinary and return secure URL
const uploadToCloudinary = async (fileBuffer, folder = "headteachers") => {
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

// CREATE PRINCIPAL
const createHeadTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Handle file uploads
    let pictureUrl = null;
    let signatureUrl = null;

    if (req.files) {
      if (req.files.picture) {
        const pictureResult = await uploadToCloudinary(req.files.picture[0].buffer, "pictures");
        pictureUrl = pictureResult.url;
      }
      if (req.files.signature) {
        const sigResult = await uploadToCloudinary(req.files.signature[0].buffer, "signatures");
        signatureUrl = sigResult.url;
      }
    }

    // Create head teacher — password hashing handled by User model's pre('save') hook
    const headTeacher = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "head_teacher",
      picture: pictureUrl,
      signature: signatureUrl,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      headTeacher: {
        _id: headTeacher._id,
        name: headTeacher.name,
        email: headTeacher.email,
        userId: headTeacher.userId,
        phone: headTeacher.phone,
        picture: headTeacher.picture,
        signature: headTeacher.signature,
        isActive: headTeacher.isActive,
      },
    });
  } catch (error) {
    console.error("Create Head Teacher error:", error);
    res.status(500).json({ message: "Error creating head teacher", error: error.message });
  }
};

// UPDATE HEAD TEACHER (for Edit form)
// Uses findById + save() instead of findByIdAndUpdate so the User model's
// pre('save') password-hashing hook actually runs. findByIdAndUpdate is a
// query helper and does NOT trigger document middleware, which was why
// passwords were being saved in plain text on edit.
const updateHeadTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, password, isActive } = req.body;

    const headTeacher = await User.findById(id).select("+password");

    if (!headTeacher) {
      return res.status(404).json({ message: "Head Teacher not found" });
    }

    if (name !== undefined) headTeacher.name = name.trim();
    if (phone !== undefined) headTeacher.phone = phone;
    if (isActive !== undefined) {
      headTeacher.isActive = isActive === "true" || isActive === true;
    }

    // Only update password if provided — hook hashes it on save()
    if (password && password.trim() !== "") {
      headTeacher.password = password.trim();
    }

    // Handle new image uploads (optional — old ones stay if not replaced)
    if (req.files) {
      if (req.files.picture) {
        const result = await uploadToCloudinary(req.files.picture[0].buffer, "pictures");
        headTeacher.picture = result.url;
      }
      if (req.files.signature) {
        const result = await uploadToCloudinary(req.files.signature[0].buffer, "signatures");
        headTeacher.signature = result.url;
      }
    }

    await headTeacher.save();

    res.json({
      success: true,
      headTeacher: {
        _id: headTeacher._id,
        name: headTeacher.name,
        email: headTeacher.email,
        userId: headTeacher.userId,
        phone: headTeacher.phone,
        picture: headTeacher.picture,
        signature: headTeacher.signature,
        isActive: headTeacher.isActive,
      },
    });
  } catch (error) {
    console.error("Update Head Teacher error:", error);
    res.status(500).json({ message: "Error updating head teacher", error: error.message });
  }
};

// Get all Head Teachers
const getHeadTeachers = async (req, res) => {
  try {
    const headTeachers = await User.find({ role: { $in: ["head_teacher"] } }).select(
      "-password"
    );
    res.json(headTeachers);
  } catch (err) {
    console.error("Error fetching head teachers:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete Head Teacher
const deleteHeadTeacher = async (req, res) => {
  try {
    const headTeacher = await User.findById(req.params.id);
    if (!headTeacher) return res.status(404).json({ message: "Head Teacher not found" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Head Teacher deleted" });
  } catch (err) {
    console.error("Error deleting Head Teacher:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createHeadTeacher, getHeadTeachers, updateHeadTeacher, deleteHeadTeacher };