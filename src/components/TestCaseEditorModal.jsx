import { useState } from "react";
import Button from "./Button";
import Badge from "./Badge";
import { TEST_CASE_TYPE_CONFIG, PRIORITY_LEVELS, PRIORITY_CONFIG, EVALUATION_METRICS } from "../config/testCaseConstants";

const TestCaseEditorModal = ({ isOpen, onClose, onSave, testCase, personas = [], isLoading }) => {
    const [activeTab, setActiveTab] = useState("basics");
    const [formData, setFormData] = useState({
        name: testCase?.name || "",
        type: testCase?.type || "scenario",
        input: testCase?.input || "",
        expected_output: testCase?.expected_output || "",
        priority: testCase?.priority || PRIORITY_LEVELS.MEDIUM,
        persona_id: testCase?.persona_id || "",
        persona_overrides: testCase?.persona_overrides || {},
        metrics: testCase?.metrics || [],
        success_criteria: testCase?.success_criteria || {},
        tags: testCase?.tags || [],
        extra_instructions: testCase?.extra_instructions || "",
        metadata: testCase?.metadata || {},
        dependencies: testCase?.dependencies || [],
    });

    const tabs = [
        { id: "basics", label: "Basics", icon: "📝" },
        { id: "persona", label: "Persona", icon: "👤" },
        { id: "evaluation", label: "Evaluation", icon: "📊" },
        { id: "advanced", label: "Advanced", icon: "⚙️" },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMetricToggle = (metricId) => {
        setFormData(prev => ({
            ...prev,
            metrics: prev.metrics.includes(metricId)
                ? prev.metrics.filter(m => m !== metricId)
                : [...prev.metrics, metricId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleTagAdd = (tag) => {
        if (tag && !formData.tags.includes(tag)) {
            handleInputChange('tags', [...formData.tags, tag]);
        }
    };

    const handleTagRemove = (tag) => {
        handleInputChange('tags', formData.tags.filter(t => t !== tag));
    };

    if (!isOpen) return null;

    const typeConfig = TEST_CASE_TYPE_CONFIG[formData.type] || {};

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {testCase ? 'Edit Test Case' : 'Create Test Case'}
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Configure test case parameters and evaluation criteria
                            </p>
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

                    {/* Tabs */}
                    <div className="flex items-center gap-1 mt-6 border-b border-gray-800">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 font-medium transition-all ${activeTab === tab.id
                                    ? 'text-teal-400 border-b-2 border-teal-400'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex flex-col" style={{ height: 'calc(90vh - 180px)' }}>
                    <div className="p-6 overflow-y-auto flex-1">
                        {/* Tab 1: Basics */}
                        {activeTab === "basics" && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Test Case Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="e.g., Appointment Booking - Happy Path"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Test Case Type <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleInputChange('type', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                        required
                                    >
                                        {Object.entries(TEST_CASE_TYPE_CONFIG).map(([value, config]) => (
                                            <option key={value} value={value}>
                                                {config.icon} {config.label}
                                            </option>
                                        ))}
                                    </select>
                                    {typeConfig.description && (
                                        <p className="text-sm text-gray-500 mt-1">{typeConfig.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Input / Scenario <span className="text-red-400">*</span>
                                    </label>
                                    {formData.type === 'audio' ? (
                                        <div className="w-full px-4 py-8 bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg text-center hover:border-gray-600 transition-colors cursor-pointer">
                                            <div className="text-4xl mb-2">🎵</div>
                                            <p className="text-gray-400 text-sm mb-1">Click to upload or drag and drop</p>
                                            <p className="text-gray-500 text-xs">WAV, MP3, M4A (max 10MB)</p>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={formData.input}
                                            onChange={(e) => handleInputChange('input', e.target.value)}
                                            placeholder={
                                                formData.type === 'transcript'
                                                    ? "Paste conversation transcript here..."
                                                    : "Describe the test scenario or user input..."
                                            }
                                            rows={6}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 resize-none font-mono text-sm"
                                            required
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Expected Output
                                    </label>
                                    <textarea
                                        value={formData.expected_output}
                                        onChange={(e) => handleInputChange('expected_output', e.target.value)}
                                        placeholder="Describe expected agent response or outcome..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Priority
                                    </label>
                                    <div className="flex gap-3">
                                        {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => handleInputChange('priority', value)}
                                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${formData.priority === value
                                                    ? `border-${config.color}-500 bg-${config.color}-500/10`
                                                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                                    }`}
                                            >
                                                <div className="text-white font-medium">{config.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Persona */}
                        {activeTab === "persona" && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Persona Selection
                                    </label>
                                    <select
                                        value={formData.persona_id}
                                        onChange={(e) => handleInputChange('persona_id', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                    >
                                        <option value="">None (use default)</option>
                                        {personas.map((persona) => (
                                            <option key={persona.persona_id} value={persona.persona_id}>
                                                {persona.name} - {persona.region || 'Unknown region'}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Select a persona to simulate user behavior and speech patterns
                                    </p>
                                </div>

                                {formData.persona_id && (
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-blue-400 mb-2">Selected Persona Preview</h4>
                                        <p className="text-sm text-gray-400">
                                            Persona details and voice sample will appear here
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                                        Persona Behavior Overrides (Optional)
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">
                                                Patience Level
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={formData.persona_overrides.patience || 5}
                                                onChange={(e) => handleInputChange('persona_overrides', {
                                                    ...formData.persona_overrides,
                                                    patience: parseInt(e.target.value)
                                                })}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>Impatient</span>
                                                <span>Very Patient</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">
                                                Verbosity
                                            </label>
                                            <select
                                                value={formData.persona_overrides.verbosity || 'medium'}
                                                onChange={(e) => handleInputChange('persona_overrides', {
                                                    ...formData.persona_overrides,
                                                    verbosity: e.target.value
                                                })}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400"
                                            >
                                                <option value="low">Concise</option>
                                                <option value="medium">Normal</option>
                                                <option value="high">Verbose</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">
                                                Special Instructions
                                            </label>
                                            <textarea
                                                value={formData.persona_overrides.special_instructions || ''}
                                                onChange={(e) => handleInputChange('persona_overrides', {
                                                    ...formData.persona_overrides,
                                                    special_instructions: e.target.value
                                                })}
                                                placeholder="e.g., Speak with background noise, use specific accent..."
                                                rows={3}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-teal-400 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Evaluation */}
                        {activeTab === "evaluation" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                                        Metrics to Evaluate
                                    </h3>
                                    <div className="space-y-2">
                                        {EVALUATION_METRICS.map((metric) => (
                                            <label
                                                key={metric.id}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-750 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.metrics.includes(metric.id)}
                                                    onChange={() => handleMetricToggle(metric.id)}
                                                    className="mt-1 w-4 h-4 text-teal-500 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-white text-sm font-medium">{metric.label}</div>
                                                    <div className="text-gray-400 text-xs mt-0.5">{metric.description}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                                        Success Criteria
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">
                                                Minimum Semantic Accuracy (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.success_criteria.min_semantic_accuracy || 80}
                                                onChange={(e) => handleInputChange('success_criteria', {
                                                    ...formData.success_criteria,
                                                    min_semantic_accuracy: parseInt(e.target.value)
                                                })}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">
                                                Maximum Response Time (ms)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.success_criteria.max_response_time || 2000}
                                                onChange={(e) => handleInputChange('success_criteria', {
                                                    ...formData.success_criteria,
                                                    max_response_time: parseInt(e.target.value)
                                                })}
                                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">
                                                Task Completion Required
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="task_completion"
                                                        checked={formData.success_criteria.require_task_completion === true}
                                                        onChange={() => handleInputChange('success_criteria', {
                                                            ...formData.success_criteria,
                                                            require_task_completion: true
                                                        })}
                                                        className="w-4 h-4 text-teal-500"
                                                    />
                                                    <span className="text-white text-sm">Yes</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="task_completion"
                                                        checked={formData.success_criteria.require_task_completion === false}
                                                        onChange={() => handleInputChange('success_criteria', {
                                                            ...formData.success_criteria,
                                                            require_task_completion: false
                                                        })}
                                                        className="w-4 h-4 text-teal-500"
                                                    />
                                                    <span className="text-white text-sm">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Advanced */}
                        {activeTab === "advanced" && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.tags.map((tag) => (
                                            <Badge key={tag} variant="info" className="flex items-center gap-1">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleTagRemove(tag)}
                                                    className="ml-1 hover:text-red-400"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add tag..."
                                            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleTagAdd(e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Press Enter to add tags</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Extra Instructions for Evaluator
                                    </label>
                                    <textarea
                                        value={formData.extra_instructions}
                                        onChange={(e) => handleInputChange('extra_instructions', e.target.value)}
                                        placeholder="Additional context or special evaluation instructions..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Custom Metadata (JSON)
                                    </label>
                                    <textarea
                                        value={JSON.stringify(formData.metadata, null, 2)}
                                        onChange={(e) => {
                                            try {
                                                const parsed = JSON.parse(e.target.value);
                                                handleInputChange('metadata', parsed);
                                            } catch (err) {
                                                // Invalid JSON, don't update
                                            }
                                        }}
                                        placeholder='{"key": "value"}'
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 resize-none font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Dependencies (Test Case IDs)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.dependencies.join(', ')}
                                        onChange={(e) => handleInputChange('dependencies',
                                            e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                        )}
                                        placeholder="test-case-1, test-case-2"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Comma-separated test case IDs that must run before this one
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-800 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !formData.name || !formData.input}
                        >
                            {isLoading ? 'Saving...' : (testCase ? 'Save Changes' : 'Create Test Case')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TestCaseEditorModal;
