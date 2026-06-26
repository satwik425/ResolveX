import { useState, useEffect } from "react";
import { useWorkspace }        from "../../contexts/WorkspaceContext";
import "../css/Modal.css";

const InviteModal = ({ workspace, onClose }) => {
  const { getInviteLink, generateInviteLink } = useWorkspace();

  const [inviteCode, setInviteCode] = useState(null);
  const [loading,    setLoading]    = useState(true);   // loading on open now
  const [copied,     setCopied]     = useState(false);
  const [error,      setError]      = useState(null);

  // ✅ Fetch existing code when modal opens — doesn't change anything
  useEffect(() => {
    const load = async () => {
      try {
        const code = await getInviteLink(workspace._id);
        setInviteCode(code);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load invite link");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workspace._id]);

  const inviteUrl = inviteCode ? `${window.location.origin}/join/${inviteCode}` : null;

  const handleRegenerate = async () => {
    if (inviteCode && !window.confirm("This will invalidate the old link. Continue?")) return;
    try {
      setLoading(true);
      setError(null);
      const code = await generateInviteLink(workspace._id);
      setInviteCode(code);
      setCopied(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate invite link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2 className="modal-title">Invite people</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <i className="ti ti-alert-circle" aria-hidden="true" /> {error}
          </div>
        )}

        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
          Anyone with this link can join <strong>{workspace.name}</strong> as a member.
        </p>

        {loading ? (
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>Loading...</p>
        ) : inviteUrl ? (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input className="modal-input" type="text" readOnly value={inviteUrl} onClick={(e) => e.target.select()} />
            <button type="button" className="modal-btn-submit" onClick={handleCopy} style={{ flexShrink: 0 }}>
              <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 16 }}>
            No invite link generated yet.
          </p>
        )}

        <div className="modal-actions" style={{ justifyContent: "space-between" }}>
          <button type="button" className="modal-btn-cancel" onClick={handleRegenerate} disabled={loading}>
            <i className="ti ti-refresh" aria-hidden="true" />
            {inviteCode ? "Regenerate (revokes old link)" : "Generate link"}
          </button>
          <button type="button" className="modal-btn-submit" onClick={onClose}>Done</button>
        </div>

      </div>
    </div>
  );
};

export default InviteModal;