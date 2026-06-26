import { useState }     from "react";
import { useNavigate }  from "react-router-dom";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import "../css/Modal.css";

const JoinWorkspaceModal = ({ onClose }) => {
  const { joinByCode } = useWorkspace();
  const navigate = useNavigate();

  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      // If user inputs full URL, extract the code part
      let inviteCode = code.trim();
      if (inviteCode.includes("/join/")) {
        inviteCode = inviteCode.split("/join/").pop();
      }
      
      const ws = await joinByCode(inviteCode);
      onClose();
      navigate(`/workspaces/${ws._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join workspace. Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2 className="modal-title">Join a workspace</h2>
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
            <label className="modal-label">Invite Code or Link</label>
            <input
              className="modal-input"
              type="text"
              placeholder="e.g. a1b2c3d4 or http://localhost:5173/join/a1b2c3d4"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
            />
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6 }}>
              Enter the 8-character invite code or the full invitation link.
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit" disabled={loading}>
              <i className="ti ti-login" aria-hidden="true" />
              {loading ? "Joining..." : "Join workspace"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default JoinWorkspaceModal;
