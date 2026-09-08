const CropSell = require("../models/cropsell.model");

exports.getActiveCropListings = async (req, res) => {
	try {
		const { cropName, search } = req.query;
		const filter = { isActive: true };

		if (cropName) filter.cropName = cropName;
		if (search) {
			filter.$text = { $search: search };
		}

		const listings = await CropSell.find(filter).sort({ createdAt: -1 });

		return res.status(200).json({
			success: true,
			count: listings.length,
			data: listings,
		});
	} catch (error) {
		console.error("Get crop listings error:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to load crop listings",
		});
	}
};

exports.createCropListing = async (req, res) => {
	const {
		imageUri,
		cropName,
		cropVariety,
		quantity,
		quantityUnit,
		expectedPrice,
		readyDate,
		farmerName,
		mobileNumber,
		email,
		description,
		latitude,
		longitude,
	} = req.body || {};

	const numericQuantity = Number(quantity);
	const numericPrice = Number(expectedPrice);
	const numericLatitude = Number(latitude);
	const numericLongitude = Number(longitude);
	const ownerEmail = req.user?.email?.trim().toLowerCase();

	if (
		!cropName?.trim() ||
		!quantityUnit ||
		!readyDate ||
		!farmerName?.trim() ||
		!mobileNumber?.trim() ||
		!Number.isFinite(numericQuantity) ||
		numericQuantity <= 0 ||
		!Number.isFinite(numericPrice) ||
		numericPrice <= 0 ||
		!Number.isFinite(numericLatitude) ||
		!Number.isFinite(numericLongitude)
		|| !ownerEmail
	) {
		return res.status(400).json({
			success: false,
			message: "Please provide all required crop listing details",
		});
	}

	try {
		const cropListing = await CropSell.create({
			ownerId: req.user?.userId,
			ownerEmail,
			imageUri: imageUri?.trim() || "",
			cropName: cropName.trim(),
			cropVariety: cropVariety?.trim() || "",
			quantity: numericQuantity,
			quantityUnit,
			expectedPrice: numericPrice,
			readyDate,
			farmerName: farmerName.trim(),
			mobileNumber: mobileNumber.trim(),
			email: email?.trim() || "",
			description: description?.trim() || "",
			latitude: numericLatitude,
			longitude: numericLongitude,
			// The model hook also derives this from latitude/longitude.
			location: {
				type: "Point",
				coordinates: [numericLongitude, numericLatitude],
			},
		});

		return res.status(201).json({
			success: true,
			message: "Crop listing saved successfully",
			data: cropListing,
		});
	} catch (error) {
		console.error("Save crop listing error:", error);

		return res.status(400).json({
			success: false,
			message: error.message || "Failed to save crop listing",
		});
	}
};

exports.getMyCropListings = async (req, res) => {
	try {
		const ownerEmail = req.user?.email?.trim().toLowerCase();
		const listings = await CropSell.find({ ownerEmail }).sort({ createdAt: -1 });
		return res.status(200).json({ success: true, count: listings.length, data: listings });
	} catch (error) {
		console.error("Get farmer crop listings error:", error);
		return res.status(500).json({ success: false, message: "Failed to load your crop listings" });
	}
};

const editableFields = [
	"imageUri", "cropName", "cropVariety", "quantity", "quantityUnit",
	"expectedPrice", "readyDate", "farmerName", "mobileNumber", "email",
	"description", "latitude", "longitude",
];

const getOwnedListing = (id, ownerEmail) => CropSell.findOne({ _id: id, ownerEmail });

exports.updateCropListing = async (req, res) => {
	try {
		const updates = Object.fromEntries(
			Object.entries(req.body || {}).filter(([key]) => editableFields.includes(key))
		);
		const listing = await getOwnedListing(req.params.id, req.user.email.trim().toLowerCase());
		if (!listing) return res.status(404).json({ success: false, message: "Crop listing not found" });

		Object.assign(listing, updates);
		await listing.save();
		return res.status(200).json({ success: true, message: "Crop listing updated successfully", data: listing });
	} catch (error) {
		console.error("Update crop listing error:", error);
		return res.status(400).json({ success: false, message: error.message || "Failed to update crop listing" });
	}
};

exports.updateCropListingStatus = async (req, res) => {
	try {
		const { status } = req.body || {};
		if (!["active", "sold", "paused"].includes(status)) {
			return res.status(400).json({ success: false, message: "Invalid listing status" });
		}
		const listing = await getOwnedListing(req.params.id, req.user.email.trim().toLowerCase());
		if (!listing) return res.status(404).json({ success: false, message: "Crop listing not found" });
		listing.status = status;
		listing.isActive = status === "active";
		await listing.save();
		return res.status(200).json({ success: true, message: "Crop listing status updated", data: listing });
	} catch (error) {
		console.error("Update crop listing status error:", error);
		return res.status(400).json({ success: false, message: error.message || "Failed to update listing status" });
	}
};

exports.deleteCropListing = async (req, res) => {
	try {
		const listing = await CropSell.findOneAndDelete({
			_id: req.params.id,
			ownerEmail: req.user.email.trim().toLowerCase(),
		});
		if (!listing) return res.status(404).json({ success: false, message: "Crop listing not found" });
		return res.status(200).json({ success: true, message: "Crop listing deleted successfully" });
	} catch (error) {
		console.error("Delete crop listing error:", error);
		return res.status(400).json({ success: false, message: "Failed to delete crop listing" });
	}
};