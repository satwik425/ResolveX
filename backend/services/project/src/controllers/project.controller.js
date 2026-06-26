const projectModel = require("../models/projectModel");
const { UserClient, WorkspaceClient } = require("../utils/apiClients");
const {  publishActivityLog } = require("../utils/rabbitMQ");

// Helper to populate workspace, lead, and members details from external services
const populateProjectDetails = async (project, authHeader) => {
  if (!project) return null;
  const projectObj = project.toObject ? project.toObject() : project;

  // 1. Populate Workspace
  if (projectObj.workspace) {
    try {
      const workspaceData = await WorkspaceClient.getWorkspaceById(projectObj.workspace, authHeader);
      if (workspaceData) {
        projectObj.workspace = {
          _id: workspaceData._id,
          name: workspaceData.name,
          description: workspaceData.description
        };
      } else {
        projectObj.workspace = { _id: projectObj.workspace, name: "Unknown Workspace", description: "" };
      }
    } catch (err) {
      projectObj.workspace = { _id: projectObj.workspace, name: "Unknown Workspace", description: "" };
    }
  }

  // 2. Populate Lead
  if (projectObj.lead) {
    try {
      const leadData = await UserClient.getUserById(projectObj.lead, authHeader);
      if (leadData) {
        projectObj.lead = { _id: leadData._id, name: leadData.name, email: leadData.email };
      } else {
        projectObj.lead = { _id: projectObj.lead, name: "Unknown Lead", email: "" };
      }
    } catch (err) {
      projectObj.lead = { _id: projectObj.lead, name: "Unknown Lead", email: "" };
    }
  }

  // 3. Populate Members
  const populatedMembers = await Promise.all(
    projectObj.members.map(async (member) => {
      try {
        const userData = await UserClient.getUserById(member.user, authHeader);
        return {
          ...member,
          user: userData
            ? { _id: userData._id, name: userData.name, email: userData.email }
            : { _id: member.user, name: "Unknown User", email: "" }
        };
      } catch (err) {
        return {
          ...member,
          user: { _id: member.user, name: "Unknown User", email: "" }
        };
      }
    })
  );
  projectObj.members = populatedMembers;

  return projectObj;
};

const createProject = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description, members = [] } = req.body;
    const workspaceId = req.body.workspaceId || req.body.workspace;

    // Retrieve Workspace from Workspace Service
    const workspace = await WorkspaceClient.getWorkspaceById(workspaceId, req.headers.authorization);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if creator is owner or admin in workspace
    const creatorMembership = workspace.members.find(
      (m) => (m.user._id || m.user).toString() === userId
    );
    if (!creatorMembership || !["owner", "admin"].includes(creatorMembership.role)) {
      return res.status(403).json({ message: "Forbidden: only owner or admin can create projects" });
    }

    // Validate project members: must exist in workspace
    const validatedMembers = [];
    for (const member of members) {
      const memberCheck = workspace.members.some(
        (m) => (m.user._id || m.user).toString() === member.user.toString()
      );
      if (!memberCheck) {
        return res.status(400).json({ message: `User ${member.user} is not a member of this workspace` });
      }
      if (!validatedMembers.some((m) => m.user.toString() === member.user.toString())) {
        validatedMembers.push(member);
      }
    }

    // Assign creator role in project
    const creatorRole = creatorMembership.role === "owner" ? "lead" : "admin";
    validatedMembers.push({ user: userId, role: creatorRole });

    // Create project
    const project = await projectModel.create({
      name,
      description,
      workspace: workspaceId,
      lead: userId,
      members: validatedMembers
    });

    publishActivityLog({
      performedBy: req.user.userId,
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: project._id,
      description: `${req.user.userName} created project "${project.name}"`,
      workspace: workspaceId,
      project: project._id
    });

    const populated = await populateProjectDetails(project, req.headers.authorization);
    return res.status(201).json({
      message: "Project created successfully",
      project: populated
    });
  } catch (err) {
    return res.status(500).json({ message: "Error creating project", error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;
    const { name, description, status } = req.body;

    if (!name && !description && !status) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const project = await projectModel.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is lead or admin in project
    const membership = project.members.find(
      (m) => m.user.toString() === userId
    );
    if (!membership || !["lead", "admin"].includes(membership.role)) {
      return res.status(403).json({ message: "Forbidden: only lead or admin can update projects" });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;

    await project.save();

     publishActivityLog({
      performedBy: req.user.userId,
      action: "PROJECT_UPDATED",
      entityType: "PROJECT",
      entityId: project._id,
      description: `${req.user.userName} updated project "${project.name}"`,
      workspace: project.workspace,
      project: project._id
    });

    const populated = await populateProjectDetails(project, req.headers.authorization);
    return res.status(200).json({
      message: "Project updated successfully",
      project: populated
    });
  } catch (err) {
    return res.status(500).json({ message: "Error updating project", error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;
    const project = await projectModel.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (userId !== project.lead.toString()) {
      return res.status(403).json({ message: "Forbidden: only lead can delete projects" });
    }
    await projectModel.findByIdAndDelete(id);

    publishActivityLog({
      performedBy: req.user.userId,
      action: "PROJECT_DELETED",
      entityType: "PROJECT",
      entityId: project._id,
      description: `${req.user.userName} deleted project "${project.name}"`,
      workspace: project.workspace,
      project: project._id
    });

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting project", error: err.message });
  }
};


const getProjectByIdInternal = async (req, res) => {
  try {
    const id = req.params.id;
    const project= await projectModel.findById(id);

    if (!project) {
      return res.status(404).json({ message: "project not found" });
    }

    
    const projectObj = project.toObject();
    return res.status(200).json({
      message: "project fetched successfully",
      project: projectObj
    });
  } catch (err) {
    return res.status(500).json({
      message: "error fetching project",
      error: err.message
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find projects where user is a member
    const projects = await projectModel.find({
      members: { $elemMatch: { user: userId } }
    });

    const populatedProjects = await Promise.all(
      projects.map((p) => populateProjectDetails(p, req.headers.authorization))
    );

    return res.status(200).json({
      message: "Projects fetched successfully",
      projects: populatedProjects
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching projects",
      error: err.message
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;

    const project = await projectModel.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is a member of the project
    const isMember = project.members.some(
      (m) => m.user.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Forbidden: you are not a member of this project" });
    }

    const populated = await populateProjectDetails(project, req.headers.authorization);
    return res.status(200).json({
      message: "Project fetched successfully",
      project: populated
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching project",
      error: err.message
    });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;
    const { newMemberId, role } = req.body;

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if logged-in user is lead or admin in project
    const membership = project.members.find(
      (m) => m.user.toString() === userId
    );
    if (!membership || !["lead", "admin"].includes(membership.role)) {
      return res.status(403).json({ message: "Forbidden: only lead or admin can add members" });
    }

    // Load workspace details to verify the member exists in the workspace
    const workspace = await WorkspaceClient.getWorkspaceById(project.workspace, req.headers.authorization);
    if (!workspace) {
      return res.status(400).json({ message: "Workspace not found" });
    }

    const workspaceMember = workspace.members.find(
      (m) => (m.user._id || m.user).toString() === newMemberId
    );
    if (!workspaceMember) {
      return res.status(400).json({ message: "User is not part of the workspace" });
    }

    // Prevent duplicates
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === newMemberId
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a project member" });
    }

    // Add new member
    project.members.push({ user: newMemberId, role });
    await project.save();

    publishActivityLog({
      performedBy: req.user.userId,
      action: "PROJECT_MEMBER_ADDED",
      entityType: "PROJECT",
      entityId: project._id,
      description: `${req.user.userName} added ${workspaceMember.user?.name || newMemberId} to project "${project.name}"`,
      workspace: project.workspace,
      project: project._id
    });

    const populated = await populateProjectDetails(project, req.headers.authorization);
    return res.status(200).json({
      message: "Member added successfully",
      project: populated
    });
  } catch (err) {
    return res.status(500).json({ message: "Error adding member", error: err.message });
  }
};

const removeProjectMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const projectId = req.params.id;
    const memberId = req.params.memberId;

    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "project not found"
      });
    }

    const member = project.members.find(
  (m) => (m.user._id || m.user).toString() === memberId
);

    if(!member){
      return res.status(404).json({
        message:"member not found",
      })
    }

    const membership = project.members.find((m) => m.user.toString() === userId);
    if (!membership || !["lead", "admin"].includes(membership.role)) {
      return res.status(403).json({
        message: "only lead or admin can remove members"
      });
    }

    const removedUser = await UserClient.getUserById(memberId, req.headers.authorization);

    project.members = project.members.filter(m => m.user.toString() !== memberId);
    await project.save();

      publishActivityLog({
      performedBy: req.user.userId,
      action: "PROJECT_MEMBER_REMOVED",
      entityType: "PROJECT",
      entityId: project._id,
      description: `${req.user.userName} removed ${removedUser?.name || memberId} from project "${project.name}"`,
      workspace: project.workspace,
      project: project._id
    });

    const populated = await populateProjectDetails(project, req.headers.authorization);
    return res.status(200).json({ message: "Member removed successfully", project: populated });
  } catch (err) {
    return res.status(500).json({ message: "Error removing member", error: err.message });
  }
};

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  addProjectMember,
  removeProjectMember,
  getProjectByIdInternal
};

