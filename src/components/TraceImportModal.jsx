import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { X, Upload, Loader2, FileAudio, Search, User } from "lucide-react";

const TraceImportModal = ({ isOpen, onClose, agentId, agents = [], onSubmit, isLoading: externalLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [callId, setCallId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(agentId || "");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && agentId) {
      setSelectedAgentId(agentId);
    }
  }, [isOpen, agentId]);

  useEffect(() => {
    if (!selectedAgentId && agents.length > 0 && !agentId) {
      setSelectedAgentId(agents[0].value);
    }
  }, [agents, selectedAgentId, agentId]);

  const extractCallId = (filename) => {
    // Browser sanitizes "/" to ":" in filenames, so handle both separators
    let name = filename;
    if (name.startsWith("audio/") || name.startsWith("audio:")) {
      name = name.slice(6);
    }
    // Remove file extension
    const lastDot = name.lastIndexOf(".");
    if (lastDot > 0) {
      name = name.substring(0, lastDot);
    }
    return name;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const extracted = extractCallId(file.name);
      setCallId(extracted);
    }
  };

  const handleSubmit = async () => {
    if (!callId.trim()) {
      toast.error("No call ID extracted. Please select a valid audio file.");
      return;
    }

    if (!selectedAgentId) {
      toast.error("Please select an agent.");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select an audio file.");
      return;
    }

    // Close modal immediately and show progress toast
    handleClose();
    toast.info("Uploading audio with Langfuse trace detection...");

    setIsUploading(true);
    try {
      await onSubmit({
        files: [selectedFile],
        agentId: selectedAgentId,
      });
    } catch (error) {
      console.error("Trace import upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCallId("");
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const isSubmitting = isUploading || externalLoading;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Import Audio with Trace</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload an audio file — Langfuse trace will be detected from the filename
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* File Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Audio File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500/50 transition"
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileAudio className="w-6 h-6 text-blue-400" />
                    <span className="text-sm text-white font-medium truncate max-w-[250px]">
                      {selectedFile.name}
                    </span>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Click to select an audio file</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Filename format: audio/&lt;callid&gt;.ext
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Extracted Call ID */}
            {callId && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Detected Call ID
                </label>
                <input
                  type="text"
                  value={callId}
                  onChange={(e) => setCallId(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2.5
                             text-white text-sm font-mono focus:outline-none focus:border-blue-500
                             transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The backend will search Langfuse for a trace matching this call ID
                </p>
              </div>
            )}

            {/* Agent Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Agent <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2.5
                           text-white text-sm focus:outline-none focus:border-blue-500 transition"
              >
                {agents.length === 0 && (
                  <option value="">No agents available</option>
                )}
                {agents.map((agent) => (
                  <option key={agent.value} value={agent.value}>
                    {agent.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Info Banner */}
            {callId && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-400 leading-relaxed">
                The audio file will be uploaded and the backend will automatically search Langfuse for a matching trace based on the call ID in the filename. If found, the trace transcript and system prompt will be used for evaluation.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400
                         hover:bg-gray-800 transition text-sm font-medium
                         disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!callId.trim() || !selectedAgentId || isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                         bg-blue-500/20 border border-blue-500/40 text-blue-400
                         hover:bg-blue-500/30 transition text-sm font-bold
                         disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload & Evaluate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TraceImportModal;
