
const Expert = require("../models/expert.model");

module.exports.getexpert = async (req, res) => {
  try {
    const { state, district, taluka, place } = req.body;

    const query = {
      isActive: true,
    };

    if (state) query.state = state;
    if (district) query.district = district;
    if (taluka) query.taluka = taluka;
    if (place) query.place = place;

    const experts = await Expert.find(query);

    return res.status(200).json(experts);

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};