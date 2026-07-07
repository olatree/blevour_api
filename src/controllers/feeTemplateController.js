const FeeTemplate = require("../models/FeeTemplate");
const AcademicUnit = require("../models/AcademicUnits");

exports.createFeeTemplate = async (req, res) => {
  try {
    const { academicUnitId, name, studentCategory, fees, isActive } = req.body;

    if (!academicUnitId) {
      return res.status(400).json({ message: "Academic unit is required" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Template name is required" });
    }

    const unit = await AcademicUnit.findById(academicUnitId);

    if (!unit) {
      return res.status(404).json({ message: "Academic unit not found" });
    }

    const template = await FeeTemplate.create({
      academicUnitId,
      name: name.trim(),
      studentCategory: studentCategory || "all",
      fees: Array.isArray(fees) ? fees : [],
      isActive: isActive !== undefined ? !!isActive : true,
    });

    const populated = await FeeTemplate.findById(template._id)
      .populate("academicUnitId", "name")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create fee template error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Fee template already exists for this academic unit/category",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.getFeeTemplates = async (req, res) => {
  try {
    const { academicUnitId, studentCategory, isActive } = req.query;

    const filter = {};

    if (academicUnitId) filter.academicUnitId = academicUnitId;
    if (studentCategory) filter.studentCategory = studentCategory;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const templates = await FeeTemplate.find(filter)
      .populate("academicUnitId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json(templates);
  } catch (err) {
    console.error("Get fee templates error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getFeeTemplate = async (req, res) => {
  try {
    const template = await FeeTemplate.findById(req.params.id)
      .populate("academicUnitId", "name")
      .lean();

    if (!template) {
      return res.status(404).json({ message: "Fee template not found" });
    }

    res.json(template);
  } catch (err) {
    console.error("Get fee template error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateFeeTemplate = async (req, res) => {
  try {
    const { academicUnitId, name, studentCategory, fees, isActive } = req.body;

    const updates = {};

    if (academicUnitId !== undefined) {
      const unit = await AcademicUnit.findById(academicUnitId);

      if (!unit) {
        return res.status(404).json({ message: "Academic unit not found" });
      }

      updates.academicUnitId = academicUnitId;
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Template name is required" });
      }

      updates.name = name.trim();
    }

    if (studentCategory !== undefined) {
      updates.studentCategory = studentCategory;
    }

    if (fees !== undefined) {
      updates.fees = Array.isArray(fees) ? fees : [];
    }

    if (isActive !== undefined) {
      updates.isActive = !!isActive;
    }

    const template = await FeeTemplate.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("academicUnitId", "name");

    if (!template) {
      return res.status(404).json({ message: "Fee template not found" });
    }

    res.json(template);
  } catch (err) {
    console.error("Update fee template error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Fee template already exists for this academic unit/category",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.deleteFeeTemplate = async (req, res) => {
  try {
    const template = await FeeTemplate.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({ message: "Fee template not found" });
    }

    res.json({ message: "Fee template deleted" });
  } catch (err) {
    console.error("Delete fee template error:", err);
    res.status(500).json({ message: err.message });
  }
};