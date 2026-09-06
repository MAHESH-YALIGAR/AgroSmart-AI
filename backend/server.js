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
const sellcroprouter = require("./router/sellcrop.routes")
// Route Middleware
app.use("/api/v1/auth", authrouter);
app.use("/api/v1/weather", alertrouter);
app.use("/api/v1/webrouter", webrouter);
app.use("/api/v1/addtional",additionalsrouter)
app.use("/api/v1/sellcroprouter", sellcroprouter)

// Mongoose Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose is connected successfully");
    return mongoose.connection.collection("experts").dropIndex("email_1").catch((error) => {
      if (error.codeName !== "IndexNotFound") {
        console.error("Could not remove the old unique expert email index:", error.message);
      }
    });
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


