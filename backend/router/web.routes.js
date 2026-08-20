const express = require("express");
const router = express.Router();

const {createAgroStore,getAllAgroStores,createAgricultureScheme}=require("../controller/agrostore.controller")
const {createExpert}=require("../controller/expert.controller")

router.post("/createExpert",createExpert)
router.post("/createAgroStore",createAgroStore)
router.get("/getallmapdata",getAllAgroStores)
router.post("/addSchemas",createAgricultureScheme)

module.exports = router