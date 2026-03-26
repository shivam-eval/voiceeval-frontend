import { useState } from "react";
import { toast } from "react-toastify";
import Button from "./Button";
import { scenarioConfigsApi } from "../utils/api";

const AVAILABLE_LANGUAGES = [
    "Hindi", "Bengali", "Tamil", "Telugu", "Gujarati",
    "Kannada", "Malayalam", "Marathi", "Punjabi", "Odia", "English",
];

const CreateTestSuiteModal = ({ isOpen, onClose, onSubmit, isLoading, agents, defaultAgentId }) => {
    const [callType, setCallType] = useState("outbound");
    const [maxPaths, setMaxPaths] = useState(10);
    const [selectedLanguages, setSelectedLanguages] = useState([...AVAILABLE_LANGUAGES]);

    const allSelected = selectedLanguages.length === AVAILABLE_LANGUAGES.length;

    const toggleLanguage = (lang) => {
        setSelectedLanguages((prev) =>
            prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
        );
    };

    const toggleAll = () => {
        setSelectedLanguages(allSelected ? [] : [...AVAILABLE_LANGUAGES]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedLanguages.length === 0) {
            toast.error("Please select at least one language");
            return;
        }
        onClose();
        toast.info('Creating test case...');
        try {
            const payload = {
                agent_id: defaultAgentId,
                demography: "india",
                count: maxPaths,
                call_type: callType,
                dry_run: false,
                languages: selectedLanguages,
            };
            await scenarioConfigsApi.generate(payload);
            toast.success("Scenario configs generation requested");
        } catch (err) {
            console.error("Scenario generation failed:", err);
            toast.error("Failed to request scenario generation");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-lg w-full border border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Create Test Case</h2>
                        <p className="text-sm text-gray-400 mt-1">AI will generate test paths with auto-assigned personas</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Call Type — always outbound for now, hidden from UI */}

                    {/* Region */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Region</label>
                        <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
                            India
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Personas will be assigned based on this region</p>
                    </div>

                    {/* Languages */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Simulation Languages
                            </label>
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                            >
                                {allSelected ? "Deselect All" : "Select All"}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_LANGUAGES.map((lang) => {
                                const isSelected = selectedLanguages.includes(lang);
                                return (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => toggleLanguage(lang)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                            isSelected
                                                ? "border-teal-400 bg-teal-400/15 text-teal-300"
                                                : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {selectedLanguages.length} of {AVAILABLE_LANGUAGES.length} languages selected
                        </p>
                    </div>

                    {/* Maximum Test Paths */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Maximum Test Paths: <span className="text-teal-400 font-bold">{maxPaths}</span>
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

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-800">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isLoading} disabled={selectedLanguages.length === 0}>
                            Generate
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTestSuiteModal;
