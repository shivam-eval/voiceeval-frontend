import React from "react";
import { useWorkflow } from "../../context/WorkflowContext";
import WorkspaceDashboard from "../workspace";
import PrimaryButton from "../../components/PrimaryButton";
import { useNavigate } from "react-router-dom";

const SimulationPage = () => {
  const { workflow, setSimulation } = useWorkflow();
  const navigate = useNavigate();

  const handleSimulationComplete = (results) => {
    setSimulation({
      simulationId: "sim_" + Date.now(),
      status: "completed",
      results: results,
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-screen-2xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Call <span className="text-teal-400">Simulation</span>
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Run automated simulations and monitor your agent's performance in real-time.
            </p>
          </div>
          {workflow.simulation.run && (
            <PrimaryButton
              onClick={() => navigate("/evaluations")}
              className="px-8"
            >
              View Detailed Evaluation
            </PrimaryButton>
          )}
        </div>

        {/* Workspace Content */}
        <div className="bg-dark-panel rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
          <WorkspaceDashboard
            systemConfig={workflow.agent}
            testSuite={workflow.testSuite.config}
            onSimulationComplete={handleSimulationComplete}
            initialStep="simulation"
            hideHeader={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;
