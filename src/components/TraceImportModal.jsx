import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { X, Upload, Loader2, FileAudio, Download } from "lucide-react";
import observabilityService from "../api/services/observability.service";

const TraceImportModal = ({ isOpen, onClose, agentId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [callId, setCallId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const extractCallId = (filename) => {
    // Strip "audio/" prefix if present, then strip file extension
    let name = filename;
    if (name.startsWith("audio/")) {
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

    setIsLoading(true);
    try {
      const traceData = await observabilityService.searchTraceByCallId(callId.trim());

      // Trigger browser download of the trace JSON
      const blob = new Blob([JSON.stringify(traceData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trace-${callId.trim()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Trace downloaded successfully!");
      handleClose();
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("No trace found for this call ID.");
      } else {
        toast.error(`Failed to fetch trace: ${error.response?.data?.detail || error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCallId("");
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

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
              <Download className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Import Audio Trace</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload an audio file to search for its Langfuse trace
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
                  Extracted Call ID
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
                  Edit if the extracted ID is incorrect
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400
                         hover:bg-gray-800 transition text-sm font-medium
                         disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!callId.trim() || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                         bg-blue-500/20 border border-blue-500/40 text-blue-400
                         hover:bg-blue-500/30 transition text-sm font-bold
                         disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Search & Download Trace
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
