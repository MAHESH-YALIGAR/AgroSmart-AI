const express = require("express");
const router = express.Router();

const {getexpert} = require("../controller/addtionalfeatures.controller")


router.post("/get",getexpert)

module.exports =router;