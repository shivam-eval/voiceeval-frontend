import { useState } from "react";
import Button from "./Button";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

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

        // Audio upload specific
        audioFiles: [],
    });

    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadResults, setUploadResults] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const totalSteps = formData.testCaseType === 'audio' ? 4 : 3;

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

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/v1/audio/bulk-upload?category=test_suites`,
                {
                    method: 'POST',
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

        // If audio type, upload files first
        if (formData.testCaseType === 'audio' && formData.audioFiles.length > 0) {
            try {
                const uploadResult = await uploadAudioFiles();

                if (uploadResult && uploadResult.success) {
                    // Create test suite with audio files metadata
                    const suiteData = {
                        ...formData,
                        audioUploadBatchId: uploadResult.upload_batch_id,
                        audioFileStatuses: uploadResult.file_statuses,
                    };
                    onSubmit(suiteData);
                } else {
                    alert('Audio upload failed. Please try again.');
                }
            } catch (error) {
                console.error('Failed to upload audio files:', error);
            }
        } else {
            onSubmit(formData);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.name && formData.agent_id;
            case 2:
                return formData.testCaseType;
            case 3:
                // If audio type, needs to proceed to upload step
                if (formData.testCaseType === 'audio') {
                    return true;
                }
                return true; // Optional fields
            case 4:
                // Audio upload step - at least one file required
                return formData.audioFiles.length > 0;
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
                        {currentStep === 2 && "Test Case Type"}
                        {currentStep === 3 && "Configuration"}
                        {currentStep === 4 && "Upload Audio Files"}
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
                                        <option key={agent.agent_id} value={agent.agent_id}>
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
                                    {formData.testCaseType === 'audio'
                                        ? '💡 Next: Upload audio files for test case generation.'
                                        : '💡 Tip: You can add individual test cases after creating the suite.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Audio Upload (only for audio type) */}
                    {currentStep === 4 && formData.testCaseType === 'audio' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Upload Audio Files
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Upload call recordings that will be transcribed and analyzed to generate test cases
                                </p>
                            </div>

                            {/* Drop Zone */}
                            <div
                                className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-teal-500 transition-colors"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-white font-medium mb-2">
                                    Drag and drop audio files here
                                </p>
                                <p className="text-sm text-gray-400 mb-4">
                                    or click to browse (WAV, MP3, FLAC, OGG, M4A, AAC, MP4)
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept=".wav,.mp3,.flac,.ogg,.m4a,.aac,.mp4"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="audio-file-upload"
                                    disabled={isUploading}
                                />
                                <label
                                    htmlFor="audio-file-upload"
                                    className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg cursor-pointer hover:bg-teal-700 transition-colors disabled:opacity-50"
                                >
                                    Browse Files
                                </label>
                            </div>

                            {/* Selected Files List */}
                            {formData.audioFiles.length > 0 && (
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-semibold text-white">
                                            Selected Files ({formData.audioFiles.length})
                                        </h4>
                                        {!isUploading && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, audioFiles: [] })}
                                                className="text-xs text-red-400 hover:text-red-300"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {formData.audioFiles.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between bg-gray-900 rounded-lg p-3"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="text-teal-400">
                                                        🎵
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white truncate">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {formatFileSize(file.size)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {!isUploading && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAudioFile(file.id)}
                                                        className="text-gray-400 hover:text-red-400 p-1"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Results */}
                            {uploadResults && (
                                <div className={`rounded-lg p-4 ${uploadResults.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {uploadResults.success ? (
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-400" />
                                        )}
                                        <p className={`text-sm font-medium ${uploadResults.success ? 'text-green-400' : 'text-red-400'}`}>
                                            {uploadResults.message}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Successful: {uploadResults.successful_uploads} | Failed: {uploadResults.failed_uploads}
                                    </p>
                                </div>
                            )}

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-sm text-blue-400">
                                    💡 Bulk upload supported. Audio will be transcribed and analyzed to create test cases.
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
                                loading={isLoading || isUploading}
                                disabled={!isStepValid() || isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Create Suite'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTestSuiteModal;
