import { useState }    from "react";
import { useProject }  from "../../contexts/ProjectContext";
import "../css/Modal.css";

const CreateProjectModal = ({ workspaceId, onClose }) => {
  const { createProject } = useProject();

  const [form,    setForm]    = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createProject({ ...form, workspaceId });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New project</h2>
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
            <label className="modal-label">Project name</label>
            <input
              className="modal-input"
              type="text"
              name="name"
              placeholder="e.g. Mobile App Redesign"
              value={form.name}
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
              placeholder="What is this project about?"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-btn-submit" disabled={loading}>
              <i className="ti ti-plus" aria-hidden="true" />
              {loading ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;