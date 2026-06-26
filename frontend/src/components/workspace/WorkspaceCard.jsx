import { useState }     from "react";
import { useNavigate }  from "react-router-dom";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useAuth }      from "../../contexts/AuthContext";
import EditWorkspaceModal from "./EditWorkspaceModal";
import "./WorkspaceCard.css";

const WorkspaceCard = ({ workspace }) => {
  const { deleteWorkspace } = useWorkspace();
  const { user }            = useAuth();
  const navigate            = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  // ✅ Check if current logged-in user is the owner of THIS workspace
  const currentMembership = workspace.members?.find(
    (m) => m.user?._id === user?.id || m.user?._id === user?.userId
  );
  const isOwner = currentMembership?.role === "owner";

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this workspace?")) return;
    await deleteWorkspace(workspace._id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEdit(true);
  };

  return (
    <div
      className="ws-card"
      onClick={() => navigate(`/workspaces/${workspace._id}`)}
    >
      <div className="ws-card-header">
        <div className="ws-card-icon">
          {workspace.name?.charAt(0).toUpperCase()}
        </div>

        {/* ✅ Only render action buttons if user is owner */}
        {isOwner && (
          <div className="ws-card-actions">
            <button className="ws-card-edit" onClick={handleEdit} aria-label="Edit workspace">
              <i className="ti ti-edit" aria-hidden="true" />
            </button>
            <button className="ws-card-delete" onClick={handleDelete} aria-label="Delete workspace">
              <i className="ti ti-trash" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <h3 className="ws-card-name">{workspace.name}</h3>
      <p className="ws-card-desc">{workspace.description || "No description"}</p>

      <div className="ws-card-footer">
        <div className="ws-card-members">
          {workspace.members?.slice(0, 3).map((m, i) => (
            <div className="ws-card-avatar" key={i} style={{ zIndex: 3 - i }}>
              {m.user?.name?.charAt(0).toUpperCase() || "?"}
            </div>
          ))}
          {workspace.members?.length > 3 && (
            <div className="ws-card-avatar ws-card-avatar-more">
              +{workspace.members.length - 3}
            </div>
          )}
        </div>
        <span className="ws-card-member-count">
          {workspace.members?.length} member{workspace.members?.length !== 1 ? "s" : ""}
        </span>
      </div>

      {showEdit && (
        <EditWorkspaceModal
          workspace={workspace}
          onClose={(e) => { e?.stopPropagation(); setShowEdit(false); }}
        />
      )}
    </div>
  );
};

export default WorkspaceCard;