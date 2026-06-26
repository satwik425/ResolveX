const mongoose = require("mongoose");

const projectMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["lead", "admin", "developer", "viewer"],
      default: "developer",
    },
  },
  { _id: false }
);
 
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    lead: {
      // project lead/manager
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    members: [projectMemberSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);