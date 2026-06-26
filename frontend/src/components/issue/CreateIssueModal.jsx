import { useState, useEffect } from "react";
import issueApi                from "../../api/issueApi";
import projectApi               from "../../api/projectApi";
import "../css/Modal.css";

const CreateIssueModal = ({ sprintId, projectId, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title:       "",
    description: "",
    priority:    "MEDIUM",
    status:      "todo",
    storyPoints: 5,
    assignee:    "",
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(true);
  const [error,          setError]          = useState(null);

  // Fetch project members to populate the assignee dropdown
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setFetchingMembers(true);
        const res = await projectApi.getProjectById(projectId);
        setProjectMembers(res.data.project?.members || []);
      } catch {
        setProjectMembers([]);
      } finally {
        setFetchingMembers(false);
      }
    };
    if (projectId) loadMembers();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Don't send an empty string — backend expects null or a valid ObjectId
      const payload = {
        ...form,
        sprintId,
        projectId,
        assignee: form.assignee || null,
      };

      const res = await issueApi.createIssue(payload);
      onCreated?.(res.data.issue);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2 className="modal-title">New issue</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <i className="ti ti-alert-circle" aria-hidden="true" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label className="modal-label">Title</label>
            <input
              className="modal-input"
              type="text"
              name="title"
              placeholder="e.g. Fix login redirect bug"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">
              Description <span className="modal-optional">(optional)</span>
            </label>
            <textarea
              className="modal-input modal-textarea"
              name="description"
              placeholder="Describe the issue..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* ── Assignee dropdown ── */}
          <div className="modal-form-group">
            <label className="modal-label">
              Assignee <span className="modal-optional">(optional)</span>
            </label>
            <select
              className="modal-input"
              name="assignee"
              value={form.assignee}
              onChange={handleChange}
              disabled={fetchingMembers}
            >
              <option value="">Unassigned</option>
              {projectMembers.map((m) => (
                <option key={m.user?._id} value={m.user?._id}>
                  {m.user?.name} ({m.user?.email})
                </option>
              ))}
            </select>
            {fetchingMembers && (
              <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4 }}>
                Loading members...
              </p>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="modal-form-group">
              <label className="modal-label">Priority</label>
              <select
                className="modal-input"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label className="modal-label">Status</label>
              <select
                className="modal-input"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="in-review">In review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Story Points</label>
            <input
              className="modal-input"
              type="number"
              name="storyPoints"
              min="0"
              value={form.storyPoints}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit" disabled={loading}>
              <i className="ti ti-plus" aria-hidden="true" />
              {loading ? "Creating..." : "Create issue"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateIssueModal;