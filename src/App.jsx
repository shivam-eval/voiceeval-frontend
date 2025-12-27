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
import EvaluationDashboard from "./pages/evaluation";

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
      const payload = {
        test_suite_id: workflow.testSuite.testSuiteId,
        phone_number: "+917982693803",
      };

      console.log('📤 Sending simulation request:', payload);

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

      setSimulationResult({
        simulationId: data.simulation_id,
        started: true,
      });

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

              {/* EVALUATION DASHBOARD */}
              <Route
                path="/evaluation"
                element={
                  workflow.simulationResult?.completed ? (
                    <EvaluationDashboard
                      evaluationData={workflow.simulationResult.evaluationResult}
                      simulationData={workflow.simulationResult.simulationData}
                      onBack={() => navigate("/testcase/results")}
                    />
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
                        
                        setTestSuite({
                          generated: true,
                          config: data.testSuite,
                          testSuiteId: data.testSuiteId,
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
                      onComplete={(fullResponse) => {
                        console.log('✅ Execution complete, full response:', fullResponse);
                        
                        // Extract the evaluation data properly
                        const evaluationResult = fullResponse.simulation_evaluation?.evaluations?.[0] || fullResponse.evaluations?.[0];
                        
                        // Build simulation data for overview
                        // Build simulation data for overview
const simulationData = {
  simulation_id: fullResponse.simulation_id,
  test_suite_id: workflow.testSuite.testSuiteId,
  total_sessions: fullResponse.simulation_evaluation?.total_sessions_evaluated || 1,
  overall_score: fullResponse.simulation_evaluation?.average_overall_score || 0,
  transcript_results: fullResponse.evaluations?.map(evaluation => ({
    evaluation_id: evaluation.evaluation_id,
    session_id: evaluation.session_id,
    path_id: evaluation.path_id,
    overall_score: evaluation.overall_score,
    passed: evaluation.passed,
    transcript_result_id: evaluation.session_id, // Using session_id as transcript ID
  })) || [],
};
                        setSimulationResult({
                          ...workflow.simulationResult,
                          completed: true,
                          evaluationResult: evaluationResult,
                          simulationData: simulationData,
                          fullResponse: fullResponse, // Keep full response for reference
                        });
                        
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
                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                              workflow.simulationResult.evaluationResult?.passed 
                                ? 'bg-green-400/20' 
                                : 'bg-red-400/20'
                            }`}>
                              <svg 
                                className={`w-10 h-10 ${
                                  workflow.simulationResult.evaluationResult?.passed 
                                    ? 'text-green-400' 
                                    : 'text-red-400'
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                {workflow.simulationResult.evaluationResult?.passed ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                )}
                              </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-4">
                              {workflow.simulationResult.evaluationResult?.passed ? 'Tests Passed' : 'Tests Failed'}
                            </h1>
                            <p className="text-gray-400 mb-2">
                              Overall Score: {Math.round((workflow.simulationResult.evaluationResult?.overall_score || 0) * 100)}%
                            </p>
                            <p className="text-gray-500 text-sm">
                              Simulation ID: {workflow.simulationResult.simulationId}
                            </p>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-800 rounded-lg p-4">
                              <div className="text-gray-400 text-sm mb-1">Sessions Evaluated</div>
                              <div className="text-2xl font-bold text-white">
                                {workflow.simulationResult.simulationData?.total_sessions || 1}
                              </div>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-4">
                              <div className="text-gray-400 text-sm mb-1">Issues Found</div>
                              <div className="text-2xl font-bold text-white">
                                {workflow.simulationResult.evaluationResult?.issues_found || 0}
                              </div>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-4">
                              <div className="text-gray-400 text-sm mb-1">Execution Time</div>
                              <div className="text-2xl font-bold text-white">
                                {Math.round((workflow.simulationResult.evaluationResult?.execution_time_ms || 0) / 1000)}s
                              </div>
                            </div>
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
                              onClick={() => navigate("/evaluation")}
                              className="flex-1 px-6 py-3 bg-teal-400 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors"
                            >
                              View Detailed Evaluation
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