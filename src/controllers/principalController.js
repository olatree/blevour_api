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
const uploadToCloudinary = async (fileBuffer, folder = "principals") => {
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
const createPrincipal = async (req, res) => {
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

    // Create principal — password hashing handled by User model's pre('save') hook
    const principal = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "principal",
      picture: pictureUrl,
      signature: signatureUrl,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      principal: {
        _id: principal._id,
        name: principal.name,
        email: principal.email,
        userId: principal.userId,
        phone: principal.phone,
        picture: principal.picture,
        signature: principal.signature,
        isActive: principal.isActive,
      },
    });
  } catch (error) {
    console.error("Create Principal error:", error);
    res.status(500).json({ message: "Error creating principal", error: error.message });
  }
};

// UPDATE PRINCIPAL (for Edit form)
// Uses findById + save() instead of findByIdAndUpdate so the User model's
// pre('save') password-hashing hook actually runs. findByIdAndUpdate is a
// query helper and does NOT trigger document middleware, which was why
// passwords were being saved in plain text on edit.
const updatePrincipal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, password, isActive } = req.body;

    const principal = await User.findById(id).select("+password");

    if (!principal) {
      return res.status(404).json({ message: "Principal not found" });
    }

    if (name !== undefined) principal.name = name.trim();
    if (phone !== undefined) principal.phone = phone;
    if (isActive !== undefined) {
      principal.isActive = isActive === "true" || isActive === true;
    }

    // Only update password if provided — hook hashes it on save()
    if (password && password.trim() !== "") {
      principal.password = password.trim();
    }

    // Handle new image uploads (optional — old ones stay if not replaced)
    if (req.files) {
      if (req.files.picture) {
        const result = await uploadToCloudinary(req.files.picture[0].buffer, "pictures");
        principal.picture = result.url;
      }
      if (req.files.signature) {
        const result = await uploadToCloudinary(req.files.signature[0].buffer, "signatures");
        principal.signature = result.url;
      }
    }

    await principal.save();

    res.json({
      success: true,
      principal: {
        _id: principal._id,
        name: principal.name,
        email: principal.email,
        userId: principal.userId,
        phone: principal.phone,
        picture: principal.picture,
        signature: principal.signature,
        isActive: principal.isActive,
      },
    });
  } catch (error) {
    console.error("Update Principal error:", error);
    res.status(500).json({ message: "Error updating principal", error: error.message });
  }
};

// Get all Principals
const getPrincipals = async (req, res) => {
  try {
    const principals = await User.find({ role: { $in: ["principal"] } }).select(
      "-password"
    );
    res.json(principals);
  } catch (err) {
    console.error("Error fetching principals:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete Principal
const deletePrincipal = async (req, res) => {
  try {
    const principal = await User.findById(req.params.id);
    if (!principal) return res.status(404).json({ message: "Principal not found" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Principal deleted" });
  } catch (err) {
    console.error("Error deleting Principal:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPrincipal, getPrincipals, updatePrincipal, deletePrincipal };