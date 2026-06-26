import { useEffect, useState }    from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout                     from "../../Layout";
import Loader                     from "../../components/common/Loader";
import ErrorMessage               from "../../components/common/ErrorMessage";
import issueApi                   from "../../api/issueApi";
import "./IssuePage.css";

const IssuePage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [issue,   setIssue]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await issueApi.getIssueById(id);
      setIssue(res.data.issue);
      setForm({
        title:       res.data.issue.title,
        description: res.data.issue.description || "",
        priority:    res.data.issue.priority,
        status:      res.data.issue.status,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load issue");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await issueApi.updateIssue(id, form);
      setIssue(res.data.issue);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update issue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this issue? This cannot be undone.")) return;
    try {
      await issueApi.deleteIssue(id);
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete issue");
    }
  };

  const statusColor = (s) => {
    if (s === "done")        return { background: "#E1F5EE", color: "#085041" };
    if (s === "in-progress") return { background: "#EEEDFE", color: "#3C3489" };
    if (s === "in-review")   return { background: "#FAEEDA", color: "#633806" };
    return { background: "#F1EFE8", color: "#5F5E5A" };
  };

  const priorityColor = (p) => {
    if (p === "high")   return { background: "#FCEBEB", color: "#791F1F" };
    if (p === "medium") return { background: "#FAEEDA", color: "#633806" };
    return { background: "#EAF3DE", color: "#27500A" };
  };

  if (loading) return <Layout><Loader text="Loading issue..." /></Layout>;
  if (error)   return <Layout><ErrorMessage message={error} onRetry={load} /></Layout>;
  if (!issue)  return null;

  return (
    <Layout>
      <div className="issue-page">

        <button className="issue-page-back" onClick={() => navigate(-1)}>
          <i className="ti ti-arrow-left" aria-hidden="true" /> Back
        </button>

        <div className="issue-page-grid">

          {/* ── Main content ── */}
          <div className="issue-page-main">

            <div className="issue-page-header">
              <div className="issue-page-badges">
                <span className="issue-page-badge" style={statusColor(issue.status)}>{issue.status}</span>
                <span className="issue-page-badge" style={priorityColor(issue.priority)}>
                  <i className="ti ti-flag" aria-hidden="true" /> {issue.priority}
                </span>
              </div>
              <div className="issue-page-actions">
                {!editing && (
                  <button className="issue-page-edit-btn" onClick={() => setEditing(true)}>
                    <i className="ti ti-edit" aria-hidden="true" /> Edit
                  </button>
                )}
                <button className="issue-page-delete-btn" onClick={handleDelete}>
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>
            </div>

            {editing ? (
              <div className="issue-page-edit">
                <input
                  className="issue-page-input"
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
                <textarea
                  className="issue-page-input issue-page-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Add a description..."
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="issue-page-label">Priority</label>
                    <select className="issue-page-input" name="priority" value={form.priority} onChange={handleChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="issue-page-label">Status</label>
                    <select className="issue-page-input" name="status" value={form.status} onChange={handleChange}>
                      <option value="todo">To do</option>
                      <option value="in-progress">In progress</option>
                      <option value="in-review">In review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
                <div className="issue-page-edit-actions">
                  <button className="issue-page-cancel" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="issue-page-save" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="issue-page-title">{issue.title}</h1>
                <p className="issue-page-desc">
                  {issue.description || <span style={{ color: "var(--color-text-tertiary)" }}>No description provided</span>}
                </p>
              </div>
            )}

          </div>

          {/* ── Sidebar info ── */}
          <div className="issue-page-side">
            <div className="issue-side-card">
              <div className="issue-side-row">
                <span className="issue-side-label"><i className="ti ti-user" aria-hidden="true" /> Assignee</span>
                <span className="issue-side-value">{issue.assignee?.name || "Unassigned"}</span>
              </div>
              <div className="issue-side-row">
                <span className="issue-side-label"><i className="ti ti-layout-kanban" aria-hidden="true" /> Sprint</span>
                <span className="issue-side-value">{issue.sprint?.name || "No sprint"}</span>
              </div>
              <div className="issue-side-row">
                <span className="issue-side-label"><i className="ti ti-folder" aria-hidden="true" /> Project</span>
                <span className="issue-side-value">{issue.project?.name || "—"}</span>
              </div>
              <div className="issue-side-row">
                <span className="issue-side-label"><i className="ti ti-calendar" aria-hidden="true" /> Created</span>
                <span className="issue-side-value">{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default IssuePage;