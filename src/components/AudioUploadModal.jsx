import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "./Button";
import Badge from "./Badge";
import { Upload, X, CheckCircle, AlertCircle, User } from "lucide-react";

const AudioUploadModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    mode = "calls",
    agents = [],
    defaultAgentId = ""
}) => {
    const [audioFiles, setAudioFiles] = useState([]);
    const [selectedAgentId, setSelectedAgentId] = useState(defaultAgentId);
    const [uploadResults, setUploadResults] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Auto-select first agent if none selected
    useEffect(() => {
        if (!selectedAgentId && agents.length > 0) {
            setSelectedAgentId(agents[0].value);
        }
    }, [agents, selectedAgentId]);

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const addAudioFiles = (files) => {
        const validFiles = files.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return ['wav', 'mp3', 'flac', 'ogg', 'm4a', 'aac', 'mp4'].includes(ext);
        });

        const newFiles = validFiles.map(file => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            status: 'pending'
        }));

        setAudioFiles(prev => [...prev, ...newFiles]);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        addAudioFiles(files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        addAudioFiles(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removeAudioFile = (fileId) => {
        setAudioFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        if (!selectedAgentId) {
            toast.error('Please select an agent');
            return;
        }

        if (audioFiles.length === 0) {
            toast.error('Please add at least one audio file');
            return;
        }

        // Close modal immediately and show progress toast
        onClose();
        toast.info("Uploading calls in background...");

        setIsUploading(true);
        // Trigger background processing
        Promise.resolve(onSubmit({
            files: audioFiles.map(f => f.file),
            agentId: selectedAgentId
        })).catch(error => {
            console.error('Upload error:', error);
            // Error typically handled by global interceptor
        }).finally(() => {
            setIsUploading(false);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Upload Call Recordings
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Upload audio files and select an agent for evaluation
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    <div className="space-y-6">
                        {/* Agent Selection - Required */}
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Select Agent
                                <span className="text-red-400">*</span>
                            </h3>
                            <div>
                                <select
                                    value={selectedAgentId}
                                    onChange={(e) => setSelectedAgentId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors"
                                    required
                                >
                                    {agents.map((agent) => (
                                        <option key={agent.value} value={agent.value}>
                                            {agent.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-xs text-gray-500">
                                    Calls will be uploaded to directory: <span className="text-teal-400 font-mono">{agents.find(a => a.value === selectedAgentId)?.name || 'agent_id'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Upload Part */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                                Audio Files
                            </h3>
                            <div
                                className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center hover:border-teal-500 transition-colors cursor-pointer bg-gray-800/30"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('audio-file-upload').click()}
                            >
                                <Upload className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                                <p className="text-white font-medium mb-2">
                                    Drag and drop audio files here
                                </p>
                                <p className="text-sm text-gray-400 mb-6">
                                    or click to browse (WAV, MP3, FLAC, M4A)
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept=".wav,.mp3,.flac,.ogg,.m4a,.aac,.mp4"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="audio-file-upload"
                                />
                                <Button variant="outline" type="button">
                                    Browse Files
                                </Button>
                            </div>
                        </div>

                        {/* Selected Files List */}
                        {audioFiles.length > 0 && (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                                    <h4 className="text-sm font-semibold text-white">
                                        Selected Files ({audioFiles.length})
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setAudioFiles([])}
                                        className="text-xs text-red-400 hover:text-red-300 font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-700 max-h-64 overflow-y-auto">
                                    {audioFiles.map((file) => (
                                        <div key={file.id} className="p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-teal-400 flex-shrink-0">
                                                    🎵
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeAudioFile(file.id);
                                                }}
                                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                            <div className="text-blue-400 text-lg">💡</div>
                            <p className="text-sm text-blue-400 leading-relaxed">
                                Bulk upload supported. Audio will be transcribed and automatically evaluated using the selected agent.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex items-center justify-end gap-3 bg-gray-900">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading || isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        loading={isLoading || isUploading}
                        disabled={audioFiles.length === 0 || !selectedAgentId || isLoading || isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload & Evaluate'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AudioUploadModal;
