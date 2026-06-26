const express = require("express");
const {
  createSprint,
  updateSprint,
  deleteSprint,
  getSprintByProject,
  getSprintById,
  getSprintInternal,
  getAllSprints
} = require("../controllers/sprint.controller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Internal Service-to-Service Routes
router.get("/internal/sprints/:id",  getSprintInternal);

// Public/External Client Routes (Authenticated)
router.post("/", authMiddleware, createSprint);
router.put("/:id", authMiddleware, updateSprint);
router.delete("/:id", authMiddleware, deleteSprint);
router.get("/project/:projectId", authMiddleware, getSprintByProject);
router.get("/", authMiddleware, getAllSprints);
router.get("/:id",  authMiddleware ,  getSprintById);


module.exports = router;

