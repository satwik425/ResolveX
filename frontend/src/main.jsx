import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <NotificationProvider>
      <WorkspaceProvider>
        <ProjectProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ProjectProvider>
      </WorkspaceProvider>
    </NotificationProvider>
  </AuthProvider>
);