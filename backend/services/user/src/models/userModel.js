
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
 
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"]
    },
    role:{
      type:String,
      default:"user"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);