import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import DashboardLayout from "./pages/main/index";
import HomePage from "./pages/home/HomePage";
import AgentsPage from "./pages/agents/AgentsPage";
import AgentDetailPage from "./pages/agents/AgentDetailPage";
import TestCasesPage from "./pages/testCases/TestCasesPage";
import TestSuiteDetailView from "./pages/testCases/TestSuiteDetailView";
import PersonasPage from "./pages/personas/PersonasPage";
import SimulationsPage from "./pages/simulations/SimulationsPage";
import EvaluationDashboard from "./pages/evaluation";
import AuthScreen from "./pages/auth/AuthScreen";

import { useWorkflow } from "./context/WorkflowContext";

function App() {
  const location = useLocation();
  const { resetWorkflow } = useWorkflow();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  /* ---------------- Auth ---------------- */
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  /* ---------------- Handlers ---------------- */
  const handleLogout = () => {
    resetWorkflow();
    setIsAuthenticated(false);
  };

  // Extract active view from path for sidebar highlighting
  const getActiveView = () => {
    const path = location.pathname;
    if (path === "/" || path === "/home") return "home";
    if (path.startsWith("/agents")) return "agents";
    if (path.startsWith("/test-cases")) return "test-cases";
    if (path.startsWith("/simulations")) return "simulations";
    if (path.startsWith("/evaluations")) return "evaluations";
    return "home";
  };

  const activeView = getActiveView();

  /* ---------------- Routes ---------------- */
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <DashboardLayout
            activeView={activeView}
            onLogout={handleLogout}
          >
            <Routes>
              {/* Home */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />

              {/* Agents */}
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:agentId" element={<AgentDetailPage />} />

              {/* Test Cases */}
              <Route path="/test-cases" element={<TestCasesPage />} />
              <Route path="/test-cases/:suiteId" element={<TestSuiteDetailView />} />

              {/* Personas */}
              <Route path="/personas" element={<PersonasPage />} />

              {/* Simulations */}
              <Route path="/simulations" element={<SimulationsPage />} />
              <Route
                path="/simulations/:simulationId"
                element={
                  <div className="p-8">
                    <div className="text-white">Simulation Detail View - Coming Soon</div>
                  </div>
                }
              />

              {/* Evaluations */}
              <Route
                path="/evaluations/:evaluationId"
                element={<EvaluationDashboard />}
              />

              {/* Legacy route redirects */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/connect-agent" element={<Navigate to="/agents" replace />} />
              <Route path="/testcase" element={<Navigate to="/test-cases" replace />} />
              <Route path="/evaluation" element={<Navigate to="/simulations" replace />} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default App;
