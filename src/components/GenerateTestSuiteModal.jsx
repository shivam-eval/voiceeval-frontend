import { useState } from "react";
import { useGenerateTestSuite } from "../hooks/useGeneration";
import { usePersonasLibrary } from "../hooks/usePersonasLibrary";
import Button from "./Button";
import Badge from "./Badge";

const GenerateTestSuiteModal = ({ isOpen, onClose, flowId, agentId, onTestSuiteGenerated }) => {
    const [callType, setCallType] = useState("inbound");
    const [maxPaths, setMaxPaths] = useState(10);
    const [includeEdgeCases, setIncludeEdgeCases] = useState(true);
    const [region, setRegion] = useState("apac_india");
    const [generationStep, setGenerationStep] = useState(0); // 0: config, 1: generating, 2: review
    const [testSuiteData, setTestSuiteData] = useState(null);

    const generateTestSuite = useGenerateTestSuite();
    const { data: personasData } = usePersonasLibrary({});

    const handleGenerate = async () => {
        setGenerationStep(1);
        try {
            const result = await generateTestSuite.mutateAsync({
                flow_id: flowId,
                agent_id: agentId,
                call_type: callType,
                max_paths: maxPaths,
                include_edge_cases: includeEdgeCases,
                region: region,
            });
            setTestSuiteData(result);
            setGenerationStep(2);
        } catch (error) {
            alert(`Generation failed: ${error.message}`);
            setGenerationStep(0);
        }
    };

    const handleSave = () => {
        if (onTestSuiteGenerated && testSuiteData) {
            onTestSuiteGenerated(testSuiteData);
        }
        handleClose();
    };

    const handleClose = () => {
        setGenerationStep(0);
        setTestSuiteData(null);
        onClose();
    };

    if (!isOpen) return null;

    const regions = personasData?.regions || ["apac_india", "na", "eu", "default"];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Generate Test Suite</h2>
                            <p className="text-gray-400">Create test paths with AI-assigned personas</p>
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
                            {/* Call Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Call Type <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {["inbound", "outbound"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setCallType(type)}
                                            className={`p-4 rounded-lg border-2 transition-all ${callType === type
                                                ? 'border-teal-400 bg-teal-400/10'
                                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                                }`}
                                        >
                                            <div className="text-lg font-semibold text-white mb-1">
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {type === 'inbound' ? 'Customer calls agent' : 'Agent calls customer'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Max Paths */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Maximum Paths: <span className="text-teal-400 font-bold">{maxPaths}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={maxPaths}
                                    onChange={(e) => setMaxPaths(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1</span>
                                    <span>25</span>
                                    <span>50</span>
                                </div>
                            </div>

                            {/* Region */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Region for Persona Assignment
                                </label>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                >
                                    {regions.map((r) => (
                                        <option key={r} value={r}>
                                            {r.replace('_', ' ').toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Include Edge Cases */}
                            <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="edgeCases"
                                    checked={includeEdgeCases}
                                    onChange={(e) => setIncludeEdgeCases(e.target.checked)}
                                    className="w-5 h-5 text-teal-400 bg-gray-700 border-gray-600 rounded focus:ring-teal-400 focus:ring-2"
                                />
                                <label htmlFor="edgeCases" className="flex-1 cursor-pointer">
                                    <div className="text-white font-medium">Include Edge Cases</div>
                                    <div className="text-sm text-gray-400">Generate error scenarios and edge case paths</div>
                                </label>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-sm text-blue-400">
                                    💡 AI will analyze your flow and generate realistic test scenarios with appropriate personas.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Generating */}
                    {generationStep === 1 && (
                        <div className="py-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-teal-400 mb-6"></div>
                            <h3 className="text-xl font-semibold text-white mb-4">Generating Test Suite...</h3>
                            <div className="space-y-3 max-w-md mx-auto">
                                {[
                                    "Analyzing flow paths...",
                                    "Generating test scenarios...",
                                    "Assigning personas...",
                                    "Enriching test cases...",
                                ].map((step, idx) => (
                                    <div key={idx} className="text-gray-400 text-sm">{step}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Review */}
                    {generationStep === 2 && testSuiteData && (
                        <div className="space-y-6">
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        {testSuiteData.total_paths} Test Paths Generated
                                    </h3>
                                    <Badge variant="success" size="sm">Ready</Badge>
                                </div>
                                <p className="text-gray-400">Flow: {testSuiteData.flow_tree_name}</p>
                            </div>

                            {/* Test Paths Table */}
                            <div className="bg-gray-800 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-900">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Path Name</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Persona</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {testSuiteData.test_paths?.slice(0, 5).map((path, idx) => (
                                            <tr key={idx} className="border-t border-gray-700">
                                                <td className="px-4 py-3 text-white">
                                                    {path.path_name || `Path ${idx + 1}`}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {path.assigned_personas?.[0] && (
                                                        <div className="text-sm">
                                                            <div className="text-teal-400">{path.assigned_personas[0].name}</div>
                                                            <div className="text-gray-500 text-xs">
                                                                {(path.assigned_personas[0].confidence_score * 100).toFixed(0)}% match
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="default" size="sm">
                                                        {path.path_type || 'happy_path'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {testSuiteData.test_paths?.length > 5 && (
                                    <div className="p-4 bg-gray-900 text-center text-sm text-gray-400">
                                        + {testSuiteData.test_paths.length - 5} more paths
                                    </div>
                                )}
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <p className="text-sm text-green-400">
                                    ✅ Test suite saved with ID: {testSuiteData.test_suite_id}
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
                            disabled={!flowId && !agentId}
                            loading={generateTestSuite.isPending}
                        >
                            Generate Test Suite
                        </Button>
                    )}

                    {generationStep === 2 && (
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => setGenerationStep(0)}>
                                Generate More
                            </Button>
                            <Button onClick={handleSave}>
                                View Test Suite
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateTestSuiteModal;
