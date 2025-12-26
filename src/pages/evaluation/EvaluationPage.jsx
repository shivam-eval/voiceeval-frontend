import React, { useState } from "react";
import { useWorkflow } from "../../context/WorkflowContext";
import EvaluationDashboard from "./index";
import PrimaryButton from "../../components/PrimaryButton";

const EvaluationPage = () => {
  const { workflow } = useWorkflow();
  const [selectedSim, setSelectedSim] = useState(null);

  // If we just ran a simulation, we can auto-select it
  const currentSim = workflow.simulation.run ? workflow.simulation : null;

  if (!workflow.simulation.run) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Evaluations Available</h2>
        <p className="text-gray-400 max-w-md">
          You need to run a simulation before you can view evaluation results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-8 pt-8">
        <h1 className="text-3xl font-bold text-white">Evaluations</h1>
        <p className="text-gray-400 mt-1">
          Detailed performance analysis and insights from your simulations.
        </p>
      </div>

      <div className="p-8">
        <EvaluationDashboard 
          evaluationData={workflow.simulation.results} 
        />
      </div>
    </div>
  );
};

export default EvaluationPage;
