import { useState, useEffect } from "react";
import DashboardLoader from "./components/DashboardLoader";
import DashboardLayout from "./pages/main/index"
import Dashboard from "./pages/dasbhboard/index"
import PlatformSelection from "./pages/platformSelection/PlatformSelection";
import ConnectionForm from "./pages/connectAgent/index"
import ConnectionLoading from "./components/ConnectionLoading";
import WorkspaceDashboard from "./pages/workspace/index"
import AuthScreen from "./pages/auth/AuthScreen";
import EvaluationDashboard from "./pages/evaluation";
import { extractAgent, flowGenerationMermaid } from "./api";
import { DUMMY_EVALUATION_DATA } from "./pages/evaluation/const";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  
  const handleAuthSuccess = () => setIsAuthenticated(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    setIsAuthenticated(false)
    setShowLayout(false)
    setShowDashboard(true)
  }
  const [showDashboard, setShowDashboard] = useState(true);
  const [showLayout, setShowLayout] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [showPlatformSelection, setShowPlatformSelection] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [showConnectionLoading, setShowConnectionLoading] = useState(false);
  const [showWorkspaceDashboard, setShowWorkspaceDashboard] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showEvaluationDashboard, setShowEvaluationDashboard] = useState(false);
  const [extractedConfig, setExtractedConfig] = useState(null);
  const [setupResult, setSetupResult] = useState(null);

  console.log("App state:", {
    showConnectionLoading,
    showWorkspaceDashboard,
    hasExtractedConfig: !!extractedConfig,
    hasSetupResult: !!setupResult,
  });

  useEffect(() => {
    // Wrap the existing timer in this if-condition
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        setShowDashboard(false)
        setTimeout(() => {
          setShowLayout(true)
        }, 300)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated]);

  const handleNavigate = (viewId) => {
    console.log("Navigating to:", viewId);
    setActiveView(viewId);

    if (viewId === "connect-agent") {
      if (!showWorkspaceDashboard) {
        setShowPlatformSelection(true);
        setShowConnectionForm(false);
        setShowConnectionLoading(false);
      }
    } else if (viewId === "dashboard") {
      setShowPlatformSelection(false);
      setShowConnectionForm(false);
      setShowConnectionLoading(false);
      setShowWorkspaceDashboard(false);
    }
  };

  const handlePlatformSelect = (platformId) => {
    console.log("Platform selected:", platformId);
    setSelectedPlatform(platformId);
    setShowPlatformSelection(false);
    setActiveView("connect-agent");
    setTimeout(() => setShowConnectionForm(true), 300);
  };

  const handleBackToPlatforms = () => {
    console.log("Back to platforms");
    setShowConnectionForm(false);
    setActiveView("connect-agent");
    setTimeout(() => {
      setShowPlatformSelection(true);
      setSelectedPlatform(null);
    }, 300);
  };

  const handleConnect = async ({ apiKey, assistantId }) => {
    console.log("🔄 Starting connection...");
    setIsConnecting(true);
    setActiveView("connect-agent");

    try {
      const payload = {
        platform: selectedPlatform,
        api_key: apiKey,
        agent_id: assistantId,
      };

      console.log("📤 Sending extract request:", payload);

      const res = await extractAgent(payload);

      console.log("📥 Extraction result:", res.data);

      // Save extracted config
      setExtractedConfig(res.data);
      console.log("✅ Config extracted successfully");

      // UI transitions
      setIsConnecting(false);
      setShowConnectionForm(false);

      setTimeout(() => {
        console.log("➡️ Showing connection loading screen");
        setShowConnectionLoading(true);
      }, 300);
    } catch (err) {
      console.error("❌ Connection failed:", err);
      console.error("Error details:", {
        message: err.message,
        response: err?.response?.data,
        stack: err.stack,
      });

      alert(
        "Failed to connect: " + (err.response?.data?.detail || err.message)
      );
      setIsConnecting(false);
    }
  };

  const handleConnectionComplete = (result) => {
    console.log("🎉 Connection complete with result:", result);

    // Store the setup result (flowData + mermaid)
    setSetupResult(result);

    // Also merge into extractedConfig for persistence
    setExtractedConfig((prev) => ({
      ...prev,
      flowData: result?.flowData,
      mermaid: result?.mermaid,
    }));

    console.log("➡️ Transitioning to workspace dashboard");

    // Hide loader, show workspace
    setShowConnectionLoading(false);
    setShowWorkspaceDashboard(true);
    setActiveView("connect-agent");
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />
  }

if (showLayout) {
  return (
    <DashboardLayout
      activeView="dashboard"
      onNavigate={handleNavigate}
      hideRightPanel={false}
      onLogout={handleLogout}
    >
      <div className="p-8">
        <EvaluationDashboard
          evaluationData={DUMMY_EVALUATION_DATA}   // mock for now
          onBack={() => {}}
        />
      </div>
    </DashboardLayout>
  );
}


  return null;
}

export default App;
