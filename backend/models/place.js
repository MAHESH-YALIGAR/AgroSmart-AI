// models/Place.js
const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  taluka: { type: mongoose.Schema.Types.ObjectId, ref: "Taluka" },
  latitude: Number,
  longitude: Number,
});

module.exports = mongoose.model("Place", placeSchema);