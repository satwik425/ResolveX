const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "OK", service: "Notification Service" }));



module.exports=app