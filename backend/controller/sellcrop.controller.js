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
	) {
		return res.status(400).json({
			success: false,
			message: "Please provide all required crop listing details",
		});
	}

	try {
		const cropListing = await CropSell.create({
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