const express = require("express");
const {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  addProjectMember,
  removeProjectMember,
  getProjectByIdInternal
} = require("../controllers/project.controller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/internal/projects/:id", getProjectByIdInternal);

// Public/External Client Routes (Authenticated)
router.post("/", authMiddleware, createProject);
router.put("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteProject);
router.get("/", authMiddleware, getAllProjects);
router.get("/:id", authMiddleware, getProjectById);
router.post("/:id/members", authMiddleware, addProjectMember);
router.delete("/:id/members/:memberId", authMiddleware, removeProjectMember);



module.exports = router;

