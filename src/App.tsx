import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import ProjectList from "./pages/ProjectList";
import DeveloperProfile from "./pages/DeveloperProfile";
import AppliedProjects from "./pages/AppliedProjects";
import ApplyProject from "./pages/ApplyProject";
import ClientCreateProject from "./pages/ClientCreateProject";
import ClientProjects from "./pages/ClientProjects";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:projectId/apply" element={<ApplyProject />} />

        <Route
          path="/developer"
          element={<Navigate to="/developer/applied" replace />}
        />
        <Route path="/developer/profile" element={<DeveloperProfile />} />
        <Route path="/developer/applied" element={<AppliedProjects />} />

        <Route
          path="/client"
          element={<Navigate to="/client/projects" replace />}
        />
        <Route path="/client/create" element={<ClientCreateProject />} />
        <Route path="/client/projects" element={<ClientProjects />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
