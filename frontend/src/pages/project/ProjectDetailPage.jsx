import { useEffect, useState }    from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject }             from "../../contexts/ProjectContext";
import Layout                     from "../../Layout";
import SprintCard                 from "../../components/sprint/SprintCard";
import CreateSprintModal          from "../../components/sprint/CreateSprintModal";
import ProjectMemberList          from "../../components/project/ProjectMemberList";
import Loader                     from "../../components/common/Loader";
import ErrorMessage               from "../../components/common/ErrorMessage";
import sprintApi                  from "../../api/sprintApi";
import "./ProjectDetailPage.css";

const ProjectDetailPage = () => {
  const { id }                                             = useParams();
  const { currentProject, fetchProjectById, loading, error } = useProject();
  const navigate                                           = useNavigate();

  const [sprints,    setSprints]    = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [tab,        setTab]        = useState("sprints");
  const [sprintLoad, setSprintLoad] = useState(false);

  useEffect(() => {
    fetchProjectById(id);
    loadSprints();
  }, [id]);

  const loadSprints = async () => {
    try {
      setSprintLoad(true);
      const res = await sprintApi.getSprintByProject(id);
      setSprints(res.data.sprints || []);
    } catch (err){
      console.error("Failed to load sprints:", err); 
      setSprints([]);
    } finally {
      setSprintLoad(false);
    }
  };

  if (loading) return <Layout><Loader text="Loading project..." /></Layout>;
  if (error)   return <Layout><ErrorMessage message={error} onRetry={() => fetchProjectById(id)} /></Layout>;
  if (!currentProject) return null;

  return (
    <Layout>
      <div className="proj-detail">

        {/* ── Header ── */}
        <div>
          <button className="proj-detail-back" onClick={() => navigate(-1)}>
            <i className="ti ti-arrow-left" aria-hidden="true" /> Back
          </button>
          <div className="proj-detail-title-row">
            <div>
              <div className="proj-detail-meta-top">
                <span className="proj-detail-workspace">
                  {currentProject.workspace?.name}
                </span>
                <i className="ti ti-chevron-right" style={{ fontSize: 13, color: "var(--color-text-tertiary)" }} aria-hidden="true" />
              </div>
              <h1 className="proj-detail-title">{currentProject.name}</h1>
              <p className="proj-detail-sub">{currentProject.description || "No description"}</p>
            </div>
            <div className="proj-detail-lead">
              <div className="proj-lead-avatar">
                {currentProject.lead?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Lead</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
                  {currentProject.lead?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="ws-detail-tabs">
          <button
            className={`ws-tab ${tab === "sprints" ? "ws-tab-active" : ""}`}
            onClick={() => setTab("sprints")}
          >
            <i className="ti ti-run" aria-hidden="true" />
            Sprints ({sprints.length})
          </button>
          <button
            className={`ws-tab ${tab === "members" ? "ws-tab-active" : ""}`}
            onClick={() => setTab("members")}
          >
            <i className="ti ti-users" aria-hidden="true" />
            Members ({currentProject.members?.length})
          </button>
        </div>

        {/* ── Sprints tab ── */}
        {tab === "sprints" && (
          <div>
            <div className="ws-detail-tab-header">
              <p className="ws-detail-tab-sub">All sprints in this project</p>
              <button className="ws-page-btn" onClick={() => setShowModal(true)}>
                <i className="ti ti-plus" aria-hidden="true" /> New sprint
              </button>
            </div>

            {sprintLoad && <Loader text="Loading sprints..." />}

            {!sprintLoad && sprints.length === 0 && (
              <div className="ws-page-empty">
                <i className="ti ti-run" aria-hidden="true" />
                <p>No sprints yet</p>
                <button className="ws-page-btn" onClick={() => setShowModal(true)}>
                  Start first sprint
                </button>
              </div>
            )}

            {!sprintLoad && sprints.length > 0 && (
              <div className="proj-detail-sprints">
                {sprints.map((s) => (
                  <SprintCard
                    key={s._id}
                    sprint={s}
                    onClick={() => navigate(`/sprints/${s._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Members tab ── */}
        {tab === "members" && (
          <div className="ws-detail-members">
            <ProjectMemberList project={currentProject} />
          </div>
        )}

      </div>

      {showModal && (
        <CreateSprintModal
          projectId={id}
          onClose={() => setShowModal(false)}
          onCreated={(s) => setSprints((prev) => [...prev, s])}
        />
      )}
    </Layout>
  );
};

export default ProjectDetailPage;