import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { flowsApi } from "../utils/api";
import CanonicalFlowDiagram from "../pages/workspace/CanonicalFlowDiagram";
import DashboardLoader from "./DashboardLoader";

const FlowDiagramModal = ({ isOpen, onClose, flowId, flowName }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mermaidCode, setMermaidCode] = useState(null);

    useEffect(() => {
        if (isOpen && flowId) {
            loadMermaid();
        }
    }, [isOpen, flowId]);

    const loadMermaid = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await flowsApi.getMermaid(flowId);
            setMermaidCode(response.mermaid);
        } catch (err) {
            console.error("Failed to load mermaid:", err);
            const errorMessage = err.message || "Failed to load diagram";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Flow Diagram</h2>
                        {flowName && (
                            <p className="text-gray-400 text-sm mt-1">{flowName}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <DashboardLoader message="Loading diagram..." />
                    ) : error ? (
                        <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
                            <div className="text-red-400 text-lg font-semibold mb-2">Error</div>
                            <p className="text-gray-300">{error}</p>
                            <button
                                onClick={loadMermaid}
                                className="mt-4 px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : mermaidCode ? (
                        <CanonicalFlowDiagram mermaidCode={mermaidCode} />
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            No diagram available
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlowDiagramModal;
