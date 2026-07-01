const express = require("express");

const router = express.Router();

const {generateWeatherAlert} =require("../services/wether_risk")
const {getMarketPrices}=require("../services/prices")
  console.log("you are in the wether risk ditect router");

router.post("/alert", generateWeatherAlert);
router.post("/market-price",getMarketPrices)

module.exports = router;