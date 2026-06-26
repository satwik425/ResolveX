import { useEffect, useState }     from "react";
import { useParams, useNavigate }  from "react-router-dom";
import { useWorkspace }            from "../../contexts/WorkspaceContext";
import { useProject }              from "../../contexts/ProjectContext";
import Layout                      from "../../Layout";
import ProjectCard                 from "../../components/project/ProjectCard";
import CreateProjectModal          from "../../components/project/CreateProjectModal";
import WorkspaceMemberList         from "../../components/workspace/MemberList";
import Loader                      from "../../components/common/Loader";
import ErrorMessage                from "../../components/common/ErrorMessage";
import InviteModal from "../../components/workspace/InviteModal";
import "./WorkspaceDetailPage.css";

const WorkspaceDetailPage = () => {
  const { id }                                              = useParams();
  const { currentWorkspace, fetchWorkspaceById, loading, error } = useWorkspace();
  const { projects, fetchProjects }                         = useProject();
  const navigate                                            = useNavigate();
  const [showInvite, setShowInvite] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tab,       setTab]       = useState("projects"); // "projects" | "members"

  useEffect(() => {
    fetchWorkspaceById(id);
    fetchProjects();
  }, [id]);

  if (loading) return <Layout><Loader text="Loading workspace..." /></Layout>;
  if (error)   return <Layout><ErrorMessage message={error} onRetry={() => fetchWorkspaceById(id)} /></Layout>;
  if (!currentWorkspace) return null;

  const workspaceProjects = projects.filter(
    (p) => p.workspace?._id === id || p.workspace === id
  );

  return (
    <Layout>
      <div className="ws-detail">

        {/* ── Header ── */}
        <div className="ws-detail-header">
          <button className="ws-detail-back" onClick={() => navigate("/workspaces")}>
            <i className="ti ti-arrow-left" aria-hidden="true" /> Workspaces
          </button>
          <div className="ws-detail-title-row">
            <div className="ws-detail-icon">
              {currentWorkspace.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="ws-detail-title">{currentWorkspace.name}</h1>
              <p className="ws-detail-sub">{currentWorkspace.description || "No description"}</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="ws-detail-tabs">
          <button
            className={`ws-tab ${tab === "projects" ? "ws-tab-active" : ""}`}
            onClick={() => setTab("projects")}
          >
            <i className="ti ti-layout-kanban" aria-hidden="true" />
            Projects ({workspaceProjects.length})
          </button>
          <button
            className={`ws-tab ${tab === "members" ? "ws-tab-active" : ""}`}
            onClick={() => setTab("members")}
          >
            <i className="ti ti-users" aria-hidden="true" />
            Members ({currentWorkspace.members?.length})
          </button>
        </div>

        {/* ── Projects tab ── */}
        {tab === "projects" && (
          <div>
            <div className="ws-detail-tab-header">
              <p className="ws-detail-tab-sub">Projects in this workspace</p>
              <button className="ws-page-btn" onClick={() => setShowModal(true)}>
                <i className="ti ti-plus" aria-hidden="true" /> New project
              </button>
            </div>

            {workspaceProjects.length === 0 ? (
              <div className="ws-page-empty">
                <i className="ti ti-layout-kanban" aria-hidden="true" />
                <p>No projects yet</p>
                <button className="ws-page-btn" onClick={() => setShowModal(true)}>
                  Create first project
                </button>
              </div>
            ) : (
              <div className="ws-page-grid">
                {workspaceProjects.map((p) => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Members tab ── */}
        {tab === "members" && (
          <div>
            <div className="ws-detail-tab-header">
              <p className="ws-detail-tab-sub">Members of this workspace</p>
              <button className="ws-page-btn" onClick={() => setShowInvite(true)}>
                <i className="ti ti-link" aria-hidden="true" /> Invite
              </button>
            </div>
            <div className="ws-detail-members">
              <WorkspaceMemberList workspace={currentWorkspace} />
            </div>
          </div>
        )}

      </div>

      {/* at the bottom, alongside the other modal */}
      {showInvite && (
        <InviteModal workspace={currentWorkspace} onClose={() => setShowInvite(false)} />
      )}
      {showModal && (
        <CreateProjectModal
          workspaceId={id}
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  );
};

export default WorkspaceDetailPage;