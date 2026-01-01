import { useState } from "react";
import Button from "./Button";

const CreateTestSuiteModal = ({ isOpen, onClose, onSubmit, isLoading, agents, defaultAgentId }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Basics
        name: "",
        description: "",
        owner: "",
        agent_id: defaultAgentId || "",

        // Step 2: Test Case Type
        testCaseType: "scenario", // scenario, transcript, audio, graph, ivr

        // Step 3: Configuration
        test_profile_id: "",
        persona_id: "",
        metrics: [],
        extra_instructions: "",
    });

    const totalSteps = 3;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.name && formData.agent_id;
            case 2:
                return formData.testCaseType;
            case 3:
                return true; // Optional fields
            default:
                return false;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Create Test Suite</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Steps Indicator */}
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div
                                    className={`h-2 rounded-full flex-1 ${step <= currentStep ? 'bg-teal-400' : 'bg-gray-700'
                                        }`}
                                />
                                {step < totalSteps && (
                                    <div className="w-2" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 text-sm text-gray-400">
                        Step {currentStep} of {totalSteps}:{" "}
                        {currentStep === 1 && "Basic Information"}
                        {currentStep === 2 && "Test Case Type"}
                        {currentStep === 3 && "Configuration"}
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Step 1: Basics */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Suite Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="e.g., Customer Support Test Suite"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Brief description of this test suite..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Owner
                                </label>
                                <input
                                    type="text"
                                    value={formData.owner}
                                    onChange={(e) => handleInputChange('owner', e.target.value)}
                                    placeholder="Your name or team"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Associated Agent <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={formData.agent_id}
                                    onChange={(e) => handleInputChange('agent_id', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                    required
                                >
                                    <option value="">Select an agent...</option>
                                    {agents?.map((agent) => (
                                        <option key={agent._id} value={agent._id}>
                                            {agent.agent_name || agent.agent_id} ({agent.platform})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Test Case Type Selection */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Select the type of test cases for this suite:
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Choose how you want to create and manage test cases in this suite
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Scenarios Card */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, testCaseType: 'scenario' })}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${formData.testCaseType === 'scenario'
                                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="text-4xl mb-3">📝</div>
                                    <h4 className="text-lg font-bold text-white mb-2">Scenarios</h4>
                                    <p className="text-sm text-gray-400">
                                        Text-based test scenarios with expected flows and outcomes.
                                    </p>
                                    <div className="mt-4 text-xs text-gray-500">
                                        Best for: Custom scenarios, edge cases
                                    </div>
                                </button>

                                {/* Transcripts Card */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, testCaseType: 'transcript' })}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${formData.testCaseType === 'transcript'
                                            ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="text-4xl mb-3">📄</div>
                                    <h4 className="text-lg font-bold text-white mb-2">Transcripts</h4>
                                    <p className="text-sm text-gray-400">
                                        Conversation logs from real calls. We'll replay them.
                                    </p>
                                    <div className="mt-4 text-xs text-gray-500">
                                        Best for: Real conversation replay
                                    </div>
                                </button>

                                {/* Audio Files Card */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, testCaseType: 'audio' })}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${formData.testCaseType === 'audio'
                                            ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/20'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="text-4xl mb-3">🎵</div>
                                    <h4 className="text-lg font-bold text-white mb-2">Audio Files</h4>
                                    <p className="text-sm text-gray-400">
                                        Upload audio recordings for observed testing workflow.
                                    </p>
                                    <div className="mt-4 text-xs text-gray-500">
                                        Best for: Real call analysis
                                    </div>
                                </button>

                                {/* Graph-based Card */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, testCaseType: 'graph' })}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${formData.testCaseType === 'graph'
                                            ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="text-4xl mb-3">📊</div>
                                    <h4 className="text-lg font-bold text-white mb-2">Graph-based</h4>
                                    <p className="text-sm text-gray-400">
                                        Flow diagrams and decision trees for automated logic testing.
                                    </p>
                                    <div className="mt-4 text-xs text-gray-500">
                                        Best for: Complete flow coverage
                                    </div>
                                </button>

                                {/* IVR Testing Card */}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, testCaseType: 'ivr' })}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${formData.testCaseType === 'ivr'
                                            ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="text-4xl mb-3">☎️</div>
                                    <h4 className="text-lg font-bold text-white mb-2">IVR Testing</h4>
                                    <p className="text-sm text-gray-400">
                                        Phone tree navigation and DTMF input sequence tests.
                                    </p>
                                    <div className="mt-4 text-xs text-gray-500">
                                        Best for: IVR systems
                                    </div>
                                </button>
                            </div>

                            {formData.testCaseType && (
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <p className="text-sm text-blue-400">
                                        💡 Selected: <span className="font-semibold">
                                            {formData.testCaseType.charAt(0).toUpperCase() + formData.testCaseType.slice(1)}
                                        </span>. You can add test cases after creating the suite.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Configuration */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Test Profile
                                </label>
                                <select
                                    value={formData.test_profile_id}
                                    onChange={(e) => handleInputChange('test_profile_id', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                >
                                    <option value="">None (use default)</option>
                                    {/* TODO: Load test profiles */}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Default Persona
                                </label>
                                <select
                                    value={formData.persona_id}
                                    onChange={(e) => handleInputChange('persona_id', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                >
                                    <option value="">None (will set per test case)</option>
                                    {/* TODO: Load personas */}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Extra Instructions
                                </label>
                                <textarea
                                    value={formData.extra_instructions}
                                    onChange={(e) => handleInputChange('extra_instructions', e.target.value)}
                                    placeholder="Additional instructions for evaluators..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 resize-none"
                                />
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-sm text-blue-400">
                                    💡 Tip: You can add individual test cases after creating the suite.
                                </p>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex items-center justify-between">
                    <div>
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        {currentStep < totalSteps ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={!isStepValid()}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                loading={isLoading}
                                disabled={!isStepValid()}
                            >
                                Create Suite
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTestSuiteModal;
