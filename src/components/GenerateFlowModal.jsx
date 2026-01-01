import { useState, useEffect } from "react";
import { useAgents } from "../hooks/useAgents";
import { useGenerateFlow } from "../hooks/useGeneration";
import Button from "./Button";

const GenerateFlowModal = ({ isOpen, onClose, agentId, agentMongoId, onFlowGenerated }) => {
    const [selectedAgentId, setSelectedAgentId] = useState(agentMongoId || agentId || "");
    const [model, setModel] = useState("gpt-4o");
    const [provider, setProvider] = useState("openai");
    const [generationStep, setGenerationStep] = useState(0); // 0: config, 1: generating, 2: preview
    const [flowData, setFlowData] = useState(null);

    const { data: agentsData } = useAgents({ limit: 100 });
    const generateFlow = useGenerateFlow();

    useEffect(() => {
        if (agentMongoId || agentId) {
            setSelectedAgentId(agentMongoId || agentId);
        }
    }, [agentMongoId, agentId]);

    const handleGenerate = async () => {
        setGenerationStep(1);
        try {
            const result = await generateFlow.mutateAsync({
                agent_id: selectedAgentId,
                model,
                provider,
            });
            setFlowData(result);
            setGenerationStep(2);
        } catch (error) {
            alert(`Generation failed: ${error.message}`);
            setGenerationStep(0);
        }
    };

    const handleSaveAndContinue = () => {
        if (onFlowGenerated && flowData) {
            onFlowGenerated(flowData);
        }
        handleClose();
    };

    const handleClose = () => {
        setGenerationStep(0);
        setFlowData(null);
        onClose();
    };

    if (!isOpen) return null;

    const generationSteps = [
        "Analyzing agent configuration...",
        "Generating conversation paths...",
        "Building flow tree...",
        "Creating summary...",
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Generate Conversation Flow</h2>
                            <p className="text-gray-400">Create a flow tree from your agent configuration</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Step 0: Configuration */}
                    {generationStep === 0 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Select Agent <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={selectedAgentId}
                                    onChange={(e) => setSelectedAgentId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                    disabled={!!agentId}
                                >
                                    <option value="">Select an agent...</option>
                                    {agentsData?.agents?.map((agent) => (
                                        <option key={agent._id} value={agent.agent_id}>
                                            {agent.agent_name || agent.agent_id} ({agent.platform})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Model
                                    </label>
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                    >
                                        <optgroup label="OpenAI">
                                            <option value="gpt-4o">GPT-4o</option>
                                            <option value="gpt-4">GPT-4</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        </optgroup>
                                        <optgroup label="Groq - Llama">
                                            <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                                            <option value="llama-3.1-70b-versatile">Llama 3.1 70B Versatile</option>
                                            <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                                            <option value="llama3-70b-8192">Llama 3 70B</option>
                                            <option value="llama3-8b-8192">Llama 3 8B</option>
                                            <option value="meta-llama/llama-4-scout-17b-16e-instruct">Llama 4 Scout 17B</option>
                                        </optgroup>
                                        <optgroup label="Groq - Mixtral">
                                            <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                                        </optgroup>
                                        <optgroup label="Groq - Gemma">
                                            <option value="gemma2-9b-it">Gemma 2 9B</option>
                                            <option value="gemma-7b-it">Gemma 7B</option>
                                        </optgroup>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Provider
                                    </label>
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                    >
                                        <option value="openai">OpenAI</option>
                                        <option value="groq">Groq</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-sm text-blue-400">
                                    💡 The flow will be generated based on your agent's system prompt and configuration.
                                    This may take 30-60 seconds.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Generating */}
                    {generationStep === 1 && (
                        <div className="py-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-teal-400 mb-6"></div>
                            <h3 className="text-xl font-semibold text-white mb-4">Generating Flow...</h3>
                            <div className="space-y-3 max-w-md mx-auto">
                                {generationSteps.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-left">
                                        <div className="w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center flex-shrink-0">
                                            {idx < 2 ? (
                                                <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></div>
                                            )}
                                        </div>
                                        <span className={idx < 2 ? "text-gray-400" : "text-teal-400"}>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Preview */}
                    {generationStep === 2 && flowData && (
                        <div className="space-y-6">
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Flow Generated Successfully!</h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Flow Name</div>
                                        <div className="text-white font-medium">{flowData.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Nodes</div>
                                        <div className="text-teal-400 font-bold text-2xl">{flowData.nodes?.length || 0}</div>
                                    </div>
                                </div>

                                {flowData.description && (
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Description</div>
                                        <p className="text-gray-300">{flowData.description}</p>
                                    </div>
                                )}
                            </div>

                            {flowData.summary && (
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Summary</h4>
                                    <p className="text-gray-300 whitespace-pre-wrap">{flowData.summary}</p>
                                </div>
                            )}

                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <p className="text-sm text-green-400">
                                    ✅ Flow saved to database with ID: {flowData.flow_id}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex items-center justify-between">
                    <Button variant="secondary" onClick={handleClose}>
                        {generationStep === 2 ? 'Close' : 'Cancel'}
                    </Button>

                    {generationStep === 0 && (
                        <Button
                            onClick={handleGenerate}
                            disabled={!selectedAgentId || generateFlow.isPending}
                            loading={generateFlow.isPending}
                        >
                            Generate Flow
                        </Button>
                    )}

                    {generationStep === 2 && (
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => setGenerationStep(0)}>
                                Generate Another
                            </Button>
                            <Button onClick={handleSaveAndContinue}>
                                Generate Test Suite →
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateFlowModal;
