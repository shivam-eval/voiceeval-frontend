import React, { createContext, useContext, useState, useEffect } from "react";

const WorkflowContext = createContext();

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
};

const initialState = {
  agent: {
    connected: false,
    platform: null,
    agentId: null,
    metadata: {},
  },
  testSuite: {
    generated: false,
    testSuiteId: null,
    config: {},
  },
  simulation: {
    run: false,
    simulationId: null,
    status: null,
  },
  evaluation: {
    available: false,
    evaluationId: null,
  },
};

export const WorkflowProvider = ({ children }) => {
  const [workflow, setWorkflow] = useState(() => {
    const saved = localStorage.getItem("voiceeval_workflow");
    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    localStorage.setItem("voiceeval_workflow", JSON.stringify(workflow));
  }, [workflow]);

  const setAgent = (agentData) => {
    setWorkflow((prev) => ({
      ...prev,
      agent: { ...prev.agent, ...agentData, connected: true },
    }));
  };

  const setTestSuite = (suiteData) => {
    setWorkflow((prev) => ({
      ...prev,
      testSuite: { ...prev.testSuite, ...suiteData, generated: true },
    }));
  };

  const setSimulation = (simData) => {
    setWorkflow((prev) => ({
      ...prev,
      simulation: { ...prev.simulation, ...simData, run: true },
    }));
  };

  const setEvaluation = (evalData) => {
    setWorkflow((prev) => ({
      ...prev,
      evaluation: { ...prev.evaluation, ...evalData, available: true },
    }));
  };

  const resetWorkflow = () => {
    setWorkflow(initialState);
    localStorage.removeItem("voiceeval_workflow");
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflow,
        setAgent,
        setTestSuite,
        setSimulation,
        setEvaluation,
        resetWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};
