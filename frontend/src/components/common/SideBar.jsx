import { useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useProject }   from "../../contexts/ProjectContext";
import "./CSSFile/Sidebar.css";

const Sidebar = () => {
  const { workspaces, currentWorkspace } = useWorkspace();
  const { projects }                     = useProject();
  const navigate                         = useNavigate();
  const location                         = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">

      {/* ── Workspaces ── */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Workspaces</div>
        {workspaces.map((ws) => (
          <div
            key={ws._id}
            className={`sidebar-item ${isActive(`/workspaces/${ws._id}`) ? "sidebar-item-active" : ""}`}
            onClick={() => navigate(`/workspaces/${ws._id}`)}
          >
            <div className="sidebar-ws-icon">
              {ws.name?.charAt(0).toUpperCase()}
            </div>
            <span className="sidebar-item-label">{ws.name}</span>
          </div>
        ))}

        <div
          className="sidebar-item sidebar-item-add"
          onClick={() => navigate("/workspaces")}
        >
          <i className="ti ti-plus" aria-hidden="true" />
          <span className="sidebar-item-label">New workspace</span>
        </div>
      </div>

      {/* ── Projects (only if inside a workspace) ── */}
      {currentWorkspace && (
        <div className="sidebar-section">
          <div className="sidebar-section-label">
            Projects — {currentWorkspace.name}
          </div>
          {projects.map((p) => (
            <div
              key={p._id}
              className={`sidebar-item ${isActive(`/projects/${p._id}`) ? "sidebar-item-active" : ""}`}
              onClick={() => navigate(`/projects/${p._id}`)}
            >
              <i className="ti ti-layout-kanban" aria-hidden="true" />
              <span className="sidebar-item-label">{p.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Bottom links ── */}
      <div className="sidebar-bottom">
        <div
          className={`sidebar-item ${isActive("/profile") ? "sidebar-item-active" : ""}`}
          onClick={() => navigate("/profile")}
        >
          <i className="ti ti-user" aria-hidden="true" />
          <span className="sidebar-item-label">Profile</span>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;