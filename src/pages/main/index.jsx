import { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import TopBar from "../../components/TopBar";

// Create a context for TopBar state
import React from "react";
export const TopBarContext = React.createContext();

const DashboardLayout = ({
  children,
  activeSection,
  activeTab,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [topBarState, setTopBarState] = useState({ showBackButton: false, onBack: null });

  // Memoize the context value to prevent infinite loops
  const contextValue = useMemo(() => ({ topBarState, setTopBarState }), [topBarState]);

  return (
    <TopBarContext.Provider value={contextValue}>
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
          <div className="h-full overflow-y-auto relative pt-10">
            <TopBar showBackButton={topBarState.showBackButton} onBack={topBarState.onBack} />
            {children}
          </div>
        </div>
      </div>
    </TopBarContext.Provider>
  );
};

export default DashboardLayout;
