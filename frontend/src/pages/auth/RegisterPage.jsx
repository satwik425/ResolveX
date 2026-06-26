import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await register(form);
      navigate("/workspaces");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Left Panel ── */}
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <i className="ti ti-bolt" aria-hidden="true" />
          </div>
          <span className="auth-logo-name">Resolve<span>X</span></span>
        </div>

        <div className="auth-left-mid">
          <h1 className="auth-left-title">Join thousands of teams already shipping.</h1>
          <p className="auth-left-sub">Set up your workspace in under 2 minutes.</p>

          <div className="auth-chips">
            {[
              { label: "Fast setup",  icon: "ti-bolt",  cls: "auth-chip-teal"   },
              { label: "Team ready",  icon: "ti-users", cls: "auth-chip-purple" },
              { label: "Secure",      icon: "ti-lock",  cls: "auth-chip-coral"  },
            ].map((c) => (
              <div className={`auth-chip ${c.cls}`} key={c.label}>
                <i className={`ti ${c.icon}`} aria-hidden="true" />
                {c.label}
              </div>
            ))}
          </div>

          <div className="auth-features">
            {["Free to get started", "No credit card needed", "Invite your team instantly"].map((f) => (
              <div className="auth-feature-item" key={f}>
                <i className="ti ti-check" aria-hidden="true" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-left-footer">© 2025 ResolveX</div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right">
        <div className="auth-accent-bar" />
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start managing projects the smart way</p>

        {error && (
          <div className="auth-error">
            <i className="ti ti-alert-circle" aria-hidden="true" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Full name</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
              <i className="ti ti-user" aria-hidden="true" />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Email address</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              <i className="ti ti-mail" aria-hidden="true" />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type={showPw ? "text" : "password"}
                name="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
              <i
                className={`ti ${showPw ? "ti-eye-off" : "ti-eye"}`}
                style={{ cursor: "pointer", pointerEvents: "all" }}
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
              />
            </div>
          </div>

          <button
            className="auth-submit-btn"
            type="submit"
            disabled={loading}
          >
            <i className="ti ti-user-plus" aria-hidden="true" />
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;