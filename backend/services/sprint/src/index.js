const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sprintRoutes = require("./routes/sprint.routes");


const app = express();
const PORT = process.env.PORT || 3004;


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/sprints", sprintRoutes);

// Root health route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "Sprint Service" });
});

module.exports=app
