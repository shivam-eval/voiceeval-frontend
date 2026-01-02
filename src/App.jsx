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
import SimulationsListPage from "./pages/simulations/SimulationsListPage";
import SimulationDetailPage from "./pages/simulations/SimulationDetailPage";
import SimulationEvaluationPage from "./pages/simulations/SimulationEvaluationPage";
import SessionReportPage from "./pages/simulations/SessionReportPage";
import EvaluationsPage from './pages/simulations/EvaluationsPage';
import EvaluationDashboard from "./pages/evaluation";
import EvaluationReportPage from "./pages/evaluation/EvaluationReportPage";
import AuthScreen from "./pages/auth/AuthScreen";
import CallsPage from "./pages/observability/CallsPage";
import Dashboard from "./pages/dasbhboard";
import WorkspaceLoader from "./pages/workspace/WorkspaceLoader";

import { useWorkflow } from "./context/WorkFlowContext";

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
    if (path.startsWith("/personas")) return "personas";
    if (path.startsWith("/simulation")) return "simulations";
    if (path.startsWith("/simulations")) return "simulations";
    if (path.startsWith("/evaluations")) return "evaluations";
    if (path === "/calls") return "calls";
    if (path === "/observability-overview") return "overview";
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

              {/* Workspace */}
              <Route path="/workspace" element={<WorkspaceLoader />} />

              {/* Test Cases */}
              <Route path="/test-cases" element={<TestCasesPage />} />
              <Route path="/test-cases/:suiteId" element={<TestSuiteDetailView />} />

              {/* Personas */}
              <Route path="/personas" element={<PersonasPage />} />

              {/* === SIMULATIONS === */}
              {/* Legacy evaluator page */}
              <Route path="/simulations" element={<SimulationsPage />} />

              {/* New simulation runs pages */}
              <Route path="/simulation/runs" element={<SimulationsListPage />} />
              <Route path="/simulation/runs/:simulationId" element={<SimulationDetailPage />} />

              {/* Simulation results - NEW evaluation results pages */}
              <Route path="/simulation/results/:simulationId" element={<SimulationEvaluationPage />} />
              <Route path="/simulation/results/:simulationId/session/:sessionId" element={<SessionReportPage />} />

              {/* Simulation evaluator (existing scenarios page) */}
              <Route path="/simulation/evaluator" element={<SimulationsPage />} />

              {/* Simulation results (evaluation dashboard) - Legacy */}
              <Route path="/simulation/results" element={<EvaluationDashboard />} />

              {/* === EVALUATIONS === */}
              <Route path="/evaluations" element={<EvaluationsPage />} />
              <Route
                path="/evaluations/:evaluationId"
                element={<EvaluationReportPage />}
              />

              {/* Observability */}
              <Route
                path="/calls"
                element={<CallsPage />}
              />
              <Route
                path="/observability-overview"
                element={
                  <div className="p-8">
                    <Dashboard />
                  </div>
                }
              />

              {/* Legacy route redirects */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/connect-agent" element={<Navigate to="/agents" replace />} />
              <Route path="/testcase" element={<Navigate to="/test-cases" replace />} />
              <Route path="/evaluation" element={<Navigate to="/simulation/runs" replace />} />


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
