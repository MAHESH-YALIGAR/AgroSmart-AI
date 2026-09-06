
const Expert = require("../models/expert.model");
const Stores = require("../models/agrostore.model");
const AgricultureScheme =require("../models/shemas.model");
const expertModel = require("../models/expert.model");
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

module.exports.deleteexpert = async (req, res) => {
  // Add curly braces around email here to extract the string value!
  const { email } = req.body; 
  console.log("expert email for the delete:", email); // Should print: yaligarmahesh47@gmail.com

  try {
    // This will now pass { email: "yaligarmahesh47@gmail.com" } to MongoDB
    const schemas = await expertModel.deleteOne({ email });
    console.log("need to delete schema", schemas);

    if (schemas.deletedCount === 0) {
      return res.status(404).json({ message: "Expert not found in database" });
    }

    return res.status(200).json({ message: "expert deleted from the list" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "expert still available" });
  }
};


module.exports.toggleBlockExpert = async (req, res) => {
  const { email } = req.body;
  console.log("expert email for active status toggle:", email);

  try {
    // 1. Find the expert using their email
    const expert = await expertModel.findOne({ email });

    if (!expert) {
      return res.status(404).json({ message: "Expert not found in database" });
    }

    // 2. Toggle the boolean value (true becomes false, false becomes true)
    expert.isActive = !expert.isActive;
    await expert.save();

    console.log("Expert updated status. isActive is now:", expert.isActive);

    // 3. Set a smart message based on the new boolean state
    const statusMessage = expert.isActive 
      ? "Expert unblocked (Activated) successfully" 
      : "Expert blocked (Deactivated) successfully";

    return res.status(200).json({ 
      message: statusMessage,
      isActive: expert.isActive // Send this back so the React UI knows what changed
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update expert status" });
  }
};



///////////////this is for the delete schemas

module.exports.deleteschemas = async (req, res) => {
  // Add curly braces around email here to extract the string value!
  const { id } = req.body; 
  console.log("expert email for the delete:", id); // Should print: yaligarmahesh47@gmail.com

  try {
    // This will now pass { email: "yaligarmahesh47@gmail.com" } to MongoDB
    const schemas = await AgricultureScheme.findByIdAndDelete(id);
    console.log("need to delete schema", schemas);

    if (schemas.deletedCount === 0) {
      return res.status(404).json({ message: "Schema not found in database" });
    }

    return res.status(200).json({ message: "Schema deleted from the list" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Schema still available" });
  }
};