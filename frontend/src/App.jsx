import { BrowserRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./components/common/PrivateRoute";

// Auth pages
import LoginPage    from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Workspace pages
import WorkspacePage       from "./pages/workspace/WorkspacePage";
import WorkspaceDetailPage from "./pages/workspace/WorkspaceDetailPage";

// Project pages
import ProjectPage       from "./pages/project/ProjectPage";
import ProjectDetailPage from "./pages/project/ProjectDetailPage";

// Sprint pages
import SprintPage from "./pages/sprint/SprintPage";

// Issue pages
import IssuePage from "./pages/issue/IssuePage";

// Profile page
import ProfilePage from "./pages/profile/ProfilePage";

import JoinWorkspacePage from "./pages/workspace/JoinWorkspacePage";



function App() {
  return (
    
      <Routes>

        {/* ── Public routes ── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Private routes ── */}
        <Route path="/workspaces" element={
         <WorkspacePage />
        } />
        <Route path="/workspaces/:id" element={
          <WorkspaceDetailPage />
        } />

        <Route path="/projects" element={
          <PrivateRoute><ProjectPage /></PrivateRoute>
        } />
        <Route path="/projects/:id" element={
          <PrivateRoute><ProjectDetailPage /></PrivateRoute>
        } />

        <Route path="/sprints/:id" element={
          <PrivateRoute><SprintPage /></PrivateRoute>
        } />

        <Route path="/issues/:id" element={
          <PrivateRoute><IssuePage /></PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />

        <Route path="/join/:inviteCode" element={
        <PrivateRoute><JoinWorkspacePage /></PrivateRoute>
        } />


        {/* ── Default redirect ── */}
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<LoginPage />} />

      </Routes>
    
  );
}

export default App;
