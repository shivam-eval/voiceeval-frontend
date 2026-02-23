import { useState } from "react";
import { toast } from "react-toastify";
import Button from "./Button";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { usePersonas } from "../hooks/usePersonas";
import { useTestProfiles } from "../hooks/useTestProfiles";
import { useAgentFlows } from "../hooks/useFlows";
import { API_BASE_URL } from "../config/constants";
import { scenarioConfigsApi } from "../utils/api";

const CreateTestSuiteModal = ({ isOpen, onClose, onSubmit, isLoading, agents, defaultAgentId }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Basics
        name: "",
        description: "",
        owner: "",
        agent_id: defaultAgentId || "",

        // Step 2: Test Case Type (removed - always flow-based)
        testCaseType: "graph", // Always flow-based

        // Step 3: Configuration (for scenario/audio)
        test_profile_id: "",
        persona_id: "",
        metrics: [],
        extra_instructions: "",

        // Step 3: Generation Config (for graph/flow-based)
        flow_id: "",  // Selected flow for generation
        call_type: "inbound",
        max_paths: 10,
        include_edge_cases: true,
        region: "apac_india",

        // Audio upload specific
        audioFiles: [],
    });

    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadResults, setUploadResults] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Load personas and test profiles
    const { data: personasData } = usePersonas({ limit: 500 });
    const { data: testProfilesData } = useTestProfiles({
        agent_id: formData.agent_id,
        limit: 500
    });
    const { data: flowsData, isLoading: flowsLoading } = useAgentFlows(formData.agent_id);

    const personas = personasData?.personas || [];
    const testProfiles = testProfilesData?.test_profiles || [];
    const flows = flowsData?.flows || [];

    console.log('Agent ID:', formData.agent_id);
    console.log('Flows Data:', flowsData);
    console.log('Flows Array:', flows);

    const totalSteps = 2; // Simplified: Basics + Configuration

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        addAudioFiles(files);
    };

    const addAudioFiles = (files) => {
        const audioFiles = files.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return ['wav', 'mp3', 'flac', 'ogg', 'm4a', 'aac', 'mp4'].includes(ext);
        });

        const newFiles = audioFiles.map(file => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            status: 'pending'
        }));

        setFormData(prev => ({
            ...prev,
            audioFiles: [...prev.audioFiles, ...newFiles]
        }));
    };

    const removeAudioFile = (fileId) => {
        setFormData(prev => ({
            ...prev,
            audioFiles: prev.audioFiles.filter(f => f.id !== fileId)
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        addAudioFiles(files);
    };

    const uploadAudioFiles = async () => {
        if (formData.audioFiles.length === 0) return null;

        setIsUploading(true);

        try {
            const uploadFormData = new FormData();
            formData.audioFiles.forEach(({ file }) => {
                uploadFormData.append('files', file);
            });

            const token = localStorage.getItem("authToken");
            const rawTenantId = localStorage.getItem("tenantId");
            const tenantId = (rawTenantId === 'undefined' || rawTenantId === 'null') ? null : rawTenantId;
            const headers = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;
            if (tenantId) headers["X-Tenant-ID"] = tenantId;

            const response = await fetch(
                `${API_BASE_URL}/audio/bulk-upload?category=test_suites`,
                {
                    method: 'POST',
                    headers,
                    body: uploadFormData,
                }
            );

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            setUploadResults(result);
            return result;
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Upload failed: ${error.message}`);
            setUploadResults({
                success: false,
                message: error.message,
                total_files: formData.audioFiles.length,
                successful_uploads: 0,
                failed_uploads: formData.audioFiles.length
            });
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Close modal immediately and show progress toast
        onClose();
        toast.info('Creating test case...');

        // If audio type, upload files first
        if (formData.testCaseType === 'audio' && formData.audioFiles.length > 0) {
            try {
                const uploadResult = await uploadAudioFiles();

                if (uploadResult && uploadResult.success) {
                    const suiteData = {
                        name: formData.name,
                        description: formData.description,
                        owner: formData.owner,
                        agent_id: formData.agent_id,
                        flow_id: formData.flow_id || undefined,
                        test_cases: [],
                        metadata: {
                            test_case_type: formData.testCaseType,
                            audio_upload_batch_id: uploadResult.upload_batch_id,
                            audio_file_statuses: uploadResult.file_statuses,
                            extra_instructions: formData.extra_instructions,
                            test_profile_id: formData.test_profile_id,
                            default_persona_id: formData.persona_id,
                        }
                    };
                    // Call backend generation endpoint with hardcoded payload (for now)
                    try {
                        const payload = {
                            agent_id: formData.agent_id || defaultAgentId,
                            demography: "india",
                            count: 5,
                            dry_run: false,
                        };
                        await scenarioConfigsApi.generate(payload);
                        toast.success("Scenario configs generation requested");
                    } catch (err) {
                        console.error("Scenario generation failed:", err);
                        toast.error("Failed to request scenario generation");
                    }
                } else {
                    toast.error('Audio upload failed. Please try again.');
                }
            } catch (error) {
                // Error handled by global interceptor
            }
        } else {
            const suiteData = {
                name: formData.name,
                description: formData.description,
                owner: formData.owner,
                agent_id: formData.agent_id,
                flow_id: formData.flow_id || undefined,
                test_cases: [],
                metadata: {
                    test_case_type: formData.testCaseType,
                    extra_instructions: formData.extra_instructions,
                    test_profile_id: formData.test_profile_id,
                    default_persona_id: formData.persona_id,
                    // Include generation config for graph-based
                    ...(formData.testCaseType === 'graph' && {
                        call_type: formData.call_type,
                        region: formData.region,
                        max_paths: formData.max_paths,
                        include_edge_cases: formData.include_edge_cases
                    })
                }
            };
            // Call backend generation endpoint with hardcoded payload (for now)
            try {
                const payload = {
                    agent_id: formData.agent_id || defaultAgentId,
                    demography: "india",
                    count: 5,
                    dry_run: false,
                };
                await scenarioConfigsApi.generate(payload);
                toast.success("Scenario configs generation requested");
            } catch (err) {
                console.error("Scenario generation failed:", err);
                toast.error("Failed to request scenario generation");
            }
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.name && formData.agent_id;
            case 2:
                // Flow-based configuration step - always valid (all optional)
                return true;
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
                        <h2 className="text-2xl font-bold text-white">Create Test Case</h2>
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
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
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
                        {currentStep === 2 && "Flow Configuration"}
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Step 1: Basics */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Case Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="e.g., Customer Support Test Case"
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
                                    placeholder="Brief description of this test case..."
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
                                        <option key={agent.agent_id} value={agent.agent_id}>
                                            { (agent.name || agent.agent_name) ? `${agent.name || agent.agent_name} (${agent.agent_id})` : agent.agent_id }
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}



                    {/* Step 2: Configuration (Flow-based only) */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            {/* Flow-based: Generation Config */}
                            <>
                                {/* Call Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        Call Type <span className="text-red-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {["inbound", "outbound"].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => handleInputChange('call_type', type)}
                                                className={`p-4 rounded-lg border-2 transition-all ${formData.call_type === type
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

                                {/* Region */}
                                <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Region <span className="text-red-400">*</span>
                                </label>
                                <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
                                    India
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Personas will be assigned based on this region
                                </p>
                                </div>

                                {/* Max Paths */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Maximum Test Paths
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_paths}
                                        onChange={(e) => handleInputChange('max_paths', parseInt(e.target.value) || 10)}
                                        min={1}
                                        max={50}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Limit the number of test paths to generate (1-50)
                                    </p>
                                </div>

                                {/* Include Edge Cases */}
                                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <div>
                                        <label className="text-sm font-medium text-white">Include Edge Cases</label>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Generate additional test cases for fallback and error scenarios
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange('include_edge_cases', !formData.include_edge_cases)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.include_edge_cases ? 'bg-teal-500' : 'bg-gray-600'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.include_edge_cases ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <p className="text-sm text-blue-400">
                                        💡 AI will analyze your flow tree and generate test paths with auto-assigned personas
                                    </p>
                                </div>
                            </>
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
                                loading={isLoading || isUploading}
                                disabled={!isStepValid() || isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Create Case'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTestSuiteModal;
