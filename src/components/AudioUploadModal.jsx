import { useState, useCallback } from "react";
import Button from "./Button";
import Badge from "./Badge";

const AudioUploadModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [activeTab, setActiveTab] = useState("upload");
    const [files, setFiles] = useState([]);
    const [transcriptions, setTranscriptions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const tabs = [
        { id: "upload", label: "Upload", icon: "📤" },
        { id: "processing", label: "Processing", icon: "⚙️" },
        { id: "review", label: "Review", icon: "✓" },
    ];

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('audio/')
        );
        setFiles(prev => [...prev, ...droppedFiles]);
        if (droppedFiles.length > 0) {
            setActiveTab("processing");
        }
    }, []);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files).filter(file => 
            file.type.startsWith('audio/')
        );
        setFiles(prev => [...prev, ...selectedFiles]);
        if (selectedFiles.length > 0) {
            setActiveTab("processing");
        }
    };

    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleFinalSubmit = () => {
        onSubmit({ files, transcriptions });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Upload Audio Files</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Upload audio recordings to generate test cases
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
                    <div className="flex items-center gap-1 border-b border-gray-800">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                disabled={
                                    (tab.id === "processing" && files.length === 0) ||
                                    (tab.id === "review" && transcriptions.length === 0)
                                }
                                className={`px-6 py-3 font-medium transition-all ${activeTab === tab.id
                                        ? 'text-teal-400 border-b-2 border-teal-400'
                                        : files.length === 0 && tab.id !== "upload"
                                            ? 'text-gray-600 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
                    {/* Tab 1: Upload */}
                    {activeTab === "upload" && (
                        <div className="space-y-6">
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center hover:border-teal-500 transition-colors cursor-pointer"
                                onClick={() => document.getElementById('audio-file-input').click()}
                            >
                                <div className="text-6xl mb-4">🎵</div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Drop audio files here or click to browse
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    Supports WAV, MP3, M4A (max 10MB per file)
                                </p>
                                <Button variant="outline">
                                    Browse Files
                                </Button>
                                <input
                                    id="audio-file-input"
                                    type="file"
                                    accept="audio/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            {files.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                                        Uploaded Files ({files.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl">🎵</div>
                                                    <div>
                                                        <div className="text-white text-sm font-medium">{file.name}</div>
                                                        <div className="text-gray-400 text-xs">{formatFileSize(file.size)}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="text-gray-400 hover:text-red-400 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-sm text-blue-400">
                                    💡 Bulk upload supported. Audio will be transcribed and analyzed to create test cases.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Processing */}
                    {activeTab === "processing" && (
                        <div className="space-y-6">
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4 animate-pulse">⚙️</div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Transcribing Audio Files
                                </h3>
                                <p className="text-gray-400">
                                    Processing {files.length} file(s)...
                                </p>
                            </div>

                            <div className="space-y-3">
                                {files.map((file, index) => (
                                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white text-sm font-medium">{file.name}</span>
                                            <Badge variant="warning">Processing</Badge>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div 
                                                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${(index + 1) / files.length * 100}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Transcribing with AI...
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                className="w-full" 
                                onClick={() => {
                                    // Simulate transcription completion
                                    setTranscriptions(files.map(file => ({
                                        file: file.name,
                                        transcript: "Sample transcription text...",
                                        duration: 120,
                                    })));
                                    setActiveTab("review");
                                }}
                            >
                                Simulate Completion (Dev)
                            </Button>
                        </div>
                    )}

                    {/* Tab 3: Review */}
                    {activeTab === "review" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">
                                    Review Transcriptions
                                </h3>
                                <Badge variant="success">{transcriptions.length} completed</Badge>
                            </div>

                            <div className="space-y-4">
                                {transcriptions.map((item, index) => (
                                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">🎵</div>
                                                <div>
                                                    <div className="text-white font-medium">{item.file}</div>
                                                    <div className="text-gray-400 text-sm">Duration: {item.duration}s</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedFile(index)}
                                                className="text-teal-400 hover:text-teal-300 text-sm"
                                            >
                                                Play ▶
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Transcript</label>
                                            <textarea
                                                value={item.transcript}
                                                onChange={(e) => {
                                                    const updated = [...transcriptions];
                                                    updated[index].transcript = e.target.value;
                                                    setTranscriptions(updated);
                                                }}
                                                rows={4}
                                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400 resize-none"
                                            />
                                        </div>

                                        <div className="mt-3">
                                            <label className="block text-sm text-gray-400 mb-2">Assign Persona</label>
                                            <select className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400">
                                                <option>Default Persona</option>
                                                <option>Persona 1</option>
                                                <option>Persona 2</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    {activeTab === "upload" && files.length > 0 && (
                        <Button onClick={() => setActiveTab("processing")}>
                            Start Processing
                        </Button>
                    )}
                    {activeTab === "review" && (
                        <Button onClick={handleFinalSubmit} disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add to Test Suite'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudioUploadModal;
