import { useState } from "react";
import Button from "../components/Button";
import { useImportTestSuite } from "../hooks/useTestSuites";
import { useAgents } from "../hooks/useAgents";

const ImportTestSuiteModal = ({ isOpen, onClose, onSuccess }) => {
    const [fileContent, setFileContent] = useState("");
    const [name, setName] = useState("");
    const [selectedAgentId, setSelectedAgentId] = useState("");
    const [error, setError] = useState("");

    const { data: agentsData } = useAgents({ limit: 100 });
    const importMutation = useImportTestSuite();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            setFileContent(text);

            // Try to parse and extract name
            try {
                const data = JSON.parse(text);
                setName(data.name || "");
                setSelectedAgentId(data.agent_id || "");
            } catch {
                // Invalid JSON, user will see error on submit
            }
            setError("");
        } catch (err) {
            setError("Failed to read file");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!fileContent) {
            setError("Please select a file");
            return;
        }

        if (!selectedAgentId) {
            setError("Please select an agent");
            return;
        }

        try {
            await importMutation.mutateAsync({
                fileContent,
                name: name || undefined,
                agentId: selectedAgentId
            });

            onSuccess?.();
            handleClose();
        } catch (err) {
            setError(err.message || "Import failed");
        }
    };

    const handleClose = () => {
        setFileContent("");
        setName("");
        setSelectedAgentId("");
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-white">Import Test Suite</h2>
                    <p className="text-gray-400 mt-1">Upload a JSON file exported from VoiceEval</p>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Test Suite File (JSON)
                        </label>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:cursor-pointer hover:file:bg-teal-600"
                        />
                    </div>

                    {/* Name Override */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Suite Name (optional)
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Leave empty to use name from file"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                        />
                    </div>

                    {/* Agent Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Agent <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={selectedAgentId}
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                        >
                            <option value="">Select an agent</option>
                            {agentsData?.agents?.map((agent) => (
                                <option key={agent._id} value={agent._id}>
                                    {agent.agent_name || agent.agent_id}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={handleClose} disabled={importMutation.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={importMutation.isPending || !fileContent || !selectedAgentId}>
                        {importMutation.isPending ? "Importing..." : "Import Test Suite"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImportTestSuiteModal;
