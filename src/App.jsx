import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useWorkflow } from "./context/WorkflowContext";

import DashboardLayout from "./pages/main";
import Dashboard from "./pages/dashboard";
import PlatformSelection from "./pages/platformSelection/PlatformSelection";
import ConnectionForm from "./pages/connectAgent";
import ConnectionLoading from "./components/ConnectionLoading";
import WorkspaceDashboard from "./pages/workspace";
import TestCasesPage from "./pages/testCases/TestCasesPage";
import SimulationPage from "./pages/simulations/SimulationPage";
import EvaluationPage from "./pages/evaluation/EvaluationPage";
import AuthScreen from "./pages/auth/AuthScreen";
import Docs from "./pages/docs/index.jsx";
import extractedConfigJson from "./data/extracted_config.json";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workflow, setAgent, setTestSuite, setSimulation, resetWorkflow } = useWorkflow();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  /* ---------------- Auth Flow ---------------- */
  const handleAuthSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => {
    resetWorkflow();
    setIsAuthenticated(false);
  };

  /* ---------------- Navigation Handlers ---------------- */
  const handlePlatformSelect = (platformId) => {
    setSelectedPlatform(platformId);
    navigate("/connect-agent/form");
  };

  const handleConnect = (credentials) => {
    setIsConnecting(true);
    // Simulation of connection process
    setTimeout(() => {
      const agentData = {
        platform: selectedPlatform,
        agentId: credentials.agentId,
        config: extractedConfigJson.config,
        systemPrompt: extractedConfigJson.system_prompt,
        tools: extractedConfigJson.tools,
        metadata: extractedConfigJson.metadata,
      };
      setAgent(agentData);
      setIsConnecting(false);
      navigate("/test-cases");
    }, 2000);
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const activeView = location.pathname.split("/")[1] || "dashboard";

  return (
    <Routes>
      <Route path="/docs" element={<Docs />} />
      <Route
        path="/*"
        element={
          <DashboardLayout
            activeView={activeView}
            onNavigate={(viewId) => navigate(`/${viewId}`)}
            hideRightPanel={activeView === "evaluations"}
            onLogout={handleLogout}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<div className="p-8"><Dashboard /></div>} />
              
              {/* Connect Agent Flow */}
              <Route path="/connect-agent" element={
                <div className="p-8">
                  <PlatformSelection onSelectPlatform={handlePlatformSelect} />
                </div>
              } />
              <Route path="/connect-agent/form" element={
                <div className="p-8">
                  <ConnectionForm
                    platform={selectedPlatform}
                    onConnect={handleConnect}
                    isConnecting={isConnecting}
                  />
                </div>
              } />
              <Route path="/connect-agent/loading" element={
                <div className="p-8">
                  <ConnectionLoading
                    extractedConfig={extractedConfigJson}
                    onComplete={() => {}}
                  />
                </div>
              } />

              {/* Testing Flow */}
              <Route path="/test-cases" element={
                workflow.agent.connected ? (
                  <TestCasesPage />
                ) : <Navigate to="/connect-agent" replace />
              } />

              {/* Simulation Flow */}
              <Route path="/simulations" element={
                workflow.testSuite.generated ? (
                  <SimulationPage />
                ) : <Navigate to="/test-cases" replace />
              } />

              {/* Evaluation Flow */}
              <Route path="/evaluations" element={
                workflow.simulation.run ? (
                  <EvaluationPage />
                ) : <Navigate to="/simulations" replace />
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default App;
