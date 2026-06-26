import { useState }     from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useAuth }      from "../../contexts/AuthContext";
import "../css/MemberList.css";

const WorkspaceMemberList = ({ workspace }) => {
  const { removeMember, changeMemberRole } = useWorkspace();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  // Check if current user is owner of this workspace
  const currentMembership = workspace.members?.find(
    (m) => m.user?._id === user?.id || m.user?._id === user?.userId
  );
  const isOwner = currentMembership?.role === "owner";

  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      setError(null);
      await removeMember(workspace._id, memberId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      setError(null);
      await changeMemberRole(workspace._id, memberId, newRole);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member role");
    }
  };

  const roleColor = (role) => {
    if (role === "owner") return "badge-owner";
    if (role === "admin") return "badge-admin";
    return "badge-member";
  };

  return (
    <div className="member-list">
      <h3 className="member-list-title">Members</h3>
      {error && <p className="member-error">{error}</p>}

      {/* ── Existing members ── */}
      {workspace.members?.map((m) => (
        <div className="member-row" key={m.user?._id}>
          <div className="member-avatar">
            {m.user?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="member-info">
            <span className="member-name">{m.user?.name || "Unknown"}</span>
            <span className="member-email">{m.user?.email || ""}</span>
          </div>

          {isOwner && m.role !== "owner" ? (
            <select
              className="member-role-select"
              value={m.role}
              onChange={(e) => handleRoleChange(m.user?._id, e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          ) : (
            <span className={`member-badge ${roleColor(m.role)}`}>{m.role}</span>
          )}

          {m.role !== "owner" && isOwner && (
            <button
              className="member-remove"
              onClick={() => handleRemove(m.user?._id)}
              aria-label="Remove member"
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          )}
        </div>
      ))}

      {workspace.members?.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", padding: "8px 0" }}>
          No members yet
        </p>
      )}
    </div>
  );
};

export default WorkspaceMemberList;