import { useState, useEffect } from "react";
import DashboardLoader from "./components/DashboardLoader";
import DashboardLayout from "./pages/main/index";
import Dashboard from "./pages/main/DashboardOverview"
import PlatformSelection from "./pages/platformSelection/PlatformSelection";
import ConnectionForm from "./pages/connectAgent/index";
import ConnectionLoading from "./components/ConnectionLoading";
import WorkspaceDashboard from "./pages/workspace";
import WorkspaceDashboard from "./pages/workspace";
import AuthScreen from "./pages/auth/AuthScreen";
import { extractAgent } from "./api";

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
    console.log("Navigating to:", viewId);
    
    // Reset all view states
    setShowPlatformSelection(false);
    setShowConnectionForm(false);
    setShowConnectionLoading(false);
    setShowWorkspaceDashboard(false);
    setShowEvaluationDashboard(false);
    
    // Update the active view
    setActiveView(viewId);

    // Handle specific view transitions
    switch(viewId) {
      case 'connect-agent':
        setShowPlatformSelection(true);
        break;
      case 'dashboard':
        // Dashboard is the default view, no additional setup needed
        break;
      // Add more cases as needed for other views
      default:
        console.log(`No specific setup for view: ${viewId}`);
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
      flowData: null,      // not needed if using PNG
      mermaid: null,       // not needed
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

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulse ${
                  2 + Math.random() * 2
                }s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        <div className="animate-fade-in">
          <DashboardLoader />
        </div>
      </div>
    );
  }

  // Show layout with side panel after initialization
  if (showLayout) {
    return (
      <DashboardLayout
        activeView={activeView}
        onNavigate={handleNavigate}
        hideRightPanel={showEvaluationDashboard}
        onLogout={handleLogout}
      >
        {/* Dashboard - Default view */}
        {activeView === "dashboard" &&
          !showPlatformSelection &&
          !showConnectionForm &&
          !showConnectionLoading &&
          !showWorkspaceDashboard && (
            <div className="p-8">
              <Dashboard />
            </div>
          )}

        {/* Platform Selection - Connect Agent flow */}
        {showPlatformSelection && (
          <div className="p-8">
            <PlatformSelection onSelectPlatform={handlePlatformSelect} />
          </div>
        )}

        {/* Connection Form - Connect Agent flow */}
        {showConnectionForm && (
          <div className="p-8">
            <ConnectionForm
              platform={selectedPlatform}
              onConnect={handleConnect}
              isConnecting={isConnecting}
              onBack={handleBackToPlatforms}
            />
          </div>
        )}

        {/* Connection Loading - Setup flow with API calls */}
        {showConnectionLoading && extractedConfig && (
          <div className="p-8">
            <ConnectionLoading
              extractedConfig={extractedConfig}
              onComplete={handleConnectionComplete}
            />
          </div>
        )}

        {/* Workspace Dashboard - Shown after connection complete */}
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
                // Use setup result directly to avoid race conditions
                flowData: setupResult.flowData,
                mermaid: setupResult.mermaid,
              }}
              onEvaluationDashboardChange={setShowEvaluationDashboard}
            />
          </div>
        )}
      </DashboardLayout>
    );
  }

  return null;
}

export default App;
