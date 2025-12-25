import React, { useState } from "react";

const DUMMY_AUDIO_SEGMENTS = [
  { id: 1, color: "bg-green-400/70", width: "18%" },
  { id: 2, color: "bg-red-400/70", width: "24%" },
  { id: 3, color: "bg-green-400/70", width: "32%" },
  { id: 4, color: "bg-red-400/70", width: "12%" },
];

const DUMMY_TRANSCRIPT = [
  {
    speaker: "Main Agent",
    text: "Hi there. This is Alex from Tech Solutions Customer Support. How can I help you today?",
    time: "00:00",
    role: "agent",
  },
  {
    speaker: "Testing Agent",
    text: "Hello. I'm calling because I was double-charged for my TaskMaster Pro subscription and I need an immediate refund.",
    time: "00:07",
    role: "tester",
  },
  {
    speaker: "Main Agent",
    text: "I understand how frustrating that can be. I’ll help you sort this out right away. May I confirm your account email address?",
    time: "00:16",
    role: "agent",
  },
  {
    speaker: "Testing Agent",
    text: "Yes, it’s john.doe@email.com.",
    time: "00:32",
    role: "tester",
  },
];

const CallTranscriptPanel = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6 space-y-6">
      {/* Audio Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Call Audio
          </h3>

          <span className="text-xs text-gray-400">0:00 — 37:24</span>
        </div>

        {/* Fake waveform */}
        <div className="flex items-center gap-2 h-12 bg-dark-input rounded-lg px-3">
          {DUMMY_AUDIO_SEGMENTS.map((seg) => (
            <div
              key={seg.id}
              className={`h-full rounded-sm ${seg.color}`}
              style={{ width: seg.width }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-dark-input hover:bg-dark-input/80 border border-gray-700 rounded-md text-sm text-gray-300"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button className="px-3 py-1.5 bg-dark-input hover:bg-dark-input/80 border border-gray-700 rounded-md text-sm text-gray-300">
            Download
          </button>

          <span className="text-xs text-gray-400 ml-auto">1.25×</span>
        </div>
      </div>

      {/* Transcript */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Transcript
          </h3>

          <button className="text-xs text-teal-400 hover:text-teal-300">
            Copy
          </button>
        </div>

        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
          {DUMMY_TRANSCRIPT.map((item, index) => (
            <div
              key={index}
              className="flex gap-3 text-sm leading-relaxed"
            >
              {/* Time */}
              <span className="text-xs text-gray-500 w-10 shrink-0">
                {item.time}
              </span>

              {/* Content */}
              <div>
                <p
                  className={`font-semibold ${
                    item.role === "agent"
                      ? "text-teal-400"
                      : "text-purple-400"
                  }`}
                >
                  {item.speaker}
                </p>

                <p className="text-gray-300">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call end */}
        <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-gray-500" />
          Main agent ended call
        </div>
      </div>
    </div>
  );
};

export default CallTranscriptPanel;
