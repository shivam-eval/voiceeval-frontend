import React, { useState } from "react";
import { Play, Pause, Download, Copy, User, Bot } from "lucide-react";

const CallTranscriptPanel = ({ transcriptData }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = transcriptData?.steps || [];
  const metadata = transcriptData?.metadata || {};

  const formatTime = (ms) => {
    if (!ms) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (ms) => {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const copyTranscript = () => {
    const text = steps.map((step, index) => {
      const ts = step.speech_start_ms != null ? formatTime(step.speech_start_ms) : formatTime(0);
      return `[${ts}] ${step.turn_role === 'agent' ? 'Agent' : 'User'}: ${step.text || ''}`;
    }).join('\n');
    navigator.clipboard.writeText(text);
  };

  // Generate waveform segments from steps (use equal width when duration_ms missing)
  const generateWaveform = () => {
    if (steps.length === 0) return [];
    const totalDuration = metadata.duration_ms || 1;
    const hasDurations = steps.some(s => s.duration_ms != null);
    const equalWidth = 100 / steps.length;
    return steps.map((step, index) => ({
      id: index,
      color: step.turn_role === 'agent' ? 'bg-purple-400/70' : 'bg-blue-400/70',
      width: hasDurations && step.duration_ms != null ? `${(step.duration_ms / totalDuration) * 100}%` : `${equalWidth}%`
    }));
  };

  const waveformSegments = generateWaveform();

  return (
    <div className="bg-dark-panel border border-gray-800/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800/50 bg-dark-panel/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            TRANSCRIPT
          </h3>
          <button 
            onClick={copyTranscript}
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">

        {/* Transcript Messages */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {steps.map((step, index) => {
            const isAgent = step.turn_role === 'agent';
            const timestamp = formatTime(step.speech_start_ms);
            
            return (
              <div
                key={step.turn_id || index}
                className="flex gap-3 group"
              >
                {/* Timestamp */}
                <div className="text-xs text-gray-500 font-mono w-20 shrink-0 pt-1">
                  {step.speech_start_ms != null ? timestamp : `Turn ${step.turn_number}`}
                </div>

                {/* Avatar */}
                <div className="shrink-0">
                  {isAgent ? (
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${
                      isAgent ? "text-purple-400" : "text-blue-400"
                    }`}>
                      {isAgent ? "Agent" : "User"}
                    </span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500">Turn {step.turn_number}</span>
                  </div>
                  
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {step.text || <span className="text-gray-500 italic">No transcript available</span>}
                  </p>
                  
                  <div className="mt-1.5 text-xs text-gray-500">
                    {step.duration_ms ? `${(step.duration_ms / 1000).toFixed(1)}s` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {steps.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No transcript available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {steps.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-800/50 bg-dark-panel/30">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-500" />
            Call ended • {metadata.total_turns || 0} turns • {formatDuration(metadata.duration_ms)}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallTranscriptPanel;
