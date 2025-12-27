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
  agent: null,
  setupResult: null,
  region: '',
  
  flow: {
    flowData: null,
    mermaid: null,
    generated: false,
  },
  
  testSuite: {
    generated: false,
    config: null,
    testSuiteId: null,      // The ID from API
    testSuitePath: null,    // The file_name from API
  },
  
  simulationResult: {
    simulationId: null,
    started: false,
    completed: false,
    evaluationResult: null,
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

  /* ---------- SETTERS ---------- */

  const setAgent = (agentData) => {
    setWorkflow((prev) => ({
      ...prev,
      agent: agentData,
    }));
  };

  const setFlowData = ({ flowData, mermaid }) => {
    setWorkflow((prev) => ({
      ...prev,
      flow: {
        generated: true,
        flowData,
        mermaid,
      },
    }));
  };

  const setTestSuite = (suiteData) => {
    setWorkflow((prev) => ({
      ...prev,
      testSuite: {
        ...prev.testSuite,
        ...suiteData,
        generated: true,
      },
    }));
  };

  const setSimulationResult = (simData) => {
    setWorkflow((prev) => ({
      ...prev,
      simulationResult: {
        ...prev.simulationResult,
        ...simData,
      },
    }));
  };

  const setSetupResult = (data) => {
    setWorkflow((prev) => ({
      ...prev,
      setupResult: data,
    }));
  };

  const setRegion = (region) => {
    setWorkflow((prev) => ({
      ...prev,
      region,
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
        setFlowData,
        setTestSuite,
        setSimulationResult,
        setSetupResult,
        setRegion,
        resetWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};