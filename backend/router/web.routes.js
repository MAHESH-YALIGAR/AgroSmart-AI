const express = require("express");
const router = express.Router();

const {createAgroStore,getAllAgroStores,createAgricultureScheme}=require("../controller/agrostore.controller")
const {
    createExpert,
    createExpertRequest,
    getExpertRequests,
    approveExpertRequest,
    pauseExpertRequest,
}=require("../controller/expert.controller")

router.post("/createExpert",createExpert)
router.post("/createExpertRequest",createExpertRequest)
router.get("/getExpertRequests",getExpertRequests)
router.patch("/approveExpertRequest/:id",approveExpertRequest)
router.patch("/pauseExpertRequest/:id",pauseExpertRequest)
router.post("/createAgroStore",createAgroStore)
router.get("/getallmapdata",getAllAgroStores)
// router.post("/addSchemas",createAgricultureScheme)

module.exports = router