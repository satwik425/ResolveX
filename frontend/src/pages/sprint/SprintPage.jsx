import { useEffect, useState }    from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout                     from "../../Layout";
import SprintBoard                from "../../components/sprint/SprintBoard";
import CreateIssueModal           from "../../components/issue/CreateIssueModal";
import IssueDetail                from "../../components/issue/IssueDetail";
import BurndownChart              from "../../components/sprint/BurndownChart";
import Loader                     from "../../components/common/Loader";
import ErrorMessage               from "../../components/common/ErrorMessage";
import sprintApi                  from "../../api/sprintApi";
import issueApi                   from "../../api/issueApi";
import "./SprintPage.css";

const SprintPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [sprint,        setSprint]        = useState(null);
  const [issues,        setIssues]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [showModal,     setShowModal]     = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [view,          setView]          = useState("board");

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sprintRes, issuesRes] = await Promise.all([
        sprintApi.getSprintById(id),
        issueApi.getIssuesBySprint(id)
      ]);
      setSprint(sprintRes.data.sprint);
      setIssues(issuesRes.data.issues || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sprint");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loader text="Loading sprint..." /></Layout>;
  if (error)   return <Layout><ErrorMessage message={error} onRetry={load} /></Layout>;
  if (!sprint) return null;

  const statusColor = (s) => {
    if (s === "active")    return { background: "#E1F5EE", color: "#085041" };
    if (s === "completed") return { background: "#EEEDFE", color: "#3C3489" };
    return { background: "#FAEEDA", color: "#633806" };
  };

  return (
    <Layout>
      <div className="sprint-page">

        {/* ── Header ── */}
        <div className="sprint-page-header">
          <div>
            <button className="proj-detail-back" onClick={() => navigate(-1)}>
              <i className="ti ti-arrow-left" aria-hidden="true" /> Back
            </button>
            <div className="sprint-page-title-row">
              <h1 className="sprint-page-title">{sprint.name}</h1>
              <span className="sprint-page-status" style={statusColor(sprint.status)}>
                {sprint.status}
              </span>
            </div>
            <p className="sprint-page-dates">
              <i className="ti ti-calendar" aria-hidden="true" />
              {new Date(sprint.startDate).toLocaleDateString()} →{" "}
              {new Date(sprint.endDate).toLocaleDateString()}
            </p>
          </div>
          <button className="ws-page-btn" onClick={() => setShowModal(true)}>
            <i className="ti ti-plus" aria-hidden="true" /> New issue
          </button>
        </div>

        {/* ── Stats bar ── */}
        <div className="sprint-page-stats">
          {[
            { label: "Total",       value: issues.length,                                        color: "#534AB7" },
            { label: "To do",       value: issues.filter(i => i.status === "TODO" || i.status === "todo").length,        color: "#888780" },
            { label: "In progress", value: issues.filter(i => i.status === "IN_PROGRESS" || i.status === "in-progress").length, color: "#534AB7" },
            { label: "Done",        value: issues.filter(i => i.status === "DONE" || i.status === "done").length,        color: "#1D9E75" },
          ].map((s) => (
            <div className="sprint-stat" key={s.label}>
              <span className="sprint-stat-value" style={{ color: s.color }}>{s.value}</span>
              <span className="sprint-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Sub Navigation Tabs ── */}
        <div className="ws-detail-tabs" style={{ marginTop: 24, marginBottom: 24 }}>
          <button
            className={`ws-tab ${view === "board" ? "ws-tab-active" : ""}`}
            onClick={() => setView("board")}
          >
            <i className="ti ti-layout-kanban" aria-hidden="true" />
            Sprint Board
          </button>
          <button
            className={`ws-tab ${view === "burndown" ? "ws-tab-active" : ""}`}
            onClick={() => setView("burndown")}
          >
            <i className="ti ti-chart-line" aria-hidden="true" />
            Burndown Chart
          </button>
        </div>

        {/* ── Content View ── */}
        {view === "board" ? (
          <SprintBoard
            sprint={sprint}
            issues={issues}
            onIssueClick={(issue) => setSelectedIssue(issue)}
            onIssueUpdate={(updated) =>
              setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
            }
          />
        ) : (
          <BurndownChart sprint={sprint} issues={issues} />
        )}

      </div>

        {showModal && (
        <CreateIssueModal
        sprintId={id}
        projectId={sprint.project?._id || sprint.project}   // ✅ extracts the ID
        onClose={() => setShowModal(false)}
        onCreated={(issue) => setIssues((prev) => [...prev, issue])}
      />
        )}

      {selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdated={(updated) => {
            setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
            setSelectedIssue(updated);
          }}
          onDeleted={(deletedId) => {
            setIssues((prev) => prev.filter((i) => i._id !== deletedId));
            setSelectedIssue(null);
          }}
        />
      )}
    </Layout>
  );
};

export default SprintPage;