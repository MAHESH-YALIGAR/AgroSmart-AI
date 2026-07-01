const express = require("express");
const router = express.Router();

const {createAgroStore}=require("../controller/agrostore.controller")
const {createExpert}=require("../controller/expert.controller")

router.post("/createExpert",createExpert)
router.post("/createAgroStore",createAgroStore)

module.exports = router