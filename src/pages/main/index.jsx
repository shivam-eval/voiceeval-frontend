import { useState, useEffect } from "react";
import DashboardOverview from "./DashboardOverview";
import Sidebar from "./Sidebar";

const DashboardLayout = ({
  children,
  activeView,
  onNavigate,
  hideRightPanel,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [localActiveView, setLocalActiveView] = useState(activeView);

  // Update local state when prop changes
  useEffect(() => {
    setLocalActiveView(activeView);
  }, [activeView]);

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
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
