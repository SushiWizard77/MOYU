const Resource = require("../models/Resource");

const listResources = async (req, res) => {
  try {
    const { category, type, skill, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (skill) filter.skill = skill;
    if (search) filter.title = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [resources, total] = await Promise.all([
      Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Resource.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: resources,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error("LIST RESOURCES ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load resources" });
  }
};

module.exports = { listResources };
