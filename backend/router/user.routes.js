const express = require("express");
const multer = require("multer")
const router = express.Router();
const upload = multer({
  dest: "uploads/",
});
const {
  sendOtp,
  signup,
  Login,
  resetPassword, profile,faceLogin
} = require("../controller/authentication.controller");

const { auth } = require("../middleware/Profile.auth")


router.post("/send-otp", sendOtp);

router.post("/signup", upload.single("faceImage"), signup);
router.post( "/face-login",upload.single("faceImage"),faceLogin);
router.post("/Login", Login);
router.post("/resetpassword", resetPassword);
router.get("/profile", auth, profile)
module.exports = router;