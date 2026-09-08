const express = require("express");
const {
	createCropListing,
	getActiveCropListings,
	getMyCropListings,
	updateCropListing,
	deleteCropListing,
	updateCropListingStatus,
} = require("../controller/sellcrop.controller");
const { auth } = require("../middleware/Profile.auth");

const router = express.Router();

router.post("/createCropListing", auth, createCropListing);
router.get("/allcrops", getActiveCropListings);
router.get("/my-listings", auth, getMyCropListings);
router.put("/:id", auth, updateCropListing);
router.patch("/:id/status", auth, updateCropListingStatus);
router.delete("/:id", auth, deleteCropListing);

module.exports = router;