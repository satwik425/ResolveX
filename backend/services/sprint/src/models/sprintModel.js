const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sprint name is required"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    status: {
      type: String,
      enum: ["planned", "active", "completed"],
      default: "planned",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    goal: {
      // sprint goal / description
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);



module.exports = mongoose.model("Sprint", sprintSchema);