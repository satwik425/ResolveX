const sprintModel = require("../models/sprintModel");
const { ProjectClient } = require("../utils/apiClients");
const {publishEvent,publishActivityLog}=require("../utils/rabbitMQ");


const createSprint = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, projectId, startDate, endDate, goal, status } = req.body;

    const project = await ProjectClient.getProjectById(projectId, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const membership = project.members.find(m => {
  const userIdInMember =
    typeof m.user === "object" && m.user._id
      ? m.user._id.toString()
      : m.user.toString();

  return userIdInMember === userId;
});

    if (!membership || !["lead", "admin"].includes(membership.role)) {
      return res.status(403).json({ message: "Forbidden: only lead or admin can create sprints" });
    }

    const sprint = await sprintModel.create({
      name,
      project: projectId,
      startDate,
      endDate,
      goal,
      status
    });

  await publishEvent("sprint.status.changed", {
  type: status === "active" ? "SPRINT_STARTED" : "SPRINT_COMPLETED",
  sprintName: sprint.name,
  projectName: project.name,
  status,
  memberIds:project.members.map(m => m.user._id || m.user),   
  timestamp: new Date().toISOString()
});

  publishActivityLog({
      performedBy: req.user.userId,
      action: "SPRINT_CREATED",
      entityType: "SPRINT",
      entityId: sprint._id,
      description: `${req.user.userName} created sprint "${sprint.name}" in project "${project.name}"`,
      workspace: project.workspace,
      project: projectId
    });

    return res.status(201).json({ message: "Sprint created successfully", sprint });
  } catch (err) {
    return res.status(500).json({ message: "Error creating sprint", error: err.message });
  }
};

const updateSprint = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;
    const { name, startDate, endDate, goal, status } = req.body;

    const sprint = await sprintModel.findById(id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const project = await ProjectClient.getProjectById(sprint.project, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Associated project not found" });
    }

     const membership = project.members.find(m => {
  const userIdInMember =
    typeof m.user === "object" && m.user._id
      ? m.user._id.toString()
      : m.user.toString();

  return userIdInMember === userId;
});
    if (!membership || !["lead", "admin"].includes(membership.role)) {
      return res.status(403).json({ message: "Forbidden: only lead or admin can update sprints" });
    }

    if (name) sprint.name = name;
    if (startDate) sprint.startDate = startDate;
    if (endDate) sprint.endDate = endDate;
    if (goal) sprint.goal = goal;
    if (status) sprint.status = status;

    await sprint.save();


     publishActivityLog({
      performedBy: req.user.userId,
      action: "SPRINT_UPDATED",
      entityType: "SPRINT",
      entityId: sprint._id,
      description: `${req.user.userName} updated sprint "${sprint.name}" in project "${project.name}"`,
      workspace: project.workspace,
      project: sprint.project
    });


    return res.status(200).json({ message: "Sprint updated successfully", sprint });
  } catch (err) {
    return res.status(500).json({ message: "Error updating sprint", error: err.message });
  }
};

const deleteSprint = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;

    const sprint = await sprintModel.findById(id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const project = await ProjectClient.getProjectById(sprint.project, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Associated project not found" });
    }

      const membership = project.members.find(m => {
  const userIdInMember =
    typeof m.user === "object" && m.user._id
      ? m.user._id.toString()
      : m.user.toString();

  return userIdInMember === userId;
});
    if (!membership || !["lead", "admin"].includes(membership.role)) {
      return res.status(403).json({ message: "Forbidden: only lead or admin can delete sprints" });
    }

    await sprintModel.findByIdAndDelete(id);

     publishActivityLog({
      performedBy: req.user.userId,
      action: "SPRINT_DELETED",
      entityType: "SPRINT",
      entityId: sprint._id,
      description: `${req.user.userName} deleted sprint "${sprint.name}" from project "${project.name}"`,
      workspace: project.workspace,
      project: sprint.project
    });

    return res.status(200).json({ message: "Sprint deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting sprint", error: err.message });
  }
};

const getSprintByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user.userId;

    const project = await ProjectClient.getProjectById(projectId, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

     const membership = project.members.find(m => {
  const userIdInMember =
    typeof m.user === "object" && m.user._id
      ? m.user._id.toString()
      : m.user.toString();

  return userIdInMember === userId;
});
    if (!membership) {
      return res.status(403).json({ message: "Forbidden: you are not a member of this project" });
    }

    const sprints = await sprintModel.find({ project: projectId });

    return res.status(200).json({ message: "Sprints fetched successfully", sprints });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching sprints", error: err.message });
  }
};

const getSprintInternal = async (req, res) => {
  try {
    const sprintId = req.params.id;

    const sprint = await sprintModel.findById(sprintId);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    // Fetch the project from the Project service using the project ID stored on the sprint
    const project = await ProjectClient.getProjectById(sprint.project, req.headers.authorization);
    if (!project) return res.status(404).json({ message: "Associated project not found" });

    const sprintObj = sprint.toObject();
    sprintObj.project = {
      _id: project._id,
      name: project.name,
      description: project.description
    };

    return res.status(200).json({ message: "Sprint fetched successfully", sprint: sprintObj });

  } catch (err) {
    return res.status(500).json({ message: "Error fetching sprint", error: err.message });
  }
};

const getSprintById = async (req, res) => {
  try {
    const sprintId = req.params.id;
    const userId = req.user.userId;

    const sprint = await sprintModel.findById(sprintId);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    const project = await ProjectClient.getProjectById(sprint.project, req.headers.authorization);
    if (!project) return res.status(404).json({ message: "Associated project not found" });

      const membership = project.members.find(m => {
  const userIdInMember =
    typeof m.user === "object" && m.user._id
      ? m.user._id.toString()
      : m.user.toString();

  return userIdInMember === userId;
});
    if (!membership) return res.status(403).json({ message: "Forbidden: not a project member" });

    const sprintObj = sprint.toObject();
    sprintObj.project = {
      _id: project._id,
      name: project.name,
      description: project.description
    };

    return res.status(200).json({ message: "Sprint fetched successfully", sprint: sprintObj });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching sprint", error: err.message });
  }
};

const getAllSprints = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch projects from Project Service where user is a member
    const projects = await ProjectClient.getUserProjects(req.headers.authorization);
    if (!projects || projects.length === 0) {
      return res.status(200).json({ message: "Sprints fetched successfully", sprints: [] });
    }

    const projectIds = projects.map(p => p._id);
    const sprints = await sprintModel.find({ project: { $in: projectIds } });

    return res.status(200).json({ message: "Sprints fetched successfully", sprints });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching sprints", error: err.message });
  }
};

module.exports = { createSprint, updateSprint, deleteSprint, getSprintByProject, getSprintById,getSprintInternal, getAllSprints };

