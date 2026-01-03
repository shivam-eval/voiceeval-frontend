import { useState } from "react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({
  children,
  activeSection,
  activeTab,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeSection={activeSection}
        activeTab={activeTab}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 overflow-hidden ${isSidebarOpen ? "ml-64" : "ml-20"
          } transition-all duration-300`}
      >
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
