const express = require("express");
const router = express.Router();

const {getexpert,getstores,govtgetexpert,getAllAgroStoresForManagement,updateAgroStoreForManagement,deleteAgroStoreForManagement,toggleAgroStore,createAgricultureScheme,getallschemaforuser,deleteexpert,toggleBlockExpert,updateExpert,deleteschemas,updateSchema,toggleHoldSchema} = require("../controller/addtionalfeatures.controller")


router.post("/get",getexpert)
router.post("/govtgetexpert",govtgetexpert)
router.post("/stores",getstores)
router.get("/allagrostores",getAllAgroStoresForManagement)
router.put("/editagrostore/:id",updateAgroStoreForManagement)
router.delete("/deleteagrostore/:id",deleteAgroStoreForManagement)
router.post("/blockagrostore/:id",toggleAgroStore)
router.post("/AgricultureScheme",createAgricultureScheme)
router.get("/getallSchemas",getallschemaforuser)
router.delete("/deleteexpert",deleteexpert)
router.post("/acountblock",toggleBlockExpert)
router.put("/expertedit/:id",updateExpert)
router.delete("/deleteschemas/:id",deleteschemas)
router.put("/updateschema/:id",updateSchema)
router.post("/toggleHoldSchema",toggleHoldSchema)

module.exports =router;