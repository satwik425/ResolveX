import { useEffect, useState }     from "react";
import { useWorkspace }            from "../../contexts/WorkspaceContext";
import Layout                      from "../../Layout";
import WorkspaceCard               from "../../components/workspace/WorkspaceCard";
import CreateWorkspaceModal        from "../../components/workspace/CreateWorkspaceModal";
import JoinWorkspaceModal          from "../../components/workspace/JoinWorkspaceModal";
import Loader                      from "../../components/common/Loader";
import ErrorMessage                from "../../components/common/ErrorMessage";
import "./WorkspacePage.css";

const WorkspacePage = () => {
  const { workspaces, fetchWorkspaces, loading, error } = useWorkspace();
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <Layout>
      <div className="ws-page">

        {/* ── Header ── */}
        <div className="ws-page-header">
          <div>
            <h1 className="ws-page-title">Workspaces</h1>
            <p className="ws-page-sub">Manage your teams and projects</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="ws-page-btn ws-page-btn-secondary" onClick={() => setShowJoinModal(true)}>
              <i className="ti ti-login" aria-hidden="true" />
              Join with code
            </button>
            <button className="ws-page-btn" onClick={() => setShowModal(true)}>
              <i className="ti ti-plus" aria-hidden="true" />
              New workspace
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading && <Loader text="Loading workspaces..." />}
        {error   && <ErrorMessage message={error} onRetry={fetchWorkspaces} />}

        {!loading && !error && workspaces.length === 0 && (
          <div className="ws-page-empty">
            <i className="ti ti-layout-grid" aria-hidden="true" />
            <p>No workspaces yet</p>
            <button className="ws-page-btn" onClick={() => setShowModal(true)}>
              Create your first workspace
            </button>
          </div>
        )}

        {!loading && !error && workspaces.length > 0 && (
          <div className="ws-page-grid">
            {workspaces.map((ws) => (
              <WorkspaceCard key={ws._id} workspace={ws} />
            ))}
          </div>
        )}

      </div>

      {showModal && (
        <CreateWorkspaceModal onClose={() => setShowModal(false)} />
      )}
      {showJoinModal && (
        <JoinWorkspaceModal onClose={() => setShowJoinModal(false)} />
      )}
    </Layout>
  );
};

export default WorkspacePage;