import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import issueApi from "../../api/issueApi";
import "./CSSFile/Navbar.css";




const Navbar = () => {
  const { user, logout }                               = useAuth();
  const { notifications, unreadCount, markAllAsRead }  = useNotification();
  const navigate                                       = useNavigate();

  const [searchQuery,   setSearchQuery]   = useState("");
  const [allIssues,     setAllIssues]     = useState([]);   // cached full list
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch,    setShowSearch]    = useState(false);
  const [searching,     setSearching]     = useState(false);
  const [showNotif,     setShowNotif]     = useState(false);
  const [showProfile,   setShowProfile]   = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const searchRef  = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))  setShowSearch(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch all accessible issues once, lazily, the first time the user focuses search
  const ensureIssuesLoaded = async () => {
    if (allIssues.length > 0) return allIssues;
    try {
      const res = await issueApi.getAllIssues();
      const issues = res.data.issues || [];
      setAllIssues(issues);
      return issues;
    } catch {
      return [];
    }
  };

  const handleSearch = (val) => {
    setSearchQuery(val);

    if (!val.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    setSearching(true);
    setShowSearch(true);

    // Debounce so we don't re-filter on every keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const issues = await ensureIssuesLoaded();
      const q = val.toLowerCase();
      const filtered = issues.filter(
        (issue) =>
          issue.title?.toLowerCase().includes(q) ||
          issue.description?.toLowerCase().includes(q)
      );
      setSearchResults(filtered.slice(0, 8)); // cap dropdown size
      setSearching(false);
    }, 250);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === "todo")        return "issue-badge issue-badge-open";
    if (s === "in-progress") return "issue-badge issue-badge-progress";
    if (s === "in-review")   return "issue-badge issue-badge-progress";
    if (s === "done")        return "issue-badge issue-badge-done";
    return "issue-badge issue-badge-open";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo"><i className="ti ti-bolt" aria-hidden="true" /></div>
        <span className="navbar-brand-name">Resolve<span>X</span></span>
      </Link>

      {user && (
        <div className="navbar-search" ref={searchRef}>
          <i className="ti ti-search navbar-search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearch(true)}
            autoComplete="off"
          />

          {showSearch && (
            <div className="search-dropdown">
              {searching && (
                <div className="search-dropdown-item" style={{ cursor: "default" }}>
                  Searching...
                </div>
              )}

              {!searching && searchResults.length === 0 && (
                <div className="search-dropdown-item" style={{ cursor: "default" }}>
                  <i className="ti ti-mood-empty" aria-hidden="true" />
                  No issues found
                </div>
              )}

              {!searching && searchResults.map((issue) => (
                <div
                  key={issue._id}
                  className="search-dropdown-item"
                  onClick={() => {
                    navigate(`/issues/${issue._id}`);
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                >
                  <i className="ti ti-circle-dot" aria-hidden="true" />
                  {issue.title}
                  <span className={getStatusClass(issue.status)}>{issue.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="navbar-spacer" />

      {!user ? (
        <div className="navbar-actions">
          <Link to="/login"><button className="nav-btn">Login</button></Link>
          <Link to="/register"><button className="nav-btn nav-btn-primary">Register</button></Link>
        </div>
      ) : (
        <div className="navbar-actions">
          <button className="nav-btn" onClick={() => navigate("/workspaces")}>
            <i className="ti ti-layout-grid" aria-hidden="true" /> My workspaces
          </button>

          <div className="navbar-divider" />

          <div ref={notifRef} style={{ position: "relative" }}>
            <div className="icon-btn" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }} role="button" aria-label="Notifications">
              <i className="ti ti-bell" aria-hidden="true" />
              {unreadCount > 0 && <span className="notif-dot" />}
            </div>
            {showNotif && (
              <div className="notif-panel">
                <div className="notif-panel-header">
                  <span>Notifications</span>
                  <button className="notif-mark-read" onClick={markAllAsRead}>Mark all read</button>
                </div>
                {notifications.length === 0 && <p className="notif-empty">No notifications</p>}
                {notifications.map((n) => (
                  <div key={n.id} className={`notif-item ${!n.read ? "notif-item-unread" : ""}`}>
                    <p className="notif-item-title">{n.message}</p>
                    <p className="notif-item-time">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div ref={profileRef} style={{ position: "relative" }}>
            <div className="navbar-avatar" onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }} role="button" aria-label="Profile menu">
              {getInitials(user.name)}
            </div>
            {showProfile && (
              <div className="profile-panel">
                <div className="profile-panel-top">
                  <p className="profile-panel-name">{user.name}</p>
                  <p className="profile-panel-email">{user.email}</p>
                </div>
                <div className="profile-panel-item" onClick={() => { navigate("/profile"); setShowProfile(false); }}>
                  <i className="ti ti-user" aria-hidden="true" /> Profile
                </div>
                <div className="profile-panel-item" onClick={() => { navigate("/settings"); setShowProfile(false); }}>
                  <i className="ti ti-settings" aria-hidden="true" /> Settings
                </div>
                <div className="profile-panel-item profile-panel-item-danger" onClick={handleLogout}>
                  <i className="ti ti-logout" aria-hidden="true" /> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;