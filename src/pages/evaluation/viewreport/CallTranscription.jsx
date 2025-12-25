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
    const text = steps.map(step => 
      `[${formatTime(step.speech_start_ms)}] ${step.turn_role === 'agent' ? 'Agent' : 'User'}: ${step.text}`
    ).join('\n');
    navigator.clipboard.writeText(text);
  };

  // Generate waveform segments from steps
  const generateWaveform = () => {
    if (steps.length === 0) return [];
    
    const totalDuration = metadata.duration_ms || 1;
    return steps.map((step, index) => ({
      id: index,
      color: step.turn_role === 'agent' ? 'bg-purple-400/70' : 'bg-blue-400/70',
      width: `${(step.duration_ms / totalDuration) * 100}%`
    }));
  };

  const waveformSegments = generateWaveform();

  return (
    <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6 space-y-6">
      {/* Audio Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-2">
            <Play className="w-4 h-4 text-teal-400" />
            Call Audio
          </h3>

          <span className="text-xs text-gray-400 font-mono">
            0:00 — {formatDuration(metadata.duration_ms)}
          </span>
        </div>

        {/* Waveform */}
        <div className="flex items-center gap-1 h-16 bg-dark-input rounded-lg px-3 overflow-hidden">
          {waveformSegments.length > 0 ? (
            waveformSegments.map((seg) => (
              <div
                key={seg.id}
                className={`h-full rounded-sm ${seg.color} transition-all hover:opacity-80`}
                style={{ width: seg.width }}
                title={`Turn ${seg.id + 1}`}
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              No audio data available
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-lg text-sm text-teal-400 font-medium flex items-center gap-2 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </button>

          <button className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 rounded-lg text-sm text-gray-300 flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" />
            Download
          </button>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500">Speed:</span>
            <select className="bg-dark-input border border-gray-700 rounded px-2 py-1 text-xs text-gray-300">
              <option>0.5×</option>
              <option>0.75×</option>
              <option selected>1.0×</option>
              <option>1.25×</option>
              <option>1.5×</option>
              <option>2.0×</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-2">
            <Bot className="w-4 h-4 text-teal-400" />
            Transcript
          </h3>

          <button 
            onClick={copyTranscript}
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {steps.map((step, index) => (
            <div
              key={step.turn_id || index}
              className="flex gap-4 text-sm leading-relaxed hover:bg-dark-input/30 p-3 rounded-lg transition-colors"
            >
              {/* Time */}
              <span className="text-xs text-gray-500 font-mono w-12 shrink-0 pt-0.5">
                {formatTime(step.speech_start_ms)}
              </span>

              {/* Icon */}
              <div className="shrink-0 pt-0.5">
                {step.turn_role === 'agent' ? (
                  <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p
                  className={`font-semibold text-xs mb-1 ${
                    step.turn_role === "agent"
                      ? "text-purple-400"
                      : "text-blue-400"
                  }`}
                >
                  {step.turn_role === "agent" ? "Agent" : "User"} • Turn {step.turn_number}
                </p>

                <p className="text-gray-300 leading-relaxed">
                  {step.text || <span className="text-gray-500 italic">No transcript available</span>}
                </p>

                {/* Duration badge */}
                <span className="inline-block mt-2 text-xs text-gray-500 font-mono">
                  {(step.duration_ms / 1000).toFixed(2)}s
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {steps.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No transcript available</p>
          </div>
        )}

        {/* Call end indicator */}
        {steps.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-800/50 text-xs text-gray-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-500" />
            Call ended • {metadata.total_turns || 0} turns • {formatDuration(metadata.duration_ms)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallTranscriptPanel;
