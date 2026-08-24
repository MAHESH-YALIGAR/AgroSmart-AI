
const Expert = require("../models/expert.model");
const Stores = require("../models/agrostore.model");
const AgricultureScheme =require("../models/shemas.model")
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

module.exports.govtgetexpert = async (req, res) => {
  try {
    const {
      state,
      district,
      taluka,
      place
    } = req.body || {};

    // Default query
    // If no filters are provided, this returns all active experts
    const query = {
      isActive: true
    };

    // Add filters only when values are provided
    if (state && state.trim() !== "") {
      query.state = state;
    }

    if (district && district.trim() !== "") {
      query.district = district;
    }

    if (taluka && taluka.trim() !== "") {
      query.taluka = taluka;
    }

    if (place && place.trim() !== "") {
      query.place = place;
    }

    const experts = await Expert.find(query);
console.log("backend experts",experts)
    return res.status(200).json({
      success: true,
      count: experts.length,
      experts: experts
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports.getstores = async (req, res) => {
  try {
    const { state, district, taluka, place } = req.body;

    const query = {
      isActive: true,
    };

    if (state) query.state = state;
    if (district) query.district = district;
    if (taluka) query.taluka = taluka;
    if (place) query.place = place;

    const stores = await Stores.find(query);
    console.log(stores)
    return res.status(200).json(stores);

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


exports.createAgricultureScheme = async (req, res) => {
  try {
    const {
      schemeName,
      schemeType,
      shortDescription,
      benefits,
      eligibilitySummary,
      targetLocation,
      targetCrop,
      applicationStartDate,
      applicationLastDate,
      officialApplicationLink,
    } = req.body;

    // Basic validation
    if (
      !schemeName ||
      !schemeType ||
      !shortDescription ||
      !benefits ||
      !eligibilitySummary ||
      !targetLocation?.level ||
      !applicationStartDate ||
      !applicationLastDate ||
      !officialApplicationLink
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check date
    if (
      new Date(applicationLastDate) <
      new Date(applicationStartDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Application last date cannot be before application start date",
      });
    }

    // Create scheme
    const scheme = await AgricultureScheme.create({
      schemeName,
      schemeType,
      shortDescription,
      benefits,
      eligibilitySummary,
      targetLocation,
      targetCrop:
        targetCrop && targetCrop.length > 0
          ? targetCrop
          : ["All Crops"],
      applicationStartDate,
      applicationLastDate,
      officialApplicationLink,
    });

    return res.status(201).json({
      success: true,
      message: "Agriculture scheme created successfully",
      data: scheme,
    });
  } catch (error) {
    console.error("Create Scheme Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create agriculture scheme",
      error: error.message,
    });
  }
};



module.exports.getallschemaforuser = async (req, res) => {
  try {
    const schemas = await AgricultureScheme.find({}).sort({ applicationLastDate: 1 });
    return res.status(200).json(schemas);

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};