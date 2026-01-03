import React, { createContext, useContext, useState, useEffect } from "react";

const WorkflowContext = createContext(null);

/* =========================
   Hook
========================= */
export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
};

/* =========================
   Initial State
========================= */
const initialState = {
  agent: null,
  setupResult: null,
  region: "",

  flow: {
    flowData: null,
    mermaid: null,
    generated: false,
  },

  testSuite: {
    generated: false,
    config: null,
    testSuiteId: null,
    testSuitePath: null,
  },

  simulationResult: {
    simulationId: null,
    started: false,
    completed: false,
    evaluationResult: null,
  },
};

/* =========================
   Provider
========================= */
export const WorkflowProvider = ({ children, initialWorkflow }) => {
  const [workflow, setWorkflow] = useState(() => {
    // If initial workflow is explicitly provided (e.g. Evaluation pages),
    // DO NOT hydrate from localStorage
    if (initialWorkflow) {
      return initialWorkflow;
    }

    const saved = localStorage.getItem("voiceeval_workflow");
    return saved ? JSON.parse(saved) : initialState;
  });

  /* Persist workflow ONLY for non-evaluation flows */
  useEffect(() => {
    if (!initialWorkflow) {
      localStorage.setItem(
        "voiceeval_workflow",
        JSON.stringify(workflow)
      );
    }
  }, [workflow, initialWorkflow]);

  /* =========================
     SETTERS
  ========================= */

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

  const setEvaluationResult = (evaluationResult) => {
    setWorkflow((prev) => ({
      ...prev,
      simulationResult: {
        ...prev.simulationResult,
        evaluationResult,
        completed: true,
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
    localStorage.removeItem("voiceeval_workflow");
    setWorkflow(initialState);
  };

  /* =========================
     Provider Value
  ========================= */
  return (
    <WorkflowContext.Provider
      value={{
        workflow,
        setAgent,
        setFlowData,
        setTestSuite,
        setSimulationResult,
        setEvaluationResult,
        setSetupResult,
        setRegion,
        resetWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};
