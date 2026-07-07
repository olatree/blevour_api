const AcademicUnit = require("../models/AcademicUnits");
const Organization = require("../models/Organization");
const School = require("../models/School");

exports.createAcademicUnit = async (req, res) => {
  try {
    const { organizationId, schoolId, name, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Academic unit name is required" });
    }

    if (organizationId) {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
    }

    if (schoolId) {
      const school = await School.findById(schoolId);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
    }

    const academicUnit = await AcademicUnit.create({
      organizationId: organizationId || undefined,
      schoolId: schoolId || undefined,
      name: name.trim(),
      isActive: isActive !== undefined ? !!isActive : true,
    });

    const populated = await AcademicUnit.findById(academicUnit._id)
      .populate("organizationId")
      .populate("schoolId")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create academic unit error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Academic unit already exists under this school",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.getAcademicUnits = async (req, res) => {
  try {
    const { organizationId, schoolId } = req.query;

    const filter = {};

    if (organizationId) filter.organizationId = organizationId;
    if (schoolId) filter.schoolId = schoolId;

    const academicUnits = await AcademicUnit.find(filter)
      .populate("organizationId")
      .populate("schoolId")
      .sort({ name: 1 })
      .lean();

    res.json(academicUnits);
  } catch (err) {
    console.error("Get academic units error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAcademicUnit = async (req, res) => {
  try {
    const academicUnit = await AcademicUnit.findById(req.params.id)
      .populate("organizationId")
      .populate("schoolId");

    if (!academicUnit) {
      return res.status(404).json({ message: "Academic unit not found" });
    }

    res.json(academicUnit);
  } catch (err) {
    console.error("Get academic unit error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateAcademicUnit = async (req, res) => {
  try {
    const { organizationId, schoolId, name, isActive } = req.body;

    const updates = {};

    if (organizationId !== undefined) {
      if (organizationId) {
        const organization = await Organization.findById(organizationId);
        if (!organization) {
          return res.status(404).json({ message: "Organization not found" });
        }
        updates.organizationId = organizationId;
      } else {
        updates.$unset = {
          ...(updates.$unset || {}),
          organizationId: "",
        };
      }
    }

    if (schoolId !== undefined) {
      if (schoolId) {
        const school = await School.findById(schoolId);
        if (!school) {
          return res.status(404).json({ message: "School not found" });
        }
        updates.schoolId = schoolId;
      } else {
        updates.$unset = {
          ...(updates.$unset || {}),
          schoolId: "",
        };
      }
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Academic unit name is required" });
      }
      updates.name = name.trim();
    }

    if (isActive !== undefined) {
      updates.isActive = !!isActive;
    }

    const academicUnit = await AcademicUnit.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("organizationId")
      .populate("schoolId");

    if (!academicUnit) {
      return res.status(404).json({ message: "Academic unit not found" });
    }

    res.json(academicUnit);
  } catch (err) {
    console.error("Update academic unit error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Academic unit already exists under this school",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.deleteAcademicUnit = async (req, res) => {
  try {
    const academicUnit = await AcademicUnit.findByIdAndDelete(req.params.id);

    if (!academicUnit) {
      return res.status(404).json({ message: "Academic unit not found" });
    }

    res.json({ message: "Academic unit deleted" });
  } catch (err) {
    console.error("Delete academic unit error:", err);
    res.status(500).json({ message: err.message });
  }
};