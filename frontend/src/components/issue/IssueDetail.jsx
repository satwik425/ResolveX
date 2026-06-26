import { useState }  from "react";
import issueApi      from "../../api/issueApi";
import "./IssueDetail.css";

const IssueDetail = ({ issue, onClose, onUpdated, onDeleted }) => {
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({
    title:       issue.title,
    description: issue.description || "",
    priority:    issue.priority,
    status:      issue.status,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await issueApi.updateIssue(issue._id, form);
      onUpdated?.(res.data.issue);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update issue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      setLoading(true);
      setError(null);
      await issueApi.deleteIssue(issue._id);
      onDeleted?.(issue._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete issue");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s) => {
    if (s === "done")        return "status-done";
    if (s === "in-progress") return "status-progress";
    if (s === "in-review")   return "status-review";
    return "status-todo";
  };

  const priorityColor = (p) => {
    if (p === "high")   return "prio-high";
    if (p === "medium") return "prio-medium";
    return "prio-low";
  };

  return (
    <div className="issue-detail-overlay" onClick={onClose}>
      <div className="issue-detail" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="issue-detail-header">
          <div className="issue-detail-badges">
            <span className={`issue-status ${statusColor(issue.status)}`}>
              {issue.status}
            </span>
            <span className={`issue-prio ${priorityColor(issue.priority)}`}>
              <i className="ti ti-flag" aria-hidden="true" />
              {issue.priority}
            </span>
          </div>
          <div className="issue-detail-actions">
            {!editing && (
              <>
                <button className="issue-detail-edit-btn" onClick={() => setEditing(true)}>
                  <i className="ti ti-edit" aria-hidden="true" /> Edit
                </button>
                <button className="issue-detail-delete-btn" onClick={handleDelete} disabled={loading}>
                  <i className="ti ti-trash" aria-hidden="true" /> Delete
                </button>
              </>
            )}
            <button className="issue-detail-close" onClick={onClose} aria-label="Close">
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          </div>
        </div>

        {error && (
          <div className="issue-detail-error">
            <i className="ti ti-alert-circle" aria-hidden="true" /> {error}
          </div>
        )}

        {/* ── Content ── */}
        {editing ? (
          <div className="issue-detail-edit">
            <input
              className="issue-detail-input"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Issue title"
            />
            <textarea
              className="issue-detail-input issue-detail-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              rows={4}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="issue-detail-label">Priority</label>
                <select className="issue-detail-input" name="priority" value={form.priority} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="issue-detail-label">Status</label>
                <select className="issue-detail-input" name="status" value={form.status} onChange={handleChange}>
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="in-review">In review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="issue-detail-edit-actions">
              <button className="issue-detail-cancel" onClick={() => setEditing(false)}>Cancel</button>
              <button className="issue-detail-save" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="issue-detail-view">
            <h2 className="issue-detail-title">{issue.title}</h2>
            <p className="issue-detail-desc">
              {issue.description || <span style={{ color: "var(--color-text-tertiary)" }}>No description</span>}
            </p>
          </div>
        )}

        {/* ── Meta ── */}
        <div className="issue-detail-meta">
          <div className="issue-detail-meta-row">
            <span className="issue-detail-meta-label">
              <i className="ti ti-user" aria-hidden="true" /> Assignee
            </span>
            <span className="issue-detail-meta-value">
              {issue.assignee?.name || "Unassigned"}
            </span>
          </div>
          <div className="issue-detail-meta-row">
            <span className="issue-detail-meta-label">
              <i className="ti ti-calendar" aria-hidden="true" /> Created
            </span>
            <span className="issue-detail-meta-value">
              {new Date(issue.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="issue-detail-meta-row">
            <span className="issue-detail-meta-label">
              <i className="ti ti-layout-kanban" aria-hidden="true" /> Sprint
            </span>
            <span className="issue-detail-meta-value">
              {issue.sprint?.name || "No sprint"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IssueDetail;