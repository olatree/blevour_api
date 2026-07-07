const Section = require("../models/Section");
const School = require("../models/School");

exports.createSection = async (req, res) => {
  try {
    const { schoolId, name, isActive } = req.body;

    if (!schoolId) {
      return res.status(400).json({ message: "School is required" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Section name is required" });
    }

    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const section = await Section.create({
      schoolId,
      name: name.trim(),
      isActive: isActive !== undefined ? !!isActive : true,
    });

    const populatedSection = await Section.findById(section._id)
      .populate({
        path: "schoolId",
        populate: {
          path: "organizationId",
        },
      })
      .lean();

    res.status(201).json(populatedSection);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Section already exists under this school",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.getSections = async (req, res) => {
  try {
    const { schoolId, organizationId } = req.query;

    const filter = {};

    if (schoolId) {
      filter.schoolId = schoolId;
    }

    let sections = await Section.find(filter)
      .populate({
        path: "schoolId",
        populate: {
          path: "organizationId",
        },
      })
      .sort({ name: 1 })
      .lean();

    if (organizationId) {
      sections = sections.filter(
        (section) =>
          String(section.schoolId?.organizationId?._id) === String(organizationId)
      );
    }

    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate({
      path: "schoolId",
      populate: {
        path: "organizationId",
      },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { schoolId, name, isActive } = req.body;

    const updates = {};

    if (schoolId !== undefined) {
      const school = await School.findById(schoolId);

      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      updates.schoolId = schoolId;
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Section name is required" });
      }

      updates.name = name.trim();
    }

    if (isActive !== undefined) updates.isActive = !!isActive;

    const section = await Section.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate({
      path: "schoolId",
      populate: {
        path: "organizationId",
      },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json(section);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Section already exists under this school",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json({ message: "Section deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};