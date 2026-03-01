import { useState } from "react";
import { Bot, PenLine } from "lucide-react";
import CreateTestSuiteModal from "./CreateTestSuiteModal";
import CreateManualTestCaseModal from "./CreateManualTestCaseModal";

/**
 * Unified "Create Test Case" modal.
 * First shows a method picker (AI vs Manual), then delegates to the chosen sub-modal.
 */
const CreateTestCaseModal = ({ isOpen, onClose, agentId, agents, onCreated, onSubmitAI, isLoadingAI }) => {
    const [mode, setMode] = useState(null); // null | "ai" | "manual"

    const handleClose = () => {
        setMode(null);
        onClose();
    };

    if (!isOpen) return null;

    // Delegate to sub-modals once a mode is picked
    if (mode === "ai") {
        return (
            <CreateTestSuiteModal
                isOpen={true}
                onClose={handleClose}
                onSubmit={onSubmitAI}
                isLoading={isLoadingAI}
                agents={agents}
                defaultAgentId={agentId}
            />
        );
    }

    if (mode === "manual") {
        return (
            <CreateManualTestCaseModal
                isOpen={true}
                onClose={handleClose}
                agentId={agentId}
                onCreated={onCreated}
            />
        );
    }

    // Method picker screen
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-lg w-full border border-gray-800">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Create Test Case</h2>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">How would you like to create the test case?</p>
                </div>

                <div className="p-6 space-y-4">
                    <button
                        onClick={() => setMode("ai")}
                        className="w-full p-5 rounded-xl border-2 border-gray-700 bg-gray-800 hover:border-teal-400 hover:bg-teal-400/5 transition-all text-left flex items-start gap-4"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-400/10 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <div className="text-white font-semibold">AI Generated</div>
                            <div className="text-sm text-gray-400 mt-1">
                                Automatically generate scenario configs with AI-chosen speaker, language, objective, and parameters.
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setMode("manual")}
                        className="w-full p-5 rounded-xl border-2 border-gray-700 bg-gray-800 hover:border-teal-400 hover:bg-teal-400/5 transition-all text-left flex items-start gap-4"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
                            <PenLine className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-white font-semibold">Manual</div>
                            <div className="text-sm text-gray-400 mt-1">
                                Choose the objective, input values, voice, language, and environment settings yourself. Config name and system prompt will be auto-generated.
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTestCaseModal;
