import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Copy, User, Bot, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import AudioPlayer from "../../../components/AudioPlayer";

// Mini audio player for individual steps
const MiniAudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Step audio playback failed:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-black/40 border border-gray-800/60">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-9 h-9 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 flex items-center justify-center text-teal-400 transition-all transform active:scale-95 flex-shrink-0 border border-teal-500/20"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={(e) => {
            const time = Number(e.target.value);
            setCurrentTime(time);
            if (audioRef.current) {
              audioRef.current.currentTime = time;
            }
          }}
          className="w-full h-1 bg-gray-800/80 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-3 
            [&::-webkit-slider-thumb]:h-3 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-teal-400 
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-teal-500/50
            [&::-webkit-slider-thumb]:cursor-pointer 
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-teal-300
            [&::-moz-range-thumb]:w-3 
            [&::-moz-range-thumb]:h-3 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-teal-400
            [&::-moz-range-thumb]:border-0"
          style={{
            background: `linear-gradient(to right, #14b8a6 ${duration ? (currentTime / duration) * 100 : 0}%, #1f2937 0%)`,
          }}
        />

        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

const CallTranscriptPanel = ({ transcriptData, callRecordingUrl, isUploaded }) => {
  // Debug logging
  useEffect(() => {
    console.log('CallTranscriptPanel received transcriptData:', transcriptData);
    console.log('CallTranscriptPanel received callRecordingUrl:', callRecordingUrl);
    console.log('CallTranscriptPanel isUploaded:', isUploaded);
    if (transcriptData) {
      console.log('Steps:', transcriptData.steps);
      console.log('Metadata:', transcriptData.metadata);
    }
  }, [transcriptData, callRecordingUrl, isUploaded]);

  const steps = transcriptData?.steps || [];
  const metadata = transcriptData?.metadata || {};
  const audioFiles = metadata?.audio_files || [];

  const [activeTurnIndex, setActiveTurnIndex] = useState(-1);
  const audioPlayerRef = useRef(null);
  const transcriptContainerRef = useRef(null);
  const turnRefs = useRef([]);
  const timestampRefs = useRef([]);
  const timestampContainerRef = useRef(null);

  // Sync turn refs with steps length
  useEffect(() => {
    turnRefs.current = turnRefs.current.slice(0, steps.length);
    timestampRefs.current = timestampRefs.current.slice(0, steps.length);
  }, [steps]);

  // Create a map of step numbers to audio URLs
  const stepAudioMap = {};
  audioFiles.forEach(file => {
    const match = file.filename?.match(/_step_(\d+)\.wav$/);
    if (match) {
      const stepNum = parseInt(match[1], 10);
      stepAudioMap[stepNum] = file.url;
    }
  });

  useEffect(() => {
    console.log('Step Audio Map:', stepAudioMap);
    console.log('Audio Files:', audioFiles);
  }, [audioFiles]);

  const formatTime = (ms) => {
    if (!ms && ms !== 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (ms) => {
    if (!ms && ms !== 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const copyTranscript = () => {
    if (steps.length === 0) return;

    const text = steps.map(step =>
      `[${formatTime(step.speech_start_ms)}] ${step.turn_role === 'agent' ? 'Agent' : (isUploaded ? 'User' : 'Simulator')}: ${step.text || '(no text)'}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      toast.success('Transcript copied to clipboard');
    }).catch(err => {
      toast.error('Failed to copy transcript: ' + (err.message || 'Unknown error'));
    });
  };

  const handleTimeUpdate = (currentTime) => {
    const timeMs = currentTime * 1000;

    const index = steps.findIndex((step, i) => {
      const start = step.speech_start_ms || step.start_time_ms || 0;
      const duration = step.duration_ms || step.duration || 0;
      const end = start + duration;

      if (duration === 0) {
        const nextStep = steps[i + 1];
        const nextStart = nextStep?.speech_start_ms || nextStep?.start_time_ms || Infinity;
        return timeMs >= start && timeMs < nextStart;
      }

      return timeMs >= start && timeMs < end;
    });

    if (index !== activeTurnIndex) {
      setActiveTurnIndex(index);
    }
  };

  const handleTurnClick = (step, index) => {
    const startMs = step.speech_start_ms || step.start_time_ms || 0;
    if (audioPlayerRef.current) {
      audioPlayerRef.current.seek(startMs / 1000);
      audioPlayerRef.current.play();
    }
    setActiveTurnIndex(index);
  };

  const handleTimestampClick = (index) => {
    const step = steps[index];
    handleTurnClick(step, index);
  };

  // Auto-scroll logic - scroll timestamp bar and transcript area
  // Auto-scroll logic - scroll timestamp bar and transcript area
  useEffect(() => {
    if (activeTurnIndex !== -1) {
      requestAnimationFrame(() => {
        // Scroll timestamp navigation bar
        if (timestampRefs.current[activeTurnIndex] && timestampContainerRef.current) {
          const container = timestampContainerRef.current;
          const button = timestampRefs.current[activeTurnIndex];

          // Calculate position to scroll the active timestamp to the left
          const containerRect = container.getBoundingClientRect();
          const buttonRect = button.getBoundingClientRect();
          const scrollLeft = container.scrollLeft;

          // Calculate target scroll to bring button to the start of container
          // Add a small offset (e.g., 4px) to avoid being exactly at the edge
          const targetScroll = scrollLeft + (buttonRect.left - containerRect.left);

          container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
          });
        }

        // Scroll transcript to bring active card to top
        if (turnRefs.current[activeTurnIndex] && transcriptContainerRef.current) {
          const container = transcriptContainerRef.current;
          const element = turnRefs.current[activeTurnIndex];

          container.scrollTo({
            top: element.offsetTop - 16, // Small offset for top padding
            behavior: 'smooth'
          });
        }
      });
    }
  }, [activeTurnIndex]);

  // If transcriptData is null/undefined
  if (!transcriptData) {
    return (
      <div className="flex flex-col h-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-[#0a0e16] border border-gray-800/60 rounded-xl p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-100 tracking-tight">TRANSCRIPT</h2>
        </div>

        {/* Empty State Card */}
        <div className="flex-1 bg-[#0a0e16] border border-gray-800/60 rounded-xl p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-800/30 border border-gray-800/60 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-400 mb-1">No transcript data provided</h3>
                <p className="text-sm text-gray-600">The transcript data is null or undefined</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header Card - Always visible at top */}
      <div className="sticky top-0 z-10 bg-[#0a0e16] border border-gray-800/60 rounded-xl mb-4 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-100 tracking-tight">TRANSCRIPT</h2>
              {steps.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-medium text-teal-400">
                  {steps.length} {steps.length === 1 ? 'turn' : 'turns'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {steps.length > 0 && (
                <button
                  onClick={copyTranscript}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 border border-gray-800/60 text-gray-300 text-sm font-medium transition-all active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              )}

              {callRecordingUrl && (
                <a
                  href={callRecordingUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-sm font-medium transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              )}
            </div>
          </div>

          {/* Audio Player - Stays in sticky header */}
          {callRecordingUrl && (
            <div className="p-4 rounded-lg bg-black/40 border border-gray-800/60">
              <AudioPlayer
                ref={audioPlayerRef}
                audioUrl={callRecordingUrl}
                label="Full Call Recording"
                onTimeUpdate={handleTimeUpdate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Timestamp Navigation Bar - Separate scrollable div */}
      {steps.length > 0 && (
        <div className="bg-[#0a0e16] border border-gray-800/60 rounded-xl p-4 mb-4">
          <div
            ref={timestampContainerRef}
            className="flex items-center gap-2 overflow-x-auto custom-scrollbar-horizontal pb-2"
          >
            {steps.map((step, index) => {
              const isAgent = step.turn_role === 'agent';
              const timestamp = formatTime(step.speech_start_ms || step.start_time_ms || 0);
              const isActive = index === activeTurnIndex;

              return (
                <button
                  key={index}
                  ref={el => timestampRefs.current[index] = el}
                  onClick={() => handleTimestampClick(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${isActive
                    ? "bg-teal-500/20 border-teal-500/40 text-teal-400 ring-1 ring-teal-500/30"
                    : "bg-gray-800/40 border-gray-800/60 text-gray-400 hover:bg-gray-800/60 hover:border-gray-700/60"
                    } border`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono">{timestamp}</span>
                  <span className="text-xs">•</span>
                  <span className={`text-xs font-medium ${isActive ? 'text-teal-300' : isAgent ? 'text-teal-400/60' : 'text-blue-400/60'}`}>
                    {isAgent ? 'Agent' : 'User'} {step.step_number || index + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable Transcript Messages */}
      <div
        ref={transcriptContainerRef}
        className="max-h-[600px] overflow-y-auto space-y-3 custom-scrollbar pr-1 relative"
      >
        {steps.length > 0 ? (
          <>
            {steps.map((step, index) => {
              const isAgent = step.turn_role === 'agent';
              const timestamp = formatTime(step.speech_start_ms || step.start_time_ms || 0);
              const isActive = index === activeTurnIndex;

              return (
                <div
                  key={index}
                  ref={el => turnRefs.current[index] = el}
                  className={`bg-[#0a0e16] border rounded-xl p-5 cursor-pointer transition-all ${isActive
                    ? "border-teal-500/40 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/20"
                    : "border-gray-800/60 hover:border-gray-700/60 hover:bg-[#0d1219]"
                    }`}
                  onClick={() => handleTurnClick(step, index)}
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {isAgent ? (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 border border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/10">
                          <Bot className="w-5 h-5 text-teal-400" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
                          <User className="w-5 h-5 text-blue-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-semibold ${isAgent ? 'text-teal-400' : 'text-blue-400'}`}>
                            {isAgent ? "Agent" : (isUploaded ? "User" : "Simulator")}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-xs text-gray-500 font-medium">
                            Step {step.step_number || index + 1}
                          </span>
                          {(step.duration_ms || step.duration) && (
                            <>
                              <span className="text-gray-600">•</span>
                              <span className="text-xs text-gray-500 font-mono">
                                {((step.duration_ms || step.duration) / 1000).toFixed(1)}s
                              </span>
                            </>
                          )}
                        </div>

                        {/* Timestamp Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-gray-800/60">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs font-mono text-gray-400">{timestamp}</span>
                        </div>
                      </div>

                      {/* Message Text */}
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-2">
                        {step.text || step.content || step.transcript || (
                          <span className="text-gray-600 italic">No transcript text</span>
                        )}
                      </p>

                      {/* Step Audio Player */}
                      {stepAudioMap[step.step_number] && (
                        <MiniAudioPlayer audioUrl={stepAudioMap[step.step_number]} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          /* Empty state card */
          <div className="bg-[#0a0e16] border border-gray-800/60 rounded-xl p-8">
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-800/30 border border-gray-800/60 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-400 mb-1">No transcript available</h3>
                  <p className="text-sm text-gray-600">
                    {transcriptData ? 'The transcript steps array is empty' : 'No transcript data provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Card */}
      {steps.length > 0 && (
        <div className="mt-4 bg-[#0a0e16] border border-gray-800/60 rounded-xl px-6 py-4">
          <p className="text-sm text-gray-500 text-center font-medium">
            Call ended • {metadata.total_turns || steps.length} turns • {formatDuration(metadata.duration_ms || 0)}
          </p>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
      `}</style>
    </div>
  );
};

export default CallTranscriptPanel;