const express = require("express");
const cors = require("cors");
require("dotenv").config();

const workspaceRoutes = require("./routes/workspace.routes");

const app = express();
const PORT = process.env.PORT || 3002;


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/workspaces", workspaceRoutes);

// Root health route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "Workspace Service" });
});

module.exports=app
