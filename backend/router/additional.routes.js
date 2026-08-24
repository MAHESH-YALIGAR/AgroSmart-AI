const express = require("express");
const router = express.Router();

const {getexpert,getstores,govtgetexpert,createAgricultureScheme,getallschemaforuser} = require("../controller/addtionalfeatures.controller")


router.post("/get",getexpert)
router.post("/govtgetexpert",govtgetexpert)
router.post("/stores",getstores)
router.post("/AgricultureScheme",createAgricultureScheme)
router.get("/getallexpert",getallschemaforuser)

module.exports =router;