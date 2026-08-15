const express = require("express");
const router = express.Router();

const {getexpert,getstores} = require("../controller/addtionalfeatures.controller")


router.post("/get",getexpert)
router.post("/stores",getstores)

module.exports =router;