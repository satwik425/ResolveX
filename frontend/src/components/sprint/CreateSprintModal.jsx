import { useState } from "react";
import sprintApi    from "../../api/sprintApi";
import "../css/Modal.css";

const CreateSprintModal = ({ projectId, onClose, onCreated }) => {
  const [form,    setForm]    = useState({ name: "", startDate: "", endDate: "" });
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
    console.log("About to call sprintApi.createSprint with:", { ...form, projectId });  // ← ADD
    const res = await sprintApi.createSprint({ ...form, projectId });
    console.log("Response:", res);  // ← ADD
    onCreated(res.data.sprint);
    onClose();
  } catch (err) {
    console.error("Full error object:", err);  // ← ADD — this is the important one
    setError(err.response?.data?.message || "Failed to create sprint");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New sprint</h2>
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
            <label className="modal-label">Sprint name</label>
            <input
              className="modal-input"
              type="text"
              name="name"
              placeholder="e.g. Sprint 1"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">Start date</label>
            <input
              className="modal-input"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-label">End date</label>
            <input
              className="modal-input"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-btn-submit" disabled={loading}>
              <i className="ti ti-plus" aria-hidden="true" />
              {loading ? "Creating..." : "Create sprint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSprintModal;