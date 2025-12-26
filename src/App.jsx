import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./pages/main";
import Dashboard from "./pages/dashboard";
import PlatformSelection from "./pages/platformSelection/PlatformSelection";
import ConnectionForm from "./pages/connectAgent";
import ConnectionLoading from "./components/ConnectionLoading";
import WorkspaceDashboard from "./pages/workspace";
import AuthScreen from "./pages/auth/AuthScreen";
import EvaluationDashboard from "./pages/evaluation";
import Docs from "./pages/docs/index.jsx";
import extractedConfigJson from "./data/extracted_config.json";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // 🔑 Default view → Evaluation
  const [activeView, setActiveView] = useState("dashboard");

  const [showPlatformSelection, setShowPlatformSelection] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [showConnectionLoading, setShowConnectionLoading] = useState(false);
  const [showWorkspaceDashboard, setShowWorkspaceDashboard] = useState(false);

  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [extractedConfig, setExtractedConfig] = useState(null);
  const [setupResult, setSetupResult] = useState(null);

  const handleAuthSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  /* ---------------- Navigation ---------------- */

  const handleNavigate = (viewId) => {
    setActiveView(viewId);

    // reset connect flow
    setShowPlatformSelection(false);
    setShowConnectionForm(false);
    setShowConnectionLoading(false);
    setShowWorkspaceDashboard(false);

    if (viewId === "connect-agent") {
      setShowPlatformSelection(true);
    }
  };

  /* ---------------- Connect Agent Flow ---------------- */

  const handlePlatformSelect = (platformId) => {
    setSelectedPlatform(platformId);
    setShowPlatformSelection(false);
    setTimeout(() => setShowConnectionForm(true), 300);
  };

  const handleConnect = ({ apiKey, assistantId }) => {
    console.log("🧪 Dummy connect (NO API)");
    console.log("User entered:", { apiKey, assistantId });

    setIsConnecting(true);

    // 1️⃣ Load hardcoded config immediately
    setExtractedConfig(extractedConfigJson);

    // 2️⃣ Move to loading screen
    setShowConnectionForm(false);
    setShowConnectionLoading(true);

    // 3️⃣ Fake backend work (UX only)
    setTimeout(() => {
      // We already have everything hardcoded
      setSetupResult({
        flowData: null, // not needed if using PNG
        mermaid: null, // not needed
      });

      // 4️⃣ Transition to workspace
      setShowConnectionLoading(false);
      setShowWorkspaceDashboard(true);
      setIsConnecting(false);

      console.log("✅ Dummy flow completed");
    }, 2000); // ⏱ adjust timing as needed
  };

  const handleConnectionComplete = (result) => {
    setSetupResult(result);
    setShowConnectionLoading(false);
    setShowWorkspaceDashboard(true);
  };

  /* ---------------- Auth Gate ---------------- */

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  /* ---------------- Main Layout ---------------- */

  return (
    <Routes>
      <Route path="/docs" element={<Docs />} />
      <Route
        path="/"
        element={
          <DashboardLayout
            activeView={activeView}
            onNavigate={handleNavigate}
            hideRightPanel={activeView === "evaluation" || showWorkspaceDashboard}
            onLogout={handleLogout}
          >
            {/* ✅ FIRST SCREEN */}

            {activeView === "dashboard" && (
              <div className="p-8">
                <Dashboard />
              </div>
            )}

            {showPlatformSelection && (
              <div className="p-8">
                <PlatformSelection onSelectPlatform={handlePlatformSelect} />
              </div>
            )}

            {showConnectionForm && (
              <div className="p-8">
                <ConnectionForm
                  platform={selectedPlatform}
                  onConnect={handleConnect}
                  isConnecting={isConnecting}
                />
              </div>
            )}

            {showConnectionLoading && extractedConfig && (
              <div className="p-8">
                <ConnectionLoading
                  extractedConfig={extractedConfig}
                  onComplete={handleConnectionComplete}
                />
              </div>
            )}

            {showWorkspaceDashboard && extractedConfig && setupResult && (
              <div className="p-8">
                <WorkspaceDashboard
                  systemConfig={{
                    agentId: extractedConfig.agent_id,
                    config: extractedConfig.config,
                    systemPrompt: extractedConfig.system_prompt,
                    platform: extractedConfig.platform,
                    tools: extractedConfig.tools,
                    metadata: extractedConfig.metadata,
                    flowData: setupResult.flowData,
                    mermaid: setupResult.mermaid,
                  }}
                />
              </div>
            )}

            {/* Evaluation View */}
            {activeView === "evaluation" && (
              <div className="p-8">
                <EvaluationDashboard />
              </div>
            )}
            
            {/* Fallback for other views */}
            {activeView === "docs" && (
              <div className="p-8">
                <Docs />
              </div>
            )}
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default App;