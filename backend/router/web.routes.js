const express = require("express");
const router = express.Router();

const {createAgroStore,getAllAgroStores}=require("../controller/agrostore.controller")
const {createExpert}=require("../controller/expert.controller")

router.post("/createExpert",createExpert)
router.post("/createAgroStore",createAgroStore)
router.get("/getallmapdata",getAllAgroStores)

module.exports = router