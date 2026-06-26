import { useState }     from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import "../css/Modal.css";

const EditWorkspaceModal = ({ workspace, onClose }) => {
  const { updateWorkspace } = useWorkspace();

  const [form, setForm] = useState({
    name:        workspace.name || "",
    description: workspace.description || "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      await updateWorkspace(workspace._id, form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2 className="modal-title">Edit workspace</h2>
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
            <label className="modal-label">Workspace name</label>
            <input
              className="modal-input"
              type="text"
              name="name"
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
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit" disabled={loading}>
              <i className="ti ti-device-floppy" aria-hidden="true" />
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditWorkspaceModal;