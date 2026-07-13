// const { StatusCodes } = require("http-status-codes");
// const asyncHandler = require("../middleware/asyncHandler");
// const User = require("../models/User");

// const allowedAdminRoles = ["admin", "super_admin"];

// const sanitizeUser = (user) => ({
//   _id: user._id,
//   name: user.name,
//   email: user.email,
//   role: user.role,
//   userId: user.userId,
//   isBlocked: user.isBlocked,
//   createdAt: user.createdAt,
//   updatedAt: user.updatedAt,
// });

// // Create Admin
// const createAdmin = asyncHandler(async (req, res) => {
//   const { name, email, password, role } = req.body;

//   if (!name || !email || !password || !role) {
//     res.status(StatusCodes.BAD_REQUEST);
//     throw new Error("Name, email, password and role are required");
//   }

//   if (!allowedAdminRoles.includes(role)) {
//     res.status(StatusCodes.BAD_REQUEST);
//     throw new Error("Invalid admin role");
//   }

//   const normalizedEmail = email.toLowerCase().trim();

//   const exists = await User.findOne({ email: normalizedEmail });

//   if (exists) {
//     res.status(StatusCodes.CONFLICT);
//     throw new Error("Email already exists");
//   }

//   const admin = await User.create({
//     name: name.trim(),
//     email: normalizedEmail,
//     password,
//     role,
//   });

//   res.status(StatusCodes.CREATED).json({
//     success: true,
//     message: "Admin created successfully",
//     data: sanitizeUser(admin),
//   });
// });

// // Get all Admins
// const getAdmins = asyncHandler(async (req, res) => {
//   const admins = await User.find({
//     role: { $in: allowedAdminRoles },
//   }).sort({ createdAt: -1 });

//   res.status(StatusCodes.OK).json({
//     success: true,
//     count: admins.length,
//     data: admins,
//   });
//   console.log("fetched Admins:", admins);
//   ;
// });

// // Update Admin
// const updateAdmin = asyncHandler(async (req, res) => {
//   const { name, email, password, role, isBlocked } = req.body;

//   const admin = await User.findOne({
//     _id: req.params.id,
//     role: { $in: allowedAdminRoles },
//   }).select("+password");

//   if (!admin) {
//     res.status(StatusCodes.NOT_FOUND);
//     throw new Error("Admin not found");
//   }

//   if (email) {
//     const normalizedEmail = email.toLowerCase().trim();

//     if (normalizedEmail !== admin.email) {
//       const exists = await User.findOne({
//         email: normalizedEmail,
//         _id: { $ne: admin._id },
//       });

//       if (exists) {
//         res.status(StatusCodes.CONFLICT);
//         throw new Error("Email already exists");
//       }

//       admin.email = normalizedEmail;
//     }
//   }

//   if (name) admin.name = name.trim();
//   if (password) admin.password = password;

//   if (role) {
//     if (!allowedAdminRoles.includes(role)) {
//       res.status(StatusCodes.BAD_REQUEST);
//       throw new Error("Invalid admin role");
//     }

//     admin.role = role;
//   }

//   if (typeof isBlocked === "boolean") {
//     admin.isBlocked = isBlocked;
//   }

//   await admin.save();

//   res.status(StatusCodes.OK).json({
//     success: true,
//     message: "Admin updated successfully",
//     data: sanitizeUser(admin),
//   });
// });

// // Delete Admin
// const deleteAdmin = asyncHandler(async (req, res) => {
//   const admin = await User.findOne({
//     _id: req.params.id,
//     role: { $in: allowedAdminRoles },
//   });

//   if (!admin) {
//     res.status(StatusCodes.NOT_FOUND);
//     throw new Error("Admin not found");
//   }

//   await admin.deleteOne();

//   res.status(StatusCodes.OK).json({
//     success: true,
//     message: "Admin deleted successfully",
//   });
// });

// module.exports = {
//   createAdmin,
//   getAdmins,
//   updateAdmin,
//   deleteAdmin,
// };

const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");

const allowedAdminRoles = ["admin", "super_admin", "util_admin"];

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  userId: user.userId,
  isBlocked: user.isBlocked,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Create Admin
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Name, email, password and role are required");
  }

  if (!allowedAdminRoles.includes(role)) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Invalid admin role");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const exists = await User.findOne({ email: normalizedEmail });

  if (exists) {
    res.status(StatusCodes.CONFLICT);
    throw new Error("Email already exists");
  }

  const admin = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Admin created successfully",
    data: sanitizeUser(admin),
  });
});

// Get all Admins
const getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({
    role: { $in: allowedAdminRoles },
  }).sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    success: true,
    count: admins.length,
    data: admins,
  });
});

// Update Admin
const updateAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role, isBlocked } = req.body;

  const admin = await User.findOne({
    _id: req.params.id,
    role: { $in: allowedAdminRoles },
  }).select("+password");

  if (!admin) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Admin not found");
  }

  if (email) {
    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail !== admin.email) {
      const exists = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: admin._id },
      });

      if (exists) {
        res.status(StatusCodes.CONFLICT);
        throw new Error("Email already exists");
      }

      admin.email = normalizedEmail;
    }
  }

  if (name) admin.name = name.trim();

  if (password && password.trim()) {
    const salt = await bcrypt.genSalt(12);
    admin.password = await bcrypt.hash(password.trim(), salt);
  }

  if (role) {
    if (!allowedAdminRoles.includes(role)) {
      res.status(StatusCodes.BAD_REQUEST);
      throw new Error("Invalid admin role");
    }

    admin.role = role;
  }

  if (typeof isBlocked === "boolean") {
    admin.isBlocked = isBlocked;
  }

  await admin.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Admin updated successfully",
    data: sanitizeUser(admin),
  });
});

// Delete Admin
const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findOne({
    _id: req.params.id,
    role: { $in: allowedAdminRoles },
  });

  if (!admin) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Admin not found");
  }

  await admin.deleteOne();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Admin deleted successfully",
  });
});

module.exports = {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
};