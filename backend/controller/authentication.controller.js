const User = require("../models/user.model")
const Otp = require("../models/otp.model")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


exports.sendOtp = async (req, res) => {
  try {
    const { email, purpose = "signup" } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (purpose === "signup") {
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
    } else if (purpose === "forgot-password") {
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP purpose",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    console.log("the genereted  otp is ", otp)
    await Otp.create({
      email,
      otp,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "AgroSmart AI OTP Verification",
      html: `
        <h2>Your OTP</h2>
        <h1>${otp}</h1>
        <p>Valid for 2:30 second only.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed To Send OTP",
    });
  }
};




// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password, otp } = req.body;

//     const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

//     if (!otpRecord) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP Not Found",
//       });
//     }

//     if (otpRecord.otp !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email: email.toLowerCase().trim(),
//       password: hashedPassword,
//     });

//     // FIX: Standardized token payload to match the login architecture
//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.status(201).json({
//       success: true,
//       token,
//       message: "Account Created",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email
//       }
//     });
//   } catch (error) {
//     console.error("Signup System Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Signup Failed",
//     });
//   }
// };
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const otpRecord = await Otp.findOne({
      email,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP Not Found",
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      hasFaceLogin: false,
    });

    // Face image is OPTIONAL
    if (req.file) {
      try {
        const formData = new FormData();

        formData.append(
          "userId",
          user._id.toString()
        );

        formData.append(
          "faceImage",
          fs.createReadStream(req.file.path)
        );

        await axios.post(
          "http://localhost:8000/register-face",
          formData,
          {
            headers:
              formData.getHeaders(),
          }
        );

        user.hasFaceLogin = true;
        await user.save();

      } catch (faceError) {
        console.log(
          "Face Registration Failed:",
          faceError.message
        );
      }
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      token,
      message: "Account Created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasFaceLogin:
          user.hasFaceLogin,
      },
    });

  } catch (error) {
    console.error(
      "Signup System Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Signup Failed",
    });
  }
};
// ==========================================
// LOGIN CONTROLLER
// ==========================================
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password."
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Payload uses 'userId' structurally 
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("Generated clean user token:", token);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login System Error:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during authentication."
    });
  }
};
//this is for the reset the password



exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const otpRecord = await Otp.findOne({ email })
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


//  this for the profile 
exports.profile = async (req, res) => {
  try {
    // FIX: Change 'id' to 'userId' to match your JWT payload signature
    const user = await User.findById(req.user.userId).select("-password");

    console.log("User data ID from the profile API:", req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in the database",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile API Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};





//face login  code  hear 

exports.faceLogin = async (req, res) => {
  console.log(
    "Face Login Controller Triggered"
  );

  try {
    // Check image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Face image required",
      });
    }
    console.log("File Info:", {
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });
    // Create FormData for Python API using the saved disk file
    const fileStream = fs.createReadStream(req.file.path);
    const formData = new FormData();

    formData.append(
      "faceImage",
      fileStream,
      {
        filename: req.file.originalname || "face.jpg",
        contentType: req.file.mimetype,
      }
    );

    // Send image to Python
    const pythonResponse = await axios.post(
      "http://localhost:8000/face-login",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    console.log(
      "Python Response:",
      pythonResponse.data
    );

    // Face not found
    if (
      !pythonResponse.data.success
    ) {
      return res.status(401).json({
        success: false,
        message:
          pythonResponse.data
            .message ||
          "Face not recognized",
      });
    }

    const userId =
      pythonResponse.data.userId;

    // Find User
    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    console.log(
      "Face Login Success:",
      user._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Face Login Successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.log(
      "Face Login Error:",
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Face Login Failed",
    });
  }
};