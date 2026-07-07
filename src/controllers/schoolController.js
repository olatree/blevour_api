const School = require("../models/School");
const Organization = require("../models/Organization");

exports.createSchool = async (req, res) => {
  try {
    const {
      organizationId,
      name,
      code,
      email,
      phone,
      address,
      isActive,
    } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: "Organization is required" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "School name is required" });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const school = await School.create({
      organizationId,
      name: name.trim(),
      code,
      email,
      phone,
      address,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    const populatedSchool = await School.findById(school._id)
      .populate("organizationId")
      .lean();

    res.status(201).json(populatedSchool);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "School already exists under this organization",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.getSchools = async (req, res) => {
  try {
    const { organizationId } = req.query;

    const filter = {};

    if (organizationId) {
      filter.organizationId = organizationId;
    }

    const schools = await School.find(filter)
      .populate("organizationId")
      .sort({ name: 1 })
      .lean();

    res.json(schools);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id)
      .populate("organizationId");

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json(school);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSchool = async (req, res) => {
  try {
    const {
      organizationId,
      name,
      code,
      email,
      phone,
      address,
      isActive,
    } = req.body;

    const updates = {};

    if (organizationId !== undefined) {
      const organization = await Organization.findById(organizationId);

      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      updates.organizationId = organizationId;
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "School name is required" });
      }

      updates.name = name.trim();
    }

    if (code !== undefined) updates.code = code;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (isActive !== undefined) updates.isActive = !!isActive;

    const school = await School.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("organizationId");

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json(school);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "School already exists under this organization",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json({ message: "School deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};