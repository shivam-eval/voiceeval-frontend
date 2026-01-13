import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Copy, User, Bot, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

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
    <div className="flex items-center gap-2 mt-2 bg-dark-input/30 border border-gray-700/30 rounded-lg p-2">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-7 h-7 rounded-full bg-teal-500/20 hover:bg-teal-500/30 flex items-center justify-center text-teal-400 transition-all transform active:scale-95 flex-shrink-0"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      <span className="text-[10px] font-mono text-gray-500 flex-shrink-0 w-10 text-right">
        {formatTime(currentTime)}
      </span>
    </div>
  );
};


const CallTranscriptPanel = ({ transcriptData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('CallTranscriptPanel received transcriptData:', transcriptData);
    if (transcriptData) {
      console.log('Steps:', transcriptData.steps);
      console.log('Metadata:', transcriptData.metadata);
    }
  }, [transcriptData]);

  const steps = transcriptData?.steps || [];
  const metadata = transcriptData?.metadata || {};
  const audioFiles = metadata?.audio_files || [];
  // Hardcoded URL for testing
  const callRecordingUrl = "https://storage.googleapis.com/voiceeval-public/recordings/sess_2d5d869bb8fe4ec6b662607ebae2c0a5/call_recording.wav";

  // Create a map of step numbers to audio URLs
  const stepAudioMap = {};
  audioFiles.forEach(file => {
    // Extract step number from filename pattern: *_step_N.wav
    const match = file.filename?.match(/_step_(\d+)\.wav$/);
    if (match) {
      const stepNum = parseInt(match[1], 10);
      stepAudioMap[stepNum] = file.url;
    }
  });

  // Debug logging for audio mapping
  useEffect(() => {
    console.log('Step Audio Map:', stepAudioMap);
    console.log('Audio Files:', audioFiles);
  }, [audioFiles]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Playback failed:", err);
          toast.error("Audio playback failed. Please check the recording URL.");
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

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

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

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
      `[${formatTime(step.speech_start_ms)}] ${step.turn_role === 'agent' ? 'Agent' : 'Simulator'}: ${step.text || '(no text)'}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      toast.success('Transcript copied to clipboard');
    }).catch(err => {
      toast.error('Failed to copy transcript: ' + (err.message || 'Unknown error'));
    });
  };

  // If transcriptData is null/undefined
  if (!transcriptData) {
    return (
      <div className="bg-dark-panel border border-gray-800/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800/50 bg-dark-panel/50">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            TRANSCRIPT
          </h3>
        </div>
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No transcript data provided</p>
          <p className="text-gray-600 text-xs mt-1">The transcript data is null or undefined</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-panel border border-gray-800/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800/50 bg-dark-panel/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            TRANSCRIPT
            {steps.length > 0 && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                ({steps.length} {steps.length === 1 ? 'turn' : 'turns'})
              </span>
            )}
          </h3>
          <div className="flex items-center gap-3">
            {steps.length > 0 && (
              <button
                onClick={copyTranscript}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors px-2 py-1 rounded hover:bg-teal-400/10"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            )}
            {callRecordingUrl && (
              <a
                href={callRecordingUrl}
                download
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors px-2 py-1 rounded hover:bg-teal-400/10"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            )}
          </div>
        </div>

        {/* Audio Player */}
        {callRecordingUrl ? (
          <div className="bg-dark-input/50 border border-gray-700/50 rounded-lg p-3 flex items-center gap-4">
            <audio
              ref={audioRef}
              src={callRecordingUrl}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-teal-500 hover:bg-teal-400 flex items-center justify-center text-white transition-all transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                <span>{formatTime(currentTime * 1000)}</span>
                <span>{formatTime(duration * 1000)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 group relative">
              <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        ) : (
          <div className="bg-dark-input/30 border border-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 italic">No recording available for this session</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Transcript Messages */}
        {steps.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {steps.map((step, index) => {
              const isAgent = step.turn_role === 'agent';
              const timestamp = formatTime(step.speech_start_ms || step.start_time_ms || 0);

              return (
                <div
                  key={step.step_number || step.id || index}
                  className="flex gap-3 group"
                >
                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 font-mono w-20 shrink-0 pt-1">
                    {timestamp}
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
                      <span className={`text-sm font-semibold ${isAgent ? "text-purple-400" : "text-blue-400"
                        }`}>
                        {isAgent ? "Agent" : "Simulator"}
                      </span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">
                        Step {step.step_number || index + 1}
                      </span>
                    </div>

                    <p className="text-gray-200 text-sm leading-relaxed">
                      {step.text || step.content || step.transcript || (
                        <span className="text-gray-500 italic">No transcript text</span>
                      )}
                    </p>

                    {(step.duration_ms || step.duration) && (
                      <div className="mt-1.5 text-xs text-gray-500">
                        {((step.duration_ms || step.duration) / 1000).toFixed(1)}s
                      </div>
                    )}

                    {/* Step Audio Player */}
                    {stepAudioMap[step.step_number] && (
                      <MiniAudioPlayer audioUrl={stepAudioMap[step.step_number]} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No transcript available</p>
            <p className="text-gray-600 text-xs mt-1">
              {transcriptData ? 'The transcript steps array is empty' : 'No transcript data provided'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {steps.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-800/50 bg-dark-panel/30">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-500" />
            Call ended • {metadata.total_turns || steps.length} turns • {formatDuration(metadata.duration_ms || 0)}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallTranscriptPanel;