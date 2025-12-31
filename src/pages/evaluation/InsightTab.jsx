import { useState } from "react";

const CATEGORY_LABELS = {
  accuracy: "Accuracy",
  task_completion: "Task Completion",
  latency: "Latency",
  audio_quality: "Audio Quality",
  conversation_quality: "Conversation",
  endpointing: "Endpointing",
  persona: "Persona",
};

const InsightTabs = ({ onChange, activeCategory, categoryScores = [] }) => {
  return (
    <div className="w-full grid grid-cols-7 gap-3">
      {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
        const scoreData = categoryScores.find(c => c.category === key);
        const score = scoreData?.score ?? 0;

        const statusColor =
          score >= 85
            ? "text-emerald-400"
            : score >= 70
            ? "text-yellow-400"
            : "text-red-400";

        const isActive = activeCategory === key;

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`
              relative group rounded-xl transition-all flex flex-col items-center justify-center py-4
              ${isActive 
                ? 'bg-teal-500/20 border-2 border-teal-500' 
                : 'bg-gray-800 hover:bg-gray-700'
              }
            `}
          >
            {/* Label */}
            <div className="text-xs tracking-wide text-gray-400 mb-1">
              {label}
            </div>

            {/* Score */}
            <div className={`text-xl font-semibold ${statusColor}`}>
              {score}%
            </div>

            {/* Weight indicator (if non-zero) */}
            {/* {scoreData?.weight > 0 && (
              <div className="text-[10px] text-gray-500 mt-1">
                Weight: {Math.round(scoreData.weight * 100)}%
              </div>
            )} */}

            {/* Hover overlay */}
            {!isActive && (
              <div className="
                absolute inset-0 flex items-center justify-center
                bg-black/60 opacity-0 group-hover:opacity-100
                transition-opacity rounded-xl
              ">
                <span className="text-teal-300 text-sm font-medium">
                  View details →
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default InsightTabs;