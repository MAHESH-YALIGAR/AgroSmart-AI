
const mongoose = require("mongoose");
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

    // Management should show all experts, including blocked ones,
    // so admins can unblock them after a refresh.
    const query = {};

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

    // A duplicate expert entry can exist for the same email if the record was added
    // more than once. Keep only the most recently updated document per email.
    const dedupedExperts = new Map();

    experts.forEach((expert) => {
      const email = (expert.email || "").toLowerCase();

      if (!email) {
        return;
      }

      const existing = dedupedExperts.get(email);

      if (!existing) {
        dedupedExperts.set(email, expert);
        return;
      }

      const existingScore = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const expertScore = new Date(expert.updatedAt || expert.createdAt || 0).getTime();
      const existingCreatedAt = new Date(existing.createdAt || 0).getTime();
      const expertCreatedAt = new Date(expert.createdAt || 0).getTime();

      if (
        expertScore > existingScore ||
        (expertScore === existingScore && expertCreatedAt > existingCreatedAt)
      ) {
        dedupedExperts.set(email, expert);
      }
    });

    const uniqueExperts = Array.from(dedupedExperts.values()).sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });

    const primaryExpertIdByEmail = new Map(
      uniqueExperts.map((expert) => [
        (expert.email || "").toLowerCase(),
        expert._id.toString(),
      ])
    );

    const feedbackCollection = mongoose.connection.collection("expert_feedbacks");

    for (const expert of experts) {
      const email = (expert.email || "").toLowerCase();
      const currentPrimaryId = primaryExpertIdByEmail.get(email);

      if (!email || !currentPrimaryId || currentPrimaryId === expert._id.toString()) {
        continue;
      }

      await feedbackCollection.updateMany(
        { expertId: expert._id.toString() },
        { $set: { expertId: currentPrimaryId } }
      );
    }

    return res.status(200).json({
      success: true,
      count: uniqueExperts.length,
      experts: uniqueExperts
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

module.exports.getAllAgroStoresForManagement = async (req, res) => {
  try {
    const stores = await Stores.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: stores });
  } catch (error) {
    console.error("Get all agro stores error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.updateAgroStoreForManagement = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    const store = await Stores.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!store) {
      return res.status(404).json({ success: false, message: "Agro store not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Agro store updated successfully",
      data: store,
    });
  } catch (error) {
    console.error("Update agro store error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.deleteAgroStoreForManagement = async (req, res) => {
  try {
    const store = await Stores.findByIdAndDelete(req.params.id);

    if (!store) {
      return res.status(404).json({ success: false, message: "Agro store not found" });
    }

    return res.status(200).json({ success: true, message: "Agro store deleted successfully" });
  } catch (error) {
    console.error("Delete agro store error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.toggleAgroStore = async (req, res) => {
  try {
    const store = await Stores.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ success: false, message: "Agro store not found" });
    }

    store.isActive = !store.isActive;
    await store.save();

    return res.status(200).json({
      success: true,
      message: store.isActive ? "Agro store unblocked successfully" : "Agro store blocked successfully",
      isActive: store.isActive,
    });
  } catch (error) {
    console.error("Toggle agro store error:", error);
    return res.status(500).json({ success: false, message: error.message });
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
  const { email } = req.body;
  console.log("expert email for the delete:", email);

  try {
    const result = await expertModel.deleteMany({ email });
    console.log("deleted expert records", result);

    if (result.deletedCount === 0) {
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
    const experts = await expertModel.find({ email });

    if (!experts.length) {
      return res.status(404).json({ message: "Expert not found in database" });
    }

    const nextStatus = !experts[0].isActive;

    const updateResult = await expertModel.updateMany(
      { email },
      { $set: { isActive: nextStatus } }
    );

    console.log("Expert updateMany result:", updateResult);

    const statusMessage = nextStatus
      ? "Expert unblocked (Activated) successfully"
      : "Expert blocked (Deactivated) successfully";

    return res.status(200).json({
      message: statusMessage,
      isActive: nextStatus,
      updatedCount: updateResult.modifiedCount || updateResult.nModified || 0,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update expert status" });
  }
};

module.exports.updateExpert = async (req, res) => {
  const { id } = req.params;
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

  if (
    !name ||
    !phone ||
    !email ||
    !crop ||
    !state ||
    !district ||
    !taluka ||
    !place ||
    experience === undefined
  ) {
    return res.status(400).json({ message: "Please provide all required expert fields" });
  }

  try {
    const currentExpert = await expertModel.findById(id);

    if (!currentExpert) {
      return res.status(404).json({ message: "Expert not found" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const expert = await expertModel.findByIdAndUpdate(
      currentExpert._id,
      {
        photo: photo || null,
        name: name.trim(),
        phone: phone.trim(),
        email: normalizedEmail,
        crop: crop.trim(),
        state: state.trim(),
        district: district.trim(),
        taluka: taluka.trim(),
        place: place.trim(),
        experience: Number(experience),
        description: description?.trim() || "",
      },
      { new: true, runValidators: true }
    );

    if (!expert) {
      return res.status(404).json({ message: "Expert not found" });
    }

    return res.status(200).json({
      message: "Expert updated successfully",
      data: expert,
    });
  } catch (error) {
    console.error("Update expert error:", error);
    return res.status(400).json({ message: error.message || "Failed to update expert" });
  }
};



///////////////this is for the delete schemas

module.exports.deleteschemas = async (req, res) => {
  const id = req.params.id || req.body.id;

  try {
    const schema = await AgricultureScheme.findByIdAndDelete(id);

    if (!schema) {
      return res.status(404).json({ message: "Schema not found in database" });
    }

    return res.status(200).json({ message: "Schema deleted from the list" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Schema still available" });
  }
};

module.exports.updateSchema = async (req, res) => {
  const { id } = req.params;
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
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  if (new Date(applicationLastDate) < new Date(applicationStartDate)) {
    return res.status(400).json({
      message: "Application last date cannot be before application start date",
    });
  }

  try {
    const schema = await AgricultureScheme.findByIdAndUpdate(
      id,
      {
        schemeName,
        schemeType,
        shortDescription,
        benefits,
        eligibilitySummary,
        targetLocation,
        targetCrop: targetCrop?.length ? targetCrop : ["All Crops"],
        applicationStartDate,
        applicationLastDate,
        officialApplicationLink,
      },
      { new: true, runValidators: true }
    );

    if (!schema) {
      return res.status(404).json({ message: "Schema not found in database" });
    }

    return res.status(200).json({
      message: "Schema updated successfully",
      data: schema,
    });
  } catch (error) {
    console.error("Update schema error:", error);
    return res.status(500).json({ message: "Failed to update schema" });
  }
};



module.exports.toggleHoldSchema = async (req, res) => {
  const { id } = req.body;
  // 1. Fixed log statement to use 'id' instead of the undefined 'email' variable
  console.log("schema ID for hold status toggle:", id);

  try {
    // 2. Find the schema using its ID
    const schemaItem = await AgricultureScheme.findById(id);
    if (!schemaItem) {
      return res.status(404).json({ message: "Schema not found in database" });
    }

    // 3. Toggle the boolean value (true becomes false, false becomes true)
    schemaItem.isActive = !schemaItem.isActive;
    await schemaItem.save();

    console.log("Schema updated status. isActive is now:", schemaItem.isActive);

    // 4. Cleaned up the status messages to explicitly reference "Schema" instead of "Expert"
    const statusMessage = schemaItem.isActive 
      ? "Schema unheld (Activated) successfully" 
      : "Schema placed on hold (Deactivated) successfully";

    return res.status(200).json({ 
      message: statusMessage,
      isActive: schemaItem.isActive // Send this back so the React UI knows what changed
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update schema hold status" });
  }
};
