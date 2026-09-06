const express = require("express");
const router = express.Router();

const {getexpert,getstores,govtgetexpert,createAgricultureScheme,getallschemaforuser,deleteexpert,toggleBlockExpert,deleteschemas} = require("../controller/addtionalfeatures.controller")


router.post("/get",getexpert)
router.post("/govtgetexpert",govtgetexpert)
router.post("/stores",getstores)
router.post("/AgricultureScheme",createAgricultureScheme)
router.get("/getallSchemas",getallschemaforuser)
router.delete("/deleteexpert",deleteexpert)
router.post("/acountblock",toggleBlockExpert)
router.post("/deleteschemas",deleteschemas)

module.exports =router;