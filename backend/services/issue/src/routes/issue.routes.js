const express = require("express");
const {
  createIssue,
  updateIssue,
  deleteIssue,
  getIssueById,
  getIssueByProject,
  getIssuesBySprint,
  getAllIssues,
  updateIssueStatus,
  commentOnIssue,
  getIssueComments,
  deleteCommentsById
} = require("../controllers/issue.controller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Public/External Client Routes (Authenticated)
router.post("/", authMiddleware, createIssue);
router.put("/:id", authMiddleware, updateIssue);
router.delete("/:id", authMiddleware, deleteIssue);
router.get("/project/:projectId", authMiddleware, getIssueByProject);
router.get("/sprint/:sprintId", authMiddleware, getIssuesBySprint); 
router.get("/", authMiddleware, getAllIssues);
router.get("/:id", authMiddleware, getIssueById);
router.put("/:id/status", authMiddleware, updateIssueStatus);
router.post("/:id/comments", authMiddleware, commentOnIssue);
router.get("/:id/comments", authMiddleware, getIssueComments);
router.delete("/:id/comments", authMiddleware, deleteCommentsById);
module.exports = router;

