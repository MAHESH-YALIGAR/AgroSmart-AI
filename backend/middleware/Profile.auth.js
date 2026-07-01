const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  console.log("you are in middleware")
  console.log("DEBUG SECRET:", process.env.JWT_SECRET);

  try {
    const token =
      req.header("Authorization")
        ?.replace("Bearer ", "");
    console.log("token from midleware", token)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token Missing",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    console.log("the decoded user", decoded)
    next();
  } catch (error) {
    console.log("REAL ERROR LOG:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};