const express = require("express");

const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user.routes");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jira-user";


app.use(express.json());

app.use((req, res, next) => {
  console.log(`[user-service] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/users", userRoutes);

// Root test route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "User Service" });
});

module.exports=app
