import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardOverview from "./DashboardOverview";
import Sidebar from "./Sidebar";

const DashboardLayout = ({
  children,
  activeView,
  onNavigate,
  hideRightPanel,
  onLogout,
}) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [localActiveView, setLocalActiveView] = useState(activeView);

  // Extract active view from current path
  useEffect(() => {
    const path = location.pathname;
    let viewId = "dashboard";
    
    if (path === "/dashboard") viewId = "dashboard";
    else if (path.startsWith("/connect-agent")) viewId = "connect-agent";
    else if (path === "/test-cases") viewId = "test-cases";
    else if (path === "/simulations") viewId = "simulations";
    else if (path === "/evaluations") viewId = "evaluations";
    else if (path === "/workspace") viewId = "workspace";
    
    setLocalActiveView(viewId);
  }, [location.pathname, activeView]);

  const handleNavigation = (viewId) => {
    setLocalActiveView(viewId);
    onNavigate?.(viewId);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeView={localActiveView}
        onNavigate={handleNavigation}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex overflow-hidden ${
          isSidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300`}
      >
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Right Sidebar - Only show for non-dashboard views and when not hidden */}
        {localActiveView !== "dashboard" && !hideRightPanel && (
          <div className="w-80 bg-dark-bg border-l border-gray-800/50 p-6 overflow-y-auto">
            <DashboardOverview />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
