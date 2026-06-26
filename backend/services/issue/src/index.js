const express = require("express");
const cors = require("cors");
require("dotenv").config();


const issueRoutes = require("./routes/issue.routes");

const app = express();


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/issues", issueRoutes);

// Root health route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "Issue Service" });
});
module.exports=app

