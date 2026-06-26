const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB (Sprint Service)");
  } catch (err) {
    console.error("Database connection failed", err);
    process.exit(1);
  }
}

module.exports = connectDB;