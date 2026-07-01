const Expert = require("../models/expert.model");
const { resolveLocationFromPlace } = require("../services/geocode");

/**
 * @desc   Create a new agriculture expert
 * @route  POST /api/experts
 * @access Officer
 */
exports.createExpert = async (req, res) => {
  try {
    const {
      photo,
      name,
      phone,
      email,
      crop,
      state,
      district,
      taluka,
      place,
      experience,
      description,
    } = req.body;

    // Backend resolves lat/lng from the selected Place — never sent by the client.
    const location = await resolveLocationFromPlace(state,district,taluka,place);

    const expert = await Expert.create({
      photo,
      name,
      phone,
      email,
      crop,
      state,
      district,
      taluka,
      place,
      location,
      experience,
      description,
      createdBy: req.user?._id, // set by auth middleware
    });

    res.status(201).json({ success: true, data: expert });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get all experts (with optional filters: crop, state, district, taluka, place)
 * @route  GET /api/experts
 * @access Officer / AI service
 */
exports.getAllExperts = async (req, res) => {
  try {
    const { crop, state, district, taluka, place, search, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (crop) filter.crop = crop;
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (taluka) filter.taluka = taluka;
    if (place) filter.place = place;
    if (search) filter.$text = { $search: search };

    const experts = await Expert.find(filter)
      .populate("crop state district taluka place")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Expert.countDocuments(filter);

    res.status(200).json({ success: true, total, data: experts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get a single expert by ID
 * @route  GET /api/experts/:id
 * @access Officer / AI service
 */
exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id).populate(
      "crop state district taluka place"
    );

    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert not found" });
    }

    res.status(200).json({ success: true, data: expert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Update an expert
 * @route  PUT /api/experts/:id
 * @access Officer
 */
exports.updateExpert = async (req, res) => {
  try {
    const updates = { ...req.body };

    // If the place changed, re-resolve coordinates instead of trusting client input.
    if (updates.place) {
      updates.location = await resolveLocationFromPlace(updates.place);
    }

    const expert = await Expert.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert not found" });
    }

    res.status(200).json({ success: true, data: expert });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Delete (deactivate) an expert
 * @route  DELETE /api/experts/:id
 * @access Officer
 */
exports.deleteExpert = async (req, res) => {
  try {
    const expert = await Expert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert not found" });
    }

    res.status(200).json({ success: true, message: "Expert deactivated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Find nearest experts for a given crop, near given coordinates.
 *         Used by the AI assistant, e.g. "Find a cotton expert near me".
 * @route  GET /api/experts/nearest?crop=<id>&lng=<n>&lat=<n>&maxDistanceKm=<n>
 * @access AI service
 */
exports.findNearestExperts = async (req, res) => {
  try {
    const { crop, lng, lat, maxDistanceKm = 25 } = req.query;

    if (!lng || !lat) {
      return res
        .status(400)
        .json({ success: false, message: "lng and lat are required" });
    }

    const filter = {
      isActive: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistanceKm) * 1000, // metres
        },
      },
    };
    if (crop) filter.crop = crop;

    const experts = await Expert.find(filter)
      .populate("crop state district taluka place")
      .limit(10);

    res.status(200).json({ success: true, data: experts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};