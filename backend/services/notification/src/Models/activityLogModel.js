const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    // who performed the action
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    // what action was performed
    action: {
      type: String,
      required: true,
      enum: [
        // workspace actions
        "WORKSPACE_CREATED",
        "WORKSPACE_UPDATED",
        "WORKSPACE_DELETED",
        "WORKSPACE_MEMBER_JOINED",
        "WORKSPACE_MEMBER_REMOVED",
        "WORKSPACE_MEMBER_ROLE_CHANGED",

        // project actions
        "PROJECT_CREATED",
        "PROJECT_UPDATED",
        "PROJECT_DELETED",
        "PROJECT_MEMBER_ADDED",
        "PROJECT_MEMBER_REMOVED",

        // sprint actions
        "SPRINT_CREATED",
        "SPRINT_UPDATED",
        "SPRINT_DELETED",
        "SPRINT_STARTED",
        "SPRINT_COMPLETED",

        // issue actions
        "ISSUE_CREATED",
        "ISSUE_UPDATED",
        "ISSUE_DELETED",
        "ISSUE_STATUS_CHANGED",

        // comment actions
        "COMMENT_ADDED",
        "COMMENT_DELETED",
        "COMMENT_EDITED"
      ]
    },

    // which entity was affected
    entityType: {
      type: String,
      required: true,
      enum: ["WORKSPACE", "PROJECT", "SPRINT", "ISSUE", "COMMENT"]
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    // human readable log line
    // e.g. "John assigned issue 'Fix login bug' to Sarah"
    description: {
      type: String,
      required: true
    },

    // scope — which workspace/project this log belongs to
    // useful for fetching all logs scoped to a project
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  {
    timestamps: true // createdAt acts as the log timestamp
  }
);



const activityLogModel = mongoose.model("ActivityLog", activityLogSchema);

module.exports = activityLogModel;