import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkflow } from "../../context/WorkFlowContext";
import { Home, Zap, FileText, Eye, Phone, LogOut, ChevronRight, X } from "lucide-react";

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeSection,
  activeTab,
  onLogout,
}) => {
  const navigate = useNavigate();
  const { workflow, resetWorkflow } = useWorkflow();
  const [expandedSections, setExpandedSections] = useState(["agents", "test-cases", "observability"]);

  // Define sections with tabs
  const sections = [
    {
      id: "home",
      label: "Home",
      path: "/",
      icon: <Home className="w-5 h-5" />,
      standalone: true,
    },
    {
      id: "agents",
      label: "Agents",
      icon: <Zap className="w-5 h-5" />,
      tabs: [
        { id: "my-agents", label: "My Agents", path: "/agents" },
      ],
    },
    {
      id: "test-cases",
      label: "Simulations",
      path: "/testcase",
      enabled: !!workflow.setupResult,
      icon: <FileText className="w-5 h-5" />,
      tabs: [
        { id: "test-cases", label: "Test Cases", path: "/testing/test-cases" },
        { id: "personas", label: "Personas", path: "/testing/personas" },
        { id: "inbound", label: "Inbound", path: "/inbound/runs" },
        { id: "outbound", label: "Outbound", path: "/simulations/runs" },
        { id: "overview", label: "Evaluations", path: "/evaluations/overview" },
      ],
    },
    {
      id: "observability",
      label: "Observability",
      icon: <Eye className="w-5 h-5" />,
      tabs: [
        { id: "traces", label: "Traces", path: "/observability/traces" },
        { id: "calls", label: "Calls", path: "/observability/calls" },
      ],
    },
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const userEmail = localStorage.getItem("userEmail") || "user@voiceeval.com";
  const userName = localStorage.getItem("userName") || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div
      className={`${isSidebarOpen ? "w-64" : "w-20"
        } bg-dark-panel border-r border-gray-800/50 transition-all duration-300 flex flex-col fixed left-0 top-0 bottom-0 z-10`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-800/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-400/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-teal-400">V</span>
          </div>
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-white">
              Voice<span className="text-teal-400">Eval</span>
            </h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0">
        <div className="px-3 space-y-1">
          {sections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            const isActiveSection = activeSection === section.id;

            // Standalone item (like Home)
            if (section.standalone) {
              return (
                <button
                  key={section.id}
                  onClick={() => handleNavigate(section.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActiveSection
                    ? "bg-teal-400/20 text-teal-400 border border-teal-400/50"
                    : "text-gray-400 hover:text-white hover:bg-dark-input"
                    }`}
                >
                  {section.icon}
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{section.label}</span>
                  )}
                </button>
              );
            }

            // Section with tabs
            return (
              <div key={section.id} className="mb-1">
                {/* Section Header */}
                <button
                  onClick={() => {
                    if (isSidebarOpen) {
                      toggleSection(section.id);
                    } else {
                      // If collapsed, navigate to first tab
                      handleNavigate(section.tabs[0].path);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${isActiveSection
                    ? "bg-teal-400/10 text-teal-400"
                    : "text-gray-400 hover:text-white hover:bg-dark-input"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    {isSidebarOpen && (
                      <span className="text-sm font-semibold uppercase tracking-wide">
                        {section.label}
                      </span>
                    )}
                  </div>
                  {isSidebarOpen && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""
                        }`}
                    />
                  )}
                </button>

                {/* Tabs */}
                {isSidebarOpen && isExpanded && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-800 pl-3">
                    {section.tabs.map((tab) => {
                      const isActiveTab = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleNavigate(tab.path)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActiveTab
                            ? "bg-teal-400/20 text-teal-400 font-medium"
                            : "text-gray-400 hover:text-white hover:bg-dark-input"
                            }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800/50 flex-shrink-0 bg-dark-panel">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center flex-shrink-0">
              <span className="text-teal-400 font-semibold">{userInitial}</span>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;