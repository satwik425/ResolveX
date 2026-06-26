const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },

    status: {
      type: String,
      enum: [
        "TODO",
        "IN_PROGRESS",
        "REVIEW",
        "DONE",
      ],
      default: "TODO",
    },

    storyPoints: {
      type: Number,
      default: 5,
    },

    dueDate: Date,

    order: {
      type: Number,
      default: 0,
    },

    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);