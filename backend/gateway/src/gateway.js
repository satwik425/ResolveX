const express = require("express");
const cors = require("cors");
const axios = require("axios");                    // ✅ add this
const cookieParser = require("cookie-parser");     // ✅ add this
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Move declarations to top — before they're used
const USER_SERVICE_URL      = process.env.USER_SERVICE_URL      || "http://127.0.0.1:3001";
const WORKSPACE_SERVICE_URL = process.env.WORKSPACE_SERVICE_URL || "http://127.0.0.1:3002";
const PROJECT_SERVICE_URL   = process.env.PROJECT_SERVICE_URL   || "http://127.0.0.1:3003";
const SPRINT_SERVICE_URL    = process.env.SPRINT_SERVICE_URL    || "http://127.0.0.1:3004";
const ISSUE_SERVICE_URL     = process.env.ISSUE_SERVICE_URL     || "http://127.0.0.1:3005";

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser()); // ✅ parse cookies



// Health Check
app.get("/health", async (req, res) => {
  const services = {
    user:      `${USER_SERVICE_URL}/health`,
    workspace: `${WORKSPACE_SERVICE_URL}/health`,
    project:   `${PROJECT_SERVICE_URL}/health`,
    sprint:    `${SPRINT_SERVICE_URL}/health`,
    issue:     `${ISSUE_SERVICE_URL}/health`,
  };

  const results = {};
  for (const [name, url] of Object.entries(services)) {
    try {
      await axios.get(url, { timeout: 3000 }); // ✅ axios imported now
      results[name] = "UP";
    } catch {
      results[name] = "DOWN";
    }
  }

  const allUp = Object.values(results).every(s => s === "UP");
  return res.status(allUp ? 200 : 503).json({
    status: allUp ? "OK" : "DEGRADED",
    service: "API Gateway",
    dependencies: results
  });
});

// ✅ Cookie → Bearer conversion — runs before every proxied request
// This is the ONLY place cookie-parser is needed in your entire backend
app.use((req, res, next) => {
  if (!req.headers.authorization && req.cookies?.token) {
    req.headers["authorization"] = `Bearer ${req.cookies.token}`;
  }
  next();
});




app.use("/api/users",      createProxyMiddleware({ target: `${USER_SERVICE_URL}/users`,           changeOrigin: true }));
app.use("/api/workspaces", createProxyMiddleware({ target: `${WORKSPACE_SERVICE_URL}/workspaces`, changeOrigin: true }));
app.use("/api/projects", createProxyMiddleware({ target: `${PROJECT_SERVICE_URL}/projects`, changeOrigin: true }));
app.use("/api/sprints",    createProxyMiddleware({ target: `${SPRINT_SERVICE_URL}/sprints`,        changeOrigin: true }));
app.use("/api/issues",     createProxyMiddleware({ target: `${ISSUE_SERVICE_URL}/issues`,          changeOrigin: true }));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
