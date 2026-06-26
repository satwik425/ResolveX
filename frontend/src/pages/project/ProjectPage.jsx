import { useEffect, useState }   from "react";
import { useNavigate }           from "react-router-dom";
import { useProject }            from "../../contexts/ProjectContext";
import { useWorkspace }          from "../../contexts/WorkspaceContext";
import Layout                    from "../../Layout";
import ProjectCard               from "../../components/project/ProjectCard";
import CreateProjectModal        from "../../components/project/CreateProjectModal";
import Loader                    from "../../components/common/Loader";
import ErrorMessage              from "../../components/common/ErrorMessage";
import "./ProjectPage.css";

const ProjectPage = () => {
  const { projects, fetchProjects, loading, error } = useProject();
  const { workspaces, fetchWorkspaces }              = useWorkspace();
  const navigate                                     = useNavigate();

  const [showModal,    setShowModal]    = useState(false);
  const [filterWs,      setFilterWs]     = useState("all");

  useEffect(() => {
    fetchProjects();
    fetchWorkspaces();
  }, []);

  const filteredProjects = filterWs === "all"
    ? projects
    : projects.filter((p) => (p.workspace?._id || p.workspace) === filterWs);

  return (
    <Layout>
      <div className="proj-page">

        {/* ── Header ── */}
        <div className="proj-page-header">
          <div>
            <h1 className="proj-page-title">Projects</h1>
            <p className="proj-page-sub">All projects across your workspaces</p>
          </div>
          {workspaces.length > 0 && (
            <button className="proj-page-btn" onClick={() => setShowModal(true)}>
              <i className="ti ti-plus" aria-hidden="true" />
              New project
            </button>
          )}
        </div>

        {/* ── Workspace filter ── */}
        {workspaces.length > 0 && (
          <div className="proj-page-filters">
            <button
              className={`proj-filter-chip ${filterWs === "all" ? "proj-filter-active" : ""}`}
              onClick={() => setFilterWs("all")}
            >
              All workspaces
            </button>
            {workspaces.map((ws) => (
              <button
                key={ws._id}
                className={`proj-filter-chip ${filterWs === ws._id ? "proj-filter-active" : ""}`}
                onClick={() => setFilterWs(ws._id)}
              >
                {ws.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        {loading && <Loader text="Loading projects..." />}
        {error   && <ErrorMessage message={error} onRetry={fetchProjects} />}

        {!loading && !error && workspaces.length === 0 && (
          <div className="proj-page-empty">
            <i className="ti ti-layout-grid" aria-hidden="true" />
            <p>You need a workspace before creating projects</p>
            <button className="proj-page-btn" onClick={() => navigate("/workspaces")}>
              Go to workspaces
            </button>
          </div>
        )}

        {!loading && !error && workspaces.length > 0 && filteredProjects.length === 0 && (
          <div className="proj-page-empty">
            <i className="ti ti-layout-kanban" aria-hidden="true" />
            <p>No projects yet</p>
            <button className="proj-page-btn" onClick={() => setShowModal(true)}>
              Create your first project
            </button>
          </div>
        )}

        {!loading && !error && filteredProjects.length > 0 && (
          <div className="proj-page-grid">
            {filteredProjects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}

      </div>

      {showModal && (
        <CreateProjectModal
          workspaceId={filterWs !== "all" ? filterWs : workspaces[0]?._id}
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  );
};

export default ProjectPage;