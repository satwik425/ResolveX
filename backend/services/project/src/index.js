const express = require("express");
const cors = require("cors");
require("dotenv").config();


const projectRoutes = require("./routes/project.routes");

const app = express();


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/projects", projectRoutes);

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  next(err);
});

// Root health route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "Project Service" });
});

module.exports=app
