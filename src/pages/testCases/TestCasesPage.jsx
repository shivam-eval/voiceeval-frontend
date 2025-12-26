import React, { useState } from "react";
import { useWorkflow } from "../../context/WorkflowContext";
import WorkspaceDashboard from "../workspace";
import PrimaryButton from "../../components/PrimaryButton";
import { useNavigate } from "react-router-dom";

const TestCasesPage = () => {
  const { workflow, setTestSuite } = useWorkflow();
  const navigate = useNavigate();

  const handleTestGenerationComplete = (generatedSuite) => {
    setTestSuite({
      testSuiteId: generatedSuite.file_name,
      config: generatedSuite,
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-screen-2xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Test Case <span className="text-teal-400">Generation</span>
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Analyze your agent's behavior and generate comprehensive test scenarios.
            </p>
          </div>
          {workflow.testSuite.generated && (
            <PrimaryButton
              onClick={() => navigate("/simulations")}
              className="px-8"
            >
              Continue to Simulation
            </PrimaryButton>
          )}
        </div>

        {/* Workspace Content */}
        <div className="bg-dark-panel rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
          <WorkspaceDashboard
            systemConfig={workflow.agent}
            testSuite={workflow.testSuite.config}
            onTestGenerationComplete={handleTestGenerationComplete}
            initialStep="testing"
            hideHeader={true}
          />
        </div>
      </div>
    </div>
  );
};

export default TestCasesPage;
