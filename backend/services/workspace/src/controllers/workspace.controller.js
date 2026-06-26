const workspaceModel = require("../models/workspaceModel");
const { UserClient } = require("../utils/apiClients");
const {publishEvent, publishActivityLog}=require("../utils/rabbitMQ");

// Helper to populate user details from User Service
const populateWorkspaceMembers = async (workspace, authHeader) => {
  if (!workspace) return null;
  const workspaceObj = workspace.toObject ? workspace.toObject() : workspace;
  const populatedMembers = await Promise.all(
    workspaceObj.members.map(async (member) => {
      try {
        const userData = await UserClient.getUserById(member.user, authHeader);
        return {
          ...member,
          user: userData
            ? { _id: userData._id, name: userData.name, email: userData.email }
            : { _id: member.user, name: "Unknown User", email: "" }
        };
      } catch (err) {
         console.error(`Failed to fetch user ${member.user}:`, err.message);
        return {
          ...member,
          user: { _id: member.user, name: "Unknown User", email: "" }
        };
      }
    })
  );
  workspaceObj.members = populatedMembers;
  return workspaceObj;
};

const createWorkspace = async (req, res) => {
  try {
    const creatorId = req.user.userId;
    const { name, description, members } = req.body;
    const validatedMembers = [];

    for (const member of members || []) {
      const userExists = await UserClient.getUserById(member.user, req.headers.authorization);
      if (!userExists) {
        return res.status(400).json({
          message: `User with ID ${member.user} does not exist`
        });
      }
      validatedMembers.push(member);
    }

    if (!validatedMembers.some(m => m.user.toString() === creatorId)) {
      validatedMembers.push({ user: creatorId, role: "owner" });
    }

    const workspace = await workspaceModel.create({
      name,
      description,
      members: validatedMembers
    });

    publishActivityLog({
      performedBy: req.user.userId,
      action: "WORKSPACE_CREATED",
      entityType: "WORKSPACE",
      entityId: workspace._id,
      description: `${req.user.userName} created workspace "${workspace.name}"`,
      workspace: workspace._id,
      project: null
    });

    const populated = await populateWorkspaceMembers(workspace, req.headers.authorization);
    return res.status(201).json({
      message: "workspace created successfully",
      workspace: populated
    });
  } catch (err) {
    return res.status(500).json({
      message: "error creating workspace",
      error: err.message
    });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const id = req.params.id;
    const workspace = await workspaceModel.findById(id);
    if (!workspace) {
      return res.status(404).json({
        message: "workspace not found "
      });
    }

    const userId = req.user.userId;
    const isOwner = workspace.members.some(
      (m) => m.user.toString() === userId && m.role === "owner"
    );

    if (!isOwner) {
      return res.status(403).json({ message: "Only owner can update workspace" });
    }

    const { name, description } = req.body;

    if (!name && !description) {
      return res.status(400).json({
        message: "all fields empty "
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;

    const updatedworkspace = await workspaceModel.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

     publishActivityLog({
      performedBy: req.user.userId,
      action: "WORKSPACE_UPDATED",
      entityType: "WORKSPACE",
      entityId: updatedworkspace._id,
      description: `${req.user.userName} updated workspace "${updatedworkspace.name}"`,
      workspace: updatedworkspace._id,
      project: null
    });

    const populated = await populateWorkspaceMembers(updatedworkspace, req.headers.authorization);
    return res.status(200).json({
      message: "workspace updated successfully",
      workspace: populated
    });
  } catch (err) {
    return res.status(500).json({
      message: "error updating workspace",
      error: err.message
    });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const id = req.params.id;

    const workspace = await workspaceModel.findById(id);
    if (!workspace) {
      return res.status(404).json({
        message: "workspace not found "
      });
    }

    const userId = req.user.userId;
    const isOwner = workspace.members.some(
      (m) => m.user.toString() === userId && m.role === "owner"
    );

    if (!isOwner) {
      return res.status(403).json({ message: "only owner can delete." });
    }

    await workspaceModel.findByIdAndDelete(id);


     publishActivityLog({
      performedBy: req.user.userId,
      action: "WORKSPACE_DELETED",
      entityType: "WORKSPACE",
      entityId: workspace._id,
      description: `${req.user.userName} deleted workspace "${workspace.name}"`,
      workspace: workspace._id,
      project: null
    });

    return res.status(200).json({
      message: "workspace deleted successfully"
    });
  } catch (err) {
    return res.status(500).json({
      message: "error deleting workspace",
      error: err.message
    });
  }
};

const getAllWorkspace = async (req, res) => {
  try {
    const userId = req.user.userId;
    const workspaces = await workspaceModel.find({
      members: { $elemMatch: { user: userId } }
    });

    const populatedWorkspaces = await Promise.all(
      workspaces.map(w => populateWorkspaceMembers(w, req.headers.authorization))
    );

    return res.status(200).json({
      message: "workspace fetched successfully",
      workspaces: populatedWorkspaces
    });
  } catch (err) {
    return res.status(500).json({
      message: "error fetching workspace",
      error: err.message
    });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;
    const workspace = await workspaceModel.findById(id);

    if (!workspace) {
      return res.status(404).json({
        message: "workspace not found "
      });
    }
    const ismember = workspace.members.some(
      (m) => m.user.toString() === userId
    );
    if (!ismember) {
      return res.status(403).json({ message: "forbidden" });
    }

    const populated = await populateWorkspaceMembers(workspace, req.headers.authorization);
    return res.status(200).json({
      message: "workspace fetched successfully",
      workspace: populated
    });
  } catch (err) {
    return res.status(500).json({
      message: "error fetching workspace",
      error: err.message
    });
  }
};

// Internal service-to-service route — skips membership check
const getWorkspaceByIdInternal = async (req, res) => {
  try {
    const id = req.params.id;
    const workspace = await workspaceModel.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "workspace not found" });
    }

    // Return raw workspace with unpopulated members so Project Service
    // can do its own membership logic against plain ObjectId strings
    const workspaceObj = workspace.toObject();
    return res.status(200).json({
      message: "workspace fetched successfully",
      workspace: workspaceObj
    });
  } catch (err) {
    return res.status(500).json({
      message: "error fetching workspace",
      error: err.message
    });
  }
};

const crypto = require("crypto");

// Generate a short random invite code
const generateInviteCode = () => crypto.randomBytes(4).toString("hex"); // e.g. "a1b2c3d4"

// ── Owner generates/regenerates an invite link ──
const generateInviteLink = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const userId = req.user.userId;

    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.members.some(
      (m) => m.user.toString() === userId && m.role === "owner"
    );
    if (!isOwner) {
      return res.status(403).json({ message: "Only owner can generate invite links" });
    }

    workspace.inviteCode = generateInviteCode();
    await workspace.save();

    return res.status(200).json({
      message: "Invite link generated successfully",
      inviteCode: workspace.inviteCode,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error generating invite link", error: err.message });
  }
};

// ── Any logged-in user joins via invite code ──
const joinWorkspaceByCode = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const userId = req.user.userId;

    const workspace = await workspaceModel.findOne({ inviteCode });
    if (!workspace) {
      return res.status(404).json({ message: "Invalid or expired invite link" });
    }

    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === userId
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "You are already a member of this workspace" });
    }

    // ✅ Always joins as "member" role
    workspace.members.push({ user: userId, role: "member" });
    await workspace.save();

    publishActivityLog({
      performedBy: req.user.userId,
      action: "WORKSPACE_MEMBER_JOINED",
      entityType: "WORKSPACE",
      entityId: workspace._id,
      description: `${req.user.userName} joined workspace "${workspace.name}" via invite link`,
      workspace: workspace._id,
      project: null,
    });

    const populated = await populateWorkspaceMembers(workspace, req.headers.authorization);
    return res.status(200).json({
      message: "Joined workspace successfully",
      workspace: populated,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error joining workspace", error: err.message });
  }
};



// ── Owner changes a member's role (member ↔ admin) ──
const changeMemberRole = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const memberId = req.params.memberId;
    const userId = req.user.userId;
    const { role } = req.body;

    if (!["member", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'member' or 'admin'" });
    }

    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.members.some(
      (m) => m.user.toString() === userId && m.role === "owner"
    );
    if (!isOwner) {
      return res.status(403).json({ message: "Only owner can change member roles" });
    }

    const member = workspace.members.find((m) => m.user.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found in this workspace" });
    }

    if (member.role === "owner") {
      return res.status(400).json({ message: "Cannot change the owner's role" });
    }

    member.role = role;
    await workspace.save();

    publishActivityLog({
      performedBy: req.user.userId,
      action: "WORKSPACE_MEMBER_ROLE_CHANGED",
      entityType: "WORKSPACE",
      entityId: workspace._id,
      description: `${req.user.userName} changed a member's role to "${role}" in workspace "${workspace.name}"`,
      workspace: workspace._id,
      project: null,
    });

    const populated = await populateWorkspaceMembers(workspace, req.headers.authorization);
    return res.status(200).json({
      message: "Member role updated successfully",
      workspace: populated,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error updating member role", error: err.message });
  }
};


const getInviteLink = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const userId = req.user.userId;

    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.members.some(
      (m) => m.user.toString() === userId && m.role === "owner"
    );
    if (!isOwner) {
      return res.status(403).json({ message: "Only owner can view the invite link" });
    }

    return res.status(200).json({
      message: "Invite code fetched successfully",
      inviteCode: workspace.inviteCode || null,   // null if never generated yet
    });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching invite link", error: err.message });
  }
};




const removeWorkspaceMember = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const memberId = req.params.memberId;
    const userId = req.user.userId;

    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const member=workspace.members.find((m)=>(m.user._id || m.user).toString()===memberId);
    if(!member){return res.status(404).json({message:"member not found"})}

    const isOwner = workspace.members.some(m => m.user.toString() === userId && m.role === "owner");
    if (!isOwner) return res.status(403).json({ message: "Only owner can remove members" });

    workspace.members = workspace.members.filter(m => m.user.toString() !== memberId);
    await workspace.save();

     publishActivityLog({
      performedBy: req.user.userId,
      action: "WORKSPACE_MEMBER_REMOVED",
      entityType: "WORKSPACE",
      entityId: workspace._id,
      description: `${req.user.userName} removed a member ${memberId}`,
      workspace: workspace._id,
      project: null
    });

    const populated = await populateWorkspaceMembers(workspace, req.headers.authorization);
    return res.status(200).json({ message: "Member removed successfully", workspace: populated });
  } catch (err) {
    return res.status(500).json({ message: "Error removing member", error: err.message });
  }
};

module.exports = {
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
};
