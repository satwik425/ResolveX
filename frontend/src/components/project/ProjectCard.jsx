import { useNavigate } from "react-router-dom";
import { useProject }  from "../../contexts/ProjectContext";
import "./ProjectCard.css";

const statusColor = (status) => {
  if (status === "active")    return "status-active";
  if (status === "completed") return "status-done";
  if (status === "on-hold")   return "status-hold";
  return "status-active";
};

const ProjectCard = ({ project }) => {
  const { deleteProject } = useProject();
  const navigate          = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project?")) return;
    await deleteProject(project._id);
  };

  return (
    <div
      className="proj-card"
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      <div className="proj-card-header">
        <span className={`proj-status ${statusColor(project.status)}`}>
          {project.status || "active"}
        </span>
        <button className="proj-delete" onClick={handleDelete} aria-label="Delete project">
          <i className="ti ti-trash" aria-hidden="true" />
        </button>
      </div>

      <h3 className="proj-name">{project.name}</h3>
      <p className="proj-desc">{project.description || "No description"}</p>

      <div className="proj-footer">
        <div className="proj-meta">
          <i className="ti ti-users" aria-hidden="true" />
          {project.members?.length} members
        </div>
        <div className="proj-lead">
          <div className="proj-lead-avatar">
            {project.lead?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <span>{project.lead?.name || "Unknown"}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;