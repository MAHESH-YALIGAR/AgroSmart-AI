const express = require("express");
const {
	createCropListing,
	getActiveCropListings,
} = require("../controller/sellcrop.controller");

const router = express.Router();

router.post("/createCropListing", createCropListing);
router.get("/allcrops", getActiveCropListings);

module.exports = router;