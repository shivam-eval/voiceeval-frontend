import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import DashboardLayout from "./pages/main/index";
import Dashboard from "./pages/dasbhboard/index";
import PlatformSelection from "./pages/platformSelection/PlatformSelection";
import ConnectionForm from "./pages/connectAgent";
import ConnectionLoading from "./components/ConnectionLoading";
import WorkspaceDashboard from "./pages/workspace";
import AuthScreen from "./pages/auth/AuthScreen";
import TestCasesScreen from "./pages/testCases/TestCasesScreen";
import TestCasesGenerationLoading from "./components/TestCasesGenerationLoading";
import TestExecutionLoading from "./components/TestExecutionLoading";

import { extractAgent } from "./api";
import { useWorkflow } from "./context/WorkflowContext";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    workflow,
    setAgent,
    setSetupResult,
    setTestSuite,
    setSimulationResult,
    resetWorkflow,
  } = useWorkflow();

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  /* ---------------- Auth ---------------- */
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  /* ---------------- Handlers ---------------- */

  const handleLogout = () => {
    resetWorkflow();
    setIsAuthenticated(false);
  };

  const handlePlatformSelect = (platformId) => {
    setSelectedPlatform(platformId);
    navigate("/connect-agent/form");
  };

  const handleConnect = async ({ apiKey, assistantId }) => {
    setIsConnecting(true);

    try {
      const payload = {
        platform: selectedPlatform,
        api_key: apiKey,
        agent_id: assistantId,
      };

      const res = await extractAgent(payload);

      setAgent(res.data);
      navigate("/connect-agent/loading");
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectionComplete = (result) => {
    setSetupResult(result);
    navigate("/workspace");
  };

  /* ---------------- Test Execution Handler ---------------- */
  const handleRunTests = async (testSuitePath) => {
    console.log('🚀 Starting test execution');
    console.log('📁 Test suite path:', testSuitePath);
    console.log('🆔 Test suite ID:', workflow.testSuite.testSuiteId);
    console.log('🌍 Region:', workflow.region);
    
    try {
      // Prepare the payload according to API spec
      const payload = {
        test_suite_path: testSuitePath,
        test_suite_id: workflow.testSuite.testSuiteId,
        phone_number: "+917982693803", // Add if available
      };

      console.log('📤 Sending simulation request:', payload);

      // Call the API to start simulation
      const response = await fetch('http://localhost:8001/api/v1/simulation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Simulation start failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Simulation started:', data);

      // Store simulation ID in context
      setSimulationResult({
        simulationId: data.simulation_id,
        started: true,
      });

      // Navigate to execution loading screen
      navigate("/testcase/running");
      
    } catch (error) {
      console.error('❌ Failed to start simulation:', error);
      alert(`Failed to start test execution: ${error.message}`);
    }
  };

  const activeView = location.pathname.split("/")[1] || "dashboard";

  /* ---------------- Routes ---------------- */

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <DashboardLayout
            activeView={activeView}
            onNavigate={(v) => navigate(`/${v}`)}
            onLogout={handleLogout}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />

              <Route
                path="/dashboard"
                element={
                  <div className="p-8">
                    <Dashboard />
                  </div>
                }
              />

              {/* CONNECT AGENT */}
              <Route
                path="/connect-agent"
                element={
                  <div className="p-8">
                    <PlatformSelection onSelectPlatform={handlePlatformSelect} />
                  </div>
                }
              />

              <Route
                path="/connect-agent/form"
                element={
                  selectedPlatform ? (
                    <div className="p-8">
                      <ConnectionForm
                        platform={selectedPlatform}
                        onConnect={handleConnect}
                        isConnecting={isConnecting}
                      />
                    </div>
                  ) : (
                    <Navigate to="/connect-agent" />
                  )
                }
              />

              <Route
                path="/connect-agent/loading"
                element={
                  workflow.agent ? (
                    <div className="p-8">
                      <ConnectionLoading
                        extractedConfig={workflow.agent}
                        onComplete={handleConnectionComplete}
                      />
                    </div>
                  ) : (
                    <Navigate to="/connect-agent" />
                  )
                }
              />

              {/* WORKSPACE */}
              <Route
                path="/workspace"
                element={
                  workflow.setupResult ? (
                    <div className="p-8">
                      <WorkspaceDashboard
                        systemConfig={{
                          ...workflow.agent,
                          ...workflow.setupResult,
                        }}
                      />
                    </div>
                  ) : (
                    <Navigate to="/dashboard" />
                  )
                }
              />

              {/* TEST CASE GENERATION */}
              <Route
                path="/testcase/generating"
                element={
                  workflow.flow.flowData ? (
                    <TestCasesGenerationLoading
                      flowData={workflow.flow.flowData}
                      region={workflow.region}
                      onComplete={(data) => {
                        console.log('✅ Generation complete:', data);
                        console.log('📄 File name:', data.file_name);
                        console.log('🆔 Test suite ID:', data.test_suite_id);
                        
                        // Store BOTH test_suite_id and file_name
                        setTestSuite({
                          generated: true,
                          config: data.test_suite || data,
                          testSuiteId: data.test_suite_id,  // Store the ID
                          testSuitePath: data.file_name,     // Store the path
                        });
                        
                        navigate("/testcase");
                      }}
                      onError={(error) => {
                        console.error('❌ Generation failed:', error);
                        alert(`Failed to generate test cases: ${error}`);
                        navigate("/workspace");
                      }}
                    />
                  ) : (
                    <Navigate to="/workspace" />
                  )
                }
              />

              {/* TEST CASE REVIEW */}
              <Route
                path="/testcase"
                element={
                  workflow.testSuite?.generated ? (
                    <TestCasesScreen
                      testSuite={workflow.testSuite.config}
                      testSuitePath={workflow.testSuite.testSuitePath}
                      testSuiteId={workflow.testSuite.testSuiteId}
                      onRunTests={handleRunTests}
                      onBack={() => navigate("/workspace")}
                    />
                  ) : (
                    <Navigate to="/workspace" />
                  )
                }
              />

              {/* TEST EXECUTION (Running) */}
              <Route
                path="/testcase/running"
                element={
                  workflow.simulationResult?.started ? (
                    <TestExecutionLoading
                      simulationId={workflow.simulationResult.simulationId}
                      onComplete={(evaluationResult) => {
                        console.log('✅ Execution complete, evaluation result:', evaluationResult);
                        
                        // Store evaluation result in context
                        setSimulationResult({
                          ...workflow.simulationResult,
                          completed: true,
                          evaluationResult,
                        });
                        
                        // Navigate to results screen
                        navigate("/testcase/results");
                      }}
                      onError={(error) => {
                        console.error('❌ Execution failed:', error);
                        alert(`Test execution failed: ${error.message || error}`);
                        navigate("/testcase");
                      }}
                    />
                  ) : (
                    <Navigate to="/testcase" />
                  )
                }
              />

              {/* TEST RESULTS */}
              <Route
                path="/testcase/results"
                element={
                  workflow.simulationResult?.completed ? (
                    <div className="p-8">
                      <div className="w-full max-w-screen-2xl mx-auto">
                        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50">
                          <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-400/20 mb-6">
                              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-4">
                              Test Results
                            </h1>
                            <p className="text-gray-400 mb-2">
                              Simulation ID: {workflow.simulationResult.simulationId}
                            </p>
                            <p className="text-gray-500 text-sm">
                              Test Suite: {workflow.testSuite.testSuiteId}
                            </p>
                          </div>

                          {/* Results Display */}
                          <div className="bg-gray-800 rounded-xl p-6 mb-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Evaluation Results</h3>
                            <pre className="text-gray-300 text-sm overflow-auto max-h-96 bg-gray-900 p-4 rounded">
                              {JSON.stringify(workflow.simulationResult.evaluationResult, null, 2)}
                            </pre>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-4">
                            <button
                              onClick={() => navigate("/testcase")}
                              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                            >
                              Back to Test Cases
                            </button>
                            <button
                              onClick={() => navigate("/workspace")}
                              className="flex-1 px-6 py-3 bg-teal-400 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors"
                            >
                              Back to Workspace
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Navigate to="/testcase" />
                  )
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default App;