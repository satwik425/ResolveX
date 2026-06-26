import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

const LoginPage = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(form);
      navigate("/workspaces");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
          <h1 className="auth-left-title">Track issues.<br />Ship faster.</h1>
          <p className="auth-left-sub">
            A modern project management tool built for engineering teams who move fast.
          </p>
          <div className="auth-features">
            {["Real-time sprint boards", "Smart issue assignment", "Workspace collaboration"].map((f) => (
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
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to continue to your workspace</p>

        {error && (
          <div className="auth-error">
            <i className="ti ti-alert-circle" aria-hidden="true" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
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
            <i className="ti ti-arrow-right" aria-hidden="true" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line" />
        </div>

        <button className="auth-oauth-btn">
          <i className="ti ti-brand-google" aria-hidden="true" />
          Continue with Google
        </button>

        <p className="auth-switch">
          No account? <Link to="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;