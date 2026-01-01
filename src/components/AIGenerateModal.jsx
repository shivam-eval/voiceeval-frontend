import { useState } from "react";
import Button from "./Button";

const AIGenerateModal = ({ isOpen, onClose, onGenerate, agent, isLoading }) => {
    const [formData, setFormData] = useState({
        include_happy_paths: true,
        include_edge_cases: true,
        include_error_handling: true,
        num_test_cases: 10,
        persona_preference: "auto",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-2xl w-full border border-gray-800">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-white">AI-Powered Test Case Generation</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Let AI generate comprehensive test scenarios based on agent configuration
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Based on Agent Configuration
                        </label>
                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="text-white font-medium">{agent?.agent_name || agent?.agent_id}</div>
                            <div className="text-gray-400 text-sm mt-1">
                                Platform: {agent?.platform} | {agent?.metadata?.configuration?.tools?.length || 0} tools configured
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Generate scenarios for:
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.include_happy_paths}
                                    onChange={(e) => setFormData({ ...formData, include_happy_paths: e.target.checked })}
                                    className="w-4 h-4 text-teal-500 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
                                />
                                <div className="flex-1">
                                    <div className="text-white text-sm font-medium">Happy Paths</div>
                                    <div className="text-gray-400 text-xs">Standard successful conversation flows</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.include_edge_cases}
                                    onChange={(e) => setFormData({ ...formData, include_edge_cases: e.target.checked })}
                                    className="w-4 h-4 text-teal-500 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
                                />
                                <div className="flex-1">
                                    <div className="text-white text-sm font-medium">Edge Cases</div>
                                    <div className="text-gray-400 text-xs">Unusual inputs and boundary conditions</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.include_error_handling}
                                    onChange={(e) => setFormData({ ...formData, include_error_handling: e.target.checked })}
                                    className="w-4 h-4 text-teal-500 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
                                />
                                <div className="flex-1">
                                    <div className="text-white text-sm font-medium">Error Handling</div>
                                    <div className="text-gray-400 text-xs">Test error recovery and graceful failures</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Number of Test Cases
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={formData.num_test_cases}
                            onChange={(e) => setFormData({ ...formData, num_test_cases: parseInt(e.target.value) })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-400 mt-1">
                            <span>5</span>
                            <span className="font-semibold text-teal-400">{formData.num_test_cases} test cases</span>
                            <span>50</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Persona Preferences
                        </label>
                        <select
                            value={formData.persona_preference}
                            onChange={(e) => setFormData({ ...formData, persona_preference: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                        >
                            <option value="auto">Auto-select personas</option>
                            <option value="diverse">Diverse mix of personas</option>
                            <option value="single">Use single default persona</option>
                        </select>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-sm text-blue-400">
                            🤖 AI will analyze your agent's capabilities and generate relevant test scenarios automatically.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Generating...' : 'Generate Test Cases'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIGenerateModal;
