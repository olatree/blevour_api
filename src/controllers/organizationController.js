const Organization = require("../models/Organization");

exports.createOrganization = async (req, res) => {
  try {
    const { name, email, phone, address, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Organization name is required" });
    }

    const organization = await Organization.create({
      name: name.trim(),
      email,
      phone,
      address,
      isActive: isActive !== undefined ? !!isActive : true,
    });

    res.status(201).json(organization);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Organization already exists" });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find()
      .sort({ name: 1 })
      .lean();

    res.json(organizations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(organization);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const { name, email, phone, address, isActive } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Organization name is required" });
      }
      updates.name = name.trim();
    }

    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (isActive !== undefined) updates.isActive = !!isActive;

    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(organization);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Organization already exists" });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByIdAndDelete(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({ message: "Organization deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};