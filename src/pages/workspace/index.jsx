
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import SystemPromptViewer from "./SystemPromptViewer";
import CanonicalFlowDiagram from "./CanonicalFlowDiagram";
import QueueStatsWidget from "./QueueStatsWidget";
import RegionDropDown from "./RegionDropDown";

import { useWorkflow } from "../../context/WorkflowContext";

const WorkspaceDashboard = ({ systemConfig }) => {
  const navigate = useNavigate();

  /* ---------------- Context ---------------- */
  const {
    workflow,
    setFlowData,
    setRegion,
  } = useWorkflow();

  /* ---------------- Config ---------------- */
  const {
    flowData: preloadedFlowData,
    mermaid: preloadedMermaid,
    systemPrompt,
    system_prompt,
  } = systemConfig || {};

  const resolvedSystemPrompt = systemPrompt || system_prompt || "";

  /* ---------------- Refs ---------------- */
  const systemPromptRef = useRef(null);
  const canonicalFlowRef = useRef(null);

  /* ---------------- UI State ---------------- */
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showCanonicalFlow, setShowCanonicalFlow] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");

  /* ---------------- Effects ---------------- */

  // Write flow data to context ONCE (guarded)
  useEffect(() => {
    if (!preloadedFlowData) return;

    if (!workflow?.flow?.generated) {
      setFlowData({
        flowData: preloadedFlowData,
        mermaid: preloadedMermaid,
      });
    }
  }, [
    preloadedFlowData,
    preloadedMermaid,
    workflow?.flow?.generated,
    setFlowData,
  ]);

  // Sync region to context

useEffect(() => {
  if (workflow.region !== selectedRegion) {
    setRegion(selectedRegion);
  }
}, [selectedRegion, setRegion]);

  /* ---------------- Handlers ---------------- */

  const toggleSystemPrompt = () => {
    setShowSystemPrompt((prev) => !prev);
    setTimeout(() => {
      systemPromptRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const toggleCanonicalFlow = () => {
    setShowCanonicalFlow((prev) => !prev);
    setTimeout(() => {
      canonicalFlowRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleGenerateTestCases = () => {
    navigate("/testcase/generating");
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-white">
          Voice<span className="text-teal-400">Eval</span>
        </h1>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800/50 shadow-xl">
          <div className="grid grid-cols-1 gap-4 mb-6">

            {/* -------- System Prompt -------- */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">
                Original System Prompt
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                View the system prompt used by your Voice Agent
              </p>
              <button
                onClick={toggleSystemPrompt}
                className="px-4 py-2 bg-teal-400/10 border border-teal-400/50
                           text-teal-400 rounded-lg text-sm font-medium
                           hover:bg-teal-400/20 transition-all"
              >
                {showSystemPrompt ? "Collapse" : "View System Prompt"}
              </button>
            </div>

            <div
              ref={systemPromptRef}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showSystemPrompt
                  ? "max-h-[1000px] opacity-100 mb-6"
                  : "max-h-0 opacity-0"
              }`}
            >
              <SystemPromptViewer prompt={resolvedSystemPrompt} />
            </div>

            {/* -------- Flow Diagram -------- */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">
                Canonical Flow Diagram
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Visual representation of your conversation flow
              </p>
              <button
                onClick={toggleCanonicalFlow}
                disabled={!preloadedMermaid}
                className="px-4 py-2 bg-teal-400/10 border border-teal-400/50
                           text-teal-400 rounded-lg text-sm font-medium
                           hover:bg-teal-400/20 transition-all
                           disabled:opacity-50"
              >
                {showCanonicalFlow ? "Collapse" : "View Flow Diagram"}
              </button>
            </div>

            <div
              ref={canonicalFlowRef}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showCanonicalFlow
                  ? "max-h-[1200px] opacity-100 mb-6"
                  : "max-h-0 opacity-0"
              }`}
            >
              {showCanonicalFlow && (
                <CanonicalFlowDiagram mermaidCode={preloadedMermaid} />
              )}
            </div>

            {/* -------- Region -------- */}
            <RegionDropDown
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
            />

            <QueueStatsWidget />
          </div>

          <button
            onClick={handleGenerateTestCases}
            className="w-full px-6 py-4 bg-teal-400 hover:bg-teal-500
                       text-white rounded-xl font-semibold transition-colors"
          >
            Generate Test Cases
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboard
