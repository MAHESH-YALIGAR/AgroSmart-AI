const express = require("express");
const cors = require('cors');
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

// Middleware (Must be defined before routes)
app.use(cors());
app.use(express.json()); // Parses incoming JSON request bodies

// Imported Routes
const authrouter = require("./router/user.routes");
const alertrouter = require("./router/services.routes");
const webrouter = require("./router/web.routes")
const additionalsrouter=require("./router/additional.routes")
// Route Middleware
app.use("/api/v1/auth", authrouter);
app.use("/api/v1/weather", alertrouter);
app.use("/api/v1/webrouter", webrouter);
app.use("/api/v1/addtional",additionalsrouter)

// Mongoose Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose is connected successfully");
  })
  .catch((err) => {
    console.error("Mongoose connection failed:", err.message);
  });

const PORT = process.env.PORT;
app.get("/", (req, res) => {
  console.log("Backend is running correctly");
  res.send("Backend is running correctly");
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`🚀 LOCAL BACKEND: http://localhost:${PORT}`);

  console.log(`===================================================`);
});


