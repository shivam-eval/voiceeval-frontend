import { useState } from "react";
import Button from "./Button";

const GenerateFromFlowModal = ({ isOpen, onClose, onGenerate, flows = [], personas = [], isLoading }) => {
    const [formData, setFormData] = useState({
        flow_id: "",
        include_edge_cases: true,
        cover_all_paths: true,
        max_paths: 25,
        region: "india",
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
                    <h2 className="text-2xl font-bold text-white">Generate from Flow Tree</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Automatically generate test cases from conversation flow
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Flow <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={formData.flow_id}
                            onChange={(e) => setFormData({ ...formData, flow_id: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                            required
                        >
                            <option value="">Choose a flow...</option>
                            {flows.map((flow) => (
                                <option key={flow._id} value={flow._id}>
                                    {flow.name} ({flow.nodes?.length || 0} nodes)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Configuration
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.include_edge_cases}
                                    onChange={(e) => setFormData({ ...formData, include_edge_cases: e.target.checked })}
                                    className="w-4 h-4 text-teal-500 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
                                />
                                <div className="flex-1">
                                    <div className="text-white text-sm font-medium">Include Edge Cases</div>
                                    <div className="text-gray-400 text-xs">Generate test cases for error paths and edge scenarios</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.cover_all_paths}
                                    onChange={(e) => setFormData({ ...formData, cover_all_paths: e.target.checked })}
                                    className="w-4 h-4 text-teal-500 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
                                />
                                <div className="flex-1">
                                    <div className="text-white text-sm font-medium">Cover All Paths</div>
                                    <div className="text-gray-400 text-xs">Ensure all conversation paths are tested</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Maximum Paths
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={formData.max_paths}
                            onChange={(e) => setFormData({ ...formData, max_paths: parseInt(e.target.value) })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-400 mt-1">
                            <span>1</span>
                            <span className="font-semibold text-teal-400">{formData.max_paths} paths</span>
                            <span>50</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Region for Personas
                        </label>
                        <select
                            value={formData.region}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                        >
                            <option value="india">🇮🇳 India</option>
                            <option value="north_america">🇺🇸 North America</option>
                            <option value="europe">🇪🇺 Europe</option>
                        </select>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-sm text-blue-400">
                            💡 This will generate test cases by traversing the conversation flow and creating scenarios for each path.
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
                        <Button type="submit" disabled={isLoading || !formData.flow_id}>
                            {isLoading ? 'Generating...' : 'Generate Test Cases'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GenerateFromFlowModal;
