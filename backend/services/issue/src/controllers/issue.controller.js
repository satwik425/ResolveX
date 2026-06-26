const commentModel = require("../models/commentModel");
const issueModel = require("../models/issueModel");
const { UserClient, ProjectClient, SprintClient } = require("../utils/apiClients");
const {publishEvent,publishActivityLog}=require("../utils/rabbitMQ")

// Helper to populate project, sprint, reporter, and assignee from external services
const populateIssueDetails = async (issue, authHeader) => {
  if (!issue) return null;
  const issueObj = issue.toObject ? issue.toObject() : issue;

  // 1. Populate Project
  if (issueObj.project) {
    try {
      const projectData = await ProjectClient.getProjectById(issueObj.project, authHeader);
      if (projectData) {
        issueObj.project = { _id: projectData._id, name: projectData.name, description: projectData.description };
      } else {
        issueObj.project = { _id: issueObj.project, name: "Unknown Project" };
      }
    } catch (err) {
      issueObj.project = { _id: issueObj.project, name: "Unknown Project" };
    }
  }

  // 2. Populate Sprint
  if (issueObj.sprint) {
    try {
      const sprintData = await SprintClient.getSprintById(issueObj.sprint, authHeader);
      if (sprintData) {
        issueObj.sprint = { _id: sprintData._id, name: sprintData.name };
      } else {
        issueObj.sprint = { _id: issueObj.sprint, name: "Unknown Sprint" };
      }
    } catch (err) {
      issueObj.sprint = { _id: issueObj.sprint, name: "Unknown Sprint" };
    }
  }

  // 3. Populate Reporter
  if (issueObj.reporter) {
    try {
      const reporterData = await UserClient.getUserById(issueObj.reporter, authHeader);
      if (reporterData) {
        issueObj.reporter = { _id: reporterData._id, name: reporterData.name, email: reporterData.email };
      } else {
        issueObj.reporter = { _id: issueObj.reporter, name: "Unknown User", email: "" };
      }
    } catch (err) {
      issueObj.reporter = { _id: issueObj.reporter, name: "Unknown User", email: "" };
    }
  }

  // 4. Populate Assignee
  if (issueObj.assignee) {
    try {
      const assigneeData = await UserClient.getUserById(issueObj.assignee, authHeader);
      if (assigneeData) {
        issueObj.assignee = { _id: assigneeData._id, name: assigneeData.name, email: assigneeData.email };
      } else {
        issueObj.assignee = { _id: issueObj.assignee, name: "Unknown User", email: "" };
      }
    } catch (err) {
      issueObj.assignee = { _id: issueObj.assignee, name: "Unknown User", email: "" };
    }
  }

  return issueObj;
};

const createIssue = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, projectId, sprintId, assignee, priority, storyPoints, dueDate, order } = req.body;

    const actualProjectId = (projectId && projectId._id) || projectId;
    const actualSprintId = (sprintId && sprintId._id) || sprintId;

    const project = await ProjectClient.getProjectById(actualProjectId, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (actualSprintId) {
      const sprint = await SprintClient.getSprintById(actualSprintId, req.headers.authorization);
      if (!sprint) {
        return res.status(404).json({ message: "Sprint not found" });
      }
    }

    const membership = project.members.find(m => userId === (m.user._id || m.user).toString());
    if (!membership || membership.role === "viewer") {
      return res.status(403).json({ message: "Unauthorized to access this feature" });
    }

    if (assignee) {
      const assigneecheck = project.members.some((m) => assignee === (m.user._id || m.user).toString());
      if (!assigneecheck) {
        return res.status(400).json({ message: "Assignee does not exist in project members" });
      }
    }

    const upperPriority = priority ? priority.toString().toUpperCase() : undefined;
    const upperStatus = req.body.status ? req.body.status.toString().toUpperCase().replace("-", "_") : undefined;

    const issue = await issueModel.create({
      title,
      description,
      project: actualProjectId,
      sprint: actualSprintId || null,
      reporter: userId,
      assignee: assignee || null,
      priority: upperPriority || "MEDIUM",
      status: upperStatus || "TODO",
      storyPoints,
      dueDate,
      order
    });

    await publishEvent("issue.assigned", {
  type: "ISSUE_ASSIGNED",
  issueTitle: issue.title,
  assignedToUserId: assignee,
  assignedByUserId: req.user.userId,
  projectName: project.name,
  timestamp: new Date().toISOString()
});

await publishActivityLog({
  performedBy: req.user.userId,
  action: "ISSUE_CREATED",
  entityType: "ISSUE",
  entityId: issue._id,
  description: `${req.user.userName} created issue "${issue.title}"`,
  workspace: issue.workspace,
  project: issue.project
});


    const populated = await populateIssueDetails(issue, req.headers.authorization);
    return res.status(201).json({
      message: "Issue created successfully",
      issue: populated
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error creating issue",
      error: err.message
    });
  }
};

const updateIssue = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;
    const { title, description, assignee, priority, storyPoints, dueDate, order } = req.body;

    const issue = await issueModel.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const project = await ProjectClient.getProjectById(issue.project, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Associated project not found" });
    }

    const membership = project.members.find(m => (m.user._id || m.user).toString() === userId);

    const canEdit =
      (issue.reporter.toString() === userId) ||
      (issue.assignee && issue.assignee.toString() === userId) ||
      (membership && ["lead", "admin"].includes(membership.role));

    if (!canEdit) {
      return res.status(403).json({ message: "Forbidden: you cannot update this issue" });
    }

    if (assignee) {
      const assigneecheck = project.members.some((m) => assignee === (m.user._id || m.user).toString());
      if (!assigneecheck) {
        return res.status(400).json({ message: "Assignee does not exist in project members" });
      }
    }

    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (assignee !== undefined) issue.assignee = assignee;
    if (priority !== undefined) issue.priority = priority.toUpperCase();
    if (req.body.status !== undefined) {
      const newStatus = req.body.status.toUpperCase().replace("-", "_");
      if (newStatus === "DONE" && issue.status !== "DONE") {
        issue.completedAt = new Date();
      } else if (newStatus !== "DONE") {
        issue.completedAt = undefined;
      }
      issue.status = newStatus;
    }
    if (storyPoints !== undefined) issue.storyPoints = storyPoints;
    if (dueDate !== undefined) issue.dueDate = dueDate;
    if (order !== undefined) issue.order = order;

    await issue.save();

    publishActivityLog({
  performedBy: req.user.userId,
  action: "ISSUE_UPDATED",
  entityType: "ISSUE",
  entityId: issue._id,
  description: `${req.user.userName} updated issue "${issue.title}"`,
  workspace: issue.workspace,
  project: issue.project
});

    const populated = await populateIssueDetails(issue, req.headers.authorization);
    return res.status(200).json({
      message: "Update done successfully",
      issue: populated
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error updating issue",
      error: err.message
    });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;

    const issue = await issueModel.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const project = await ProjectClient.getProjectById(issue.project, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Associated project not found" });
    }

    const membership = project.members.find(m => (m.user._id || m.user).toString() === userId);
    if (!membership || !["lead", "admin"].includes(membership.role)) {
      return res.status(403).json({ message: "Forbidden: only lead or admin can delete issues" });
    }

    await issueModel.findByIdAndDelete(id);

    publishActivityLog({
  performedBy: req.user.userId,
  action: "ISSUE_DELETED",
  entityType: "ISSUE",
  entityId: issue._id,
  description: `${req.user.userName} deleted issue "${issue.title}"`,
  workspace: issue.workspace,
  project: issue.project
});

    return res.status(200).json({ message: "Issue deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting issue", error: err.message });
  }
};

const getIssueById = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.userId;

    const issue = await issueModel.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const project = await ProjectClient.getProjectById(issue.project, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Associated project not found" });
    }

    const membership = project.members.find(m => (m.user._id || m.user).toString() === userId);
    if (!membership) {
      return res.status(403).json({ message: "Forbidden: you are not a member of this project" });
    }

    const populated = await populateIssueDetails(issue, req.headers.authorization);
    return res.status(200).json({ message: "Issue fetched successfully", issue: populated });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching issue", error: err.message });
  }
};

const getIssueByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user.userId;

    const project = await ProjectClient.getProjectById(projectId, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const membership = project.members.find(m => (m.user._id || m.user).toString() === userId);
    if (!membership) {
      return res.status(403).json({ message: "Forbidden: you are not a member of this project" });
    }

    const issues = await issueModel.find({ project: projectId });

    const populatedIssues = await Promise.all(
      issues.map(i => populateIssueDetails(i, req.headers.authorization))
    );

    return res.status(200).json({ message: "Issues fetched successfully", issues: populatedIssues });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching issues", error: err.message });
  }
};


const getIssuesBySprint = async (req, res) => {
  try {
    const sprintId = req.params.sprintId;
    const userId = req.user.userId;

    const sprint = await SprintClient.getSprintById(sprintId, req.headers.authorization);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const project = await ProjectClient.getProjectById(sprint.project._id || sprint.project, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Associated project not found" });
    }

    const membership = project.members.find(m => (m.user._id || m.user).toString() === userId);
    if (!membership) {
      return res.status(403).json({ message: "Forbidden: you are not a member of this project" });
    }

    const issues = await issueModel.find({ sprint: sprintId });

    const populatedIssues = await Promise.all(
      issues.map(i => populateIssueDetails(i, req.headers.authorization))
    );

    return res.status(200).json({ message: "Issues fetched successfully", issues: populatedIssues });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching issues", error: err.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch projects from Project Service where user is a member
    const projects = await ProjectClient.getUserProjects(req.headers.authorization);
    if (!projects || projects.length === 0) {
      return res.status(200).json({ message: "Issues fetched successfully", issues: [] });
    }

    const projectIds = projects.map(p => p._id);
    const issues = await issueModel.find({ project: { $in: projectIds } });

    const populatedIssues = await Promise.all(
      issues.map(i => populateIssueDetails(i, req.headers.authorization))
    );

    return res.status(200).json({ message: "Issues fetched successfully", issues: populatedIssues });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching issues", error: err.message });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.body;
    const issueId = req.params.id;

    const issue = await issueModel.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const project = await ProjectClient.getProjectById(issue.project, req.headers.authorization);
    if (!project) {
      return res.status(404).json({ message: "Associated project not found" });
    }

    const membership = project.members.find(m => (m.user._id || m.user).toString() === userId);

    const canUpdate =
      (issue.reporter.toString() === userId) ||
      (issue.assignee && issue.assignee.toString() === userId) ||
      (membership && ["lead", "admin"].includes(membership.role));

    if (!canUpdate) {
      return res.status(403).json({ message: "Forbidden: cannot update issue status" });
    }
    const oldStatus=issue.status;
    const upperStatus = status ? status.toUpperCase().replace("-", "_") : status;
    issue.status = upperStatus;
    if (upperStatus === "DONE") {
      issue.completedAt = new Date();
    } else {
      issue.completedAt = undefined;
    }
    await issue.save();


    publishActivityLog({
      performedBy: req.user.userId,
      action: "ISSUE_STATUS_CHANGED",
      entityType: "ISSUE",
      entityId: issue._id,
      description: `${req.user.userName} changed status of "${issue.title}" from "${oldStatus}" to "${status}"`,
      workspace: issue.workspace,
      project: issue.project
    });

    const populated = await populateIssueDetails(issue, req.headers.authorization);
    return res.status(200).json({
      message: "Issue status updated successfully",
      issue: populated
    });
  } catch (err) {
    return res.status(500).json({ message: "Error updating issue status", error: err.message });
  }
};

const commentOnIssue = async (req, res) => {
  try{
  const id=req.params.id;
  const autherId=req.user.userId;
  const {content}=req.body;

  if (!content) {
      return res.status(400).json({ message: "content cannot be empty" });
    }
  const issue=await issueModel.findById(id);
  if(!issue){
    return res.status(404).json({message:"issue not found"});
  }

  const comment=await commentModel.create({
    content,
    issue:issue._id,
    author:autherId
  });

   publishActivityLog({
      performedBy: req.user.userId,
      action: "COMMENT_ADDED",
      entityType: "COMMENT",
      entityId: comment._id,
      description: `${req.user.userName} commented on issue "${issue.title}"`,
      workspace: issue.workspace,
      project: issue.project
    });

  return res.status(201).json({
    message:"comment is created successfully",
    comment
  });
  }catch(err){
    return res.status(500).json({ message: "error creating comment",error:err.message });
  }
};

const getIssueComments = async (req, res) => {
  try{
  const id=req.params.id;
  const userId=req.user.userId;
  const issue=await issueModel.findById(id);
  if(!issue){
    return res.status(404).json({message:"issue not found"});
  }
  const user=await UserClient.getUserById(userId,req.headers.authorization);

  if(!user){
    return res.status(403).json({message:"user is not a project member"});
  }

  const comments=await commentModel.find({issue:issue._id}).sort({ createdAt: -1 });


  const populatedComments = await Promise.all(
      comments.map(async (comment) => {
        const commentObj = comment.toObject();
        try {
          const userData = await UserClient.getUserById(
            comment.author,
            req.headers.authorization
          );
          commentObj.author = userData
            ? { _id: userData._id, name: userData.name, email: userData.email }
            : { _id: comment.author, name: "Unknown User", email: "" };
        } catch {
          commentObj.author = { _id: comment.author, name: "Unknown User", email: "" };
        }
        return commentObj;
      })
    );

  return res.status(200).json({
    message:"comments are fetched successfully",
    comments: populatedComments
  });
  }catch(err){
    return res.status(500).json({ message: "error fetching comments",error:err.message });
  }
};

const deleteCommentsById=async(req,res)=>{
 try{
  const id=req.params.id;
  const userId=req.user.userId;

 

  const user=await UserClient.getUserById(userId,req.headers.authorization);

  if(!user){
    return res.status(403).json({message:"user is not a project member"});
  }

  const comment = await commentModel.findById(id);
if (!comment) {
  return res.status(404).json({ message: "Comment not found" });
}
if (comment.author.toString() !== userId) {
  return res.status(403).json({ message: "you can only delete your own comments" });
}
   const issue= await issueModel.findById(comment.issue);

  await commentModel.findByIdAndDelete(id);

  publishActivityLog({
      performedBy: req.user.userId,
      action: "COMMENT_DELETED",
      entityType: "COMMENT",
      entityId: comment._id,
      description: `${req.user.userName} deleted a comment `,
      workspace: issue.workspace,
      project: issue.project
    });

  return res.status(200).json({
    message:"comment is deleted successfully",
  });
  }catch(err){
    return res.status(500).json({ message: "error deleting comment",error:err.message });
  }
};
module.exports = {
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
};



