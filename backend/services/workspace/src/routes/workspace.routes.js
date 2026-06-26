const express = require("express");
const {
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getAllWorkspace,
  getWorkspaceById,
  getWorkspaceByIdInternal,
  generateInviteLink,
  joinWorkspaceByCode,
  changeMemberRole,
  getInviteLink,
  removeWorkspaceMember
} = require("../controllers/workspace.controller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ⚠️ Internal Service-to-Service route MUST be registered BEFORE the /:id wildcard
// to prevent Express matching "internal" as the :id param.
// No auth middleware — called by Project Service using its own service token logic.
router.get("/internal/workspaces/:id", getWorkspaceByIdInternal);

// Public/External Client Routes (Authenticated)
router.post("/", authMiddleware, createWorkspace);
router.put("/:id", authMiddleware, updateWorkspace);
router.delete("/:id", authMiddleware, deleteWorkspace);
router.get("/", authMiddleware, getAllWorkspace);
router.get("/:id", authMiddleware, getWorkspaceById);
router.post("/:id/invite-link", authMiddleware, generateInviteLink);
router.post("/join/:inviteCode", authMiddleware, joinWorkspaceByCode);
router.patch("/:id/members/:memberId/role", authMiddleware, changeMemberRole);
router.get("/:id/invite-link", authMiddleware, getInviteLink);
router.delete("/:id/members/:memberId", authMiddleware, removeWorkspaceMember);

module.exports = router;

