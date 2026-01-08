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
import FlowsPage from "./pages/agents/FlowsPage";
import AgentConfigurationPage from "./pages/agents/AgentConfigurationPage";
import TestCasesPage from "./pages/testCases/TestCasesPage";
import TestSuiteDetailView from "./pages/testCases/TestSuiteDetailView";
import PersonasPage from "./pages/personas/PersonasPage";
import ScenariosPage from "./pages/testing/ScenariosPage";
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
import LogsPage from "./pages/observability/LogsPage";
import Dashboard from "./pages/dasbhboard";
import WorkspaceLoader from "./pages/workspace/WorkspaceLoader";

import { useWorkflow } from "./context/WorkFlowContext";

function App() {
  const location = useLocation();

  const {
    workflow,
    setAgent,
    setSetupResult,
    setTestSuite,
    setSimulationResult,
    resetWorkflow,
  } = useWorkflow();

  // Check if user is authenticated by looking for auth token in localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("authToken");
    return !!token; // Returns true if token exists, false otherwise
  });
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  /* ---------------- Auth ---------------- */
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  /* ---------------- Handlers ---------------- */
  const handleLogout = () => {
    resetWorkflow();
    localStorage.removeItem("authToken"); // Clear auth token on logout
    setIsAuthenticated(false);
  };

  // Extract active section and tab from path for sidebar highlighting
  const getActiveView = () => {
    const path = location.pathname;

    // Home
    if (path === "/" || path === "/home") {
      return { section: "home", tab: null };
    }

    // Agents section
    if (path.startsWith("/agents")) {
      if (path.includes("/flows")) return { section: "agents", tab: "flows" };
      if (path.includes("/configuration")) return { section: "agents", tab: "configuration" };
      return { section: "agents", tab: "my-agents" };
    }

    // Testing section
    if (path.startsWith("/testing")) {
      if (path.includes("/personas")) return { section: "testing", tab: "personas" };
      if (path.includes("/scenarios")) return { section: "testing", tab: "scenarios" };
      return { section: "testing", tab: "test-suites" };
    }
    // Legacy routes
    if (path.startsWith("/test-cases")) return { section: "testing", tab: "test-suites" };
    if (path.startsWith("/personas")) return { section: "testing", tab: "personas" };

    // Simulations section
    if (path.startsWith("/simulations") || path.startsWith("/simulation")) {
      if (path.includes("/runs")) return { section: "simulations", tab: "runs" };
      return { section: "simulations", tab: "run" };
    }

    // Evaluations section
    if (path.startsWith("/evaluations")) {
      return { section: "evaluations", tab: "overview" };
    }

    // Observability section
    if (path.startsWith("/observability") || path === "/calls") {
      if (path.includes("/analytics") || path.includes("/overview")) {
        return { section: "observability", tab: "analytics" };
      }
      if (path.includes("/logs")) return { section: "observability", tab: "logs" };
      return { section: "observability", tab: "calls" };
    }

    return { section: "home", tab: null };
  };

  const { section: activeSection, tab: activeTab } = getActiveView();

  /* ---------------- Routes ---------------- */
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <DashboardLayout
            activeSection={activeSection}
            activeTab={activeTab}
            onLogout={handleLogout}
          >
            <Routes>
              {/* Home */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />

              {/* === AGENTS SECTION === */}
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:agentId" element={<AgentDetailPage />} />
              <Route path="/agents/flows" element={<FlowsPage />} />
              <Route path="/agents/configuration" element={<AgentConfigurationPage />} />

              {/* === TESTING SECTION === */}
              {/* New routes */}
              <Route path="/testing/suites" element={<TestCasesPage />} />
              <Route path="/testing/suites/:suiteId" element={<TestSuiteDetailView />} />
              <Route path="/testing/personas" element={<PersonasPage />} />

              {/* Legacy routes - redirect to new structure */}
              <Route path="/test-cases" element={<TestCasesPage />} />
              <Route path="/test-cases/:suiteId" element={<TestSuiteDetailView />} />
              <Route path="/personas" element={<PersonasPage />} />

              {/* Workspace */}
              <Route path="/workspace" element={<WorkspaceLoader />} />

              {/* === SIMULATIONS SECTION === */}
              {/* New routes */}
              <Route path="/simulations/run" element={<SimulationsPage />} />
              <Route path="/simulations/runs" element={<SimulationsListPage />} />
              <Route path="/simulations/runs/:simulationId" element={<SimulationDetailPage />} />

              {/* Legacy routes */}
              <Route path="/simulations" element={<SimulationsPage />} />
              <Route path="/simulation/runs" element={<SimulationsListPage />} />
              <Route path="/simulation/runs/:simulationId" element={<SimulationDetailPage />} />
              <Route path="/simulation/results/:simulationId" element={<SimulationEvaluationPage />} />
              <Route path="/simulation/results/:simulationId/session/:sessionId" element={<SessionReportPage />} />
              <Route path="/simulation/evaluator" element={<SimulationsPage />} />

              {/* === EVALUATIONS SECTION === */}
              {/* New specific routes */}
              <Route path="/evaluations/overview" element={<EvaluationsPage />} />
              <Route path="/evaluations/metrics/:simulationId" element={<EvaluationDashboard />} />
              <Route path="/evaluations/report/:evaluationId" element={<EvaluationReportPage />} />
              <Route path="/evaluations/session" element={<EvaluationReportPage />} />
              <Route path="/evaluations/results/:simulationId" element={<EvaluationDashboard />} />

              {/* Catch-all/Legacy routes - placed after specific ones */}
              <Route path="/evaluations" element={<EvaluationsPage />} />
              <Route path="/evaluations/:id" element={<EvaluationDashboard />} />
              <Route path="/evaluations/report-legacy/:evaluationId" element={<EvaluationReportPage />} />

              {/* === OBSERVABILITY SECTION === */}
              {/* New routes */}
              <Route path="/observability/calls" element={<CallsPage />} />
              <Route path="/observability/logs" element={<LogsPage />} />

              {/* Legacy routes */}
              <Route path="/calls" element={<CallsPage />} />
              <Route path="/observability-overview" element={<div className="p-8"><Dashboard /></div>} />

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
