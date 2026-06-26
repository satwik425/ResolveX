import { useState, useEffect } from "react";
import { useProject }          from "../../contexts/ProjectContext";
import workspaceApi            from "../../api/workspaceApi";
import "../css/MemberList.css";

const ProjectMemberList = ({ project }) => {
  const { addMember, removeMember } = useProject();

  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [selectedUserId,   setSelectedUserId]   = useState("");
  const [newRole,          setNewRole]          = useState("viewer");
  const [loading,          setLoading]          = useState(false);
  const [fetchingWs,       setFetchingWs]       = useState(true);
  const [error,            setError]            = useState(null);

  // Fetch the workspace's full member list once, to populate the dropdown
  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        setFetchingWs(true);
        const workspaceId = project.workspace?._id || project.workspace;
        const res = await workspaceApi.getWorkspaceById(workspaceId);
        setWorkspaceMembers(res.data.workspace.members || []);
      } catch (err) {
        setError("Failed to load workspace members");
      } finally {
        setFetchingWs(false);
      }
    };
    loadWorkspace();
  }, [project.workspace]);

  // Workspace members not already in the project
  const existingProjectMemberIds = project.members?.map((m) => m.user?._id) || [];
  const availableMembers = workspaceMembers.filter(
    (m) => !existingProjectMemberIds.includes(m.user?._id)
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setLoading(true);
      setError(null);
      await addMember(project._id, { newMemberId: selectedUserId, role: newRole });
      setSelectedUserId("");
      setNewRole("member");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await removeMember(project._id, memberId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    }
  };

  const roleColor = (role) => {
    if (role === "lead")  return "badge-lead";
    if (role === "admin") return "badge-admin";
    return "badge-member";
  };

  return (
    <div className="member-list">
      <h3 className="member-list-title">Members</h3>

      {/* Existing project members */}
      {project.members?.map((m) => (
        <div className="member-row" key={m.user?._id}>
          <div className="member-avatar">
            {m.user?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="member-info">
            <span className="member-name">{m.user?.name || "Unknown"}</span>
            <span className="member-email">{m.user?.email || ""}</span>
          </div>
          <span className={`member-badge ${roleColor(m.role)}`}>{m.role}</span>
          {m.role !== "lead" && (
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

      {project.members?.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", padding: "8px 0" }}>
          No members yet
        </p>
      )}

      {/* Add member form — dropdown from workspace members */}
      <form className="member-add-form" onSubmit={handleAdd}>
        {error && <p className="member-error">{error}</p>}

        {fetchingWs ? (
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>Loading workspace members...</p>
        ) : availableMembers.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>
            All workspace members are already in this project
          </p>
        ) : (
          <div className="member-add-row">
            <select
              className="member-add-select"
              style={{ flex: 1 }}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select a member...</option>
              {availableMembers.map((m) => (
                <option key={m.user?._id} value={m.user?._id}>
                  {m.user?.name} ({m.user?.email})
                </option>
              ))}
            </select>

            <select
              className="member-add-select"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="developer">Developer</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>

            <button className="member-add-btn" type="submit" disabled={loading || !selectedUserId}>
              <i className="ti ti-user-plus" aria-hidden="true" />
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProjectMemberList;