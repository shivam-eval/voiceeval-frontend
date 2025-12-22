import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeView={activeView}
        onNavigate={onNavigate}
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

        {/* Right Sidebar */}
        {activeView !== "dashboard" && !hideRightPanel && (
          <div className="w-80 bg-dark-bg border-l border-gray-800/50 p-6 overflow-y-auto">
            <DashboardOverview />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
