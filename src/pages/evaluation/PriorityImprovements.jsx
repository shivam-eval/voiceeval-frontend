import React from "react";

const PRIORITY_STYLES = {
  high: {
    label: "High",
    dot: "bg-red-400",
    text: "text-red-400",
    bg: "bg-red-400/5",
    border: "border-red-400/20",
  },
  medium: {
    label: "Medium",
    dot: "bg-yellow-400",
    text: "text-yellow-400",
    bg: "bg-yellow-400/5",
    border: "border-yellow-400/20",
  },
  low: {
    label: "Low",
    dot: "bg-blue-400",
    text: "text-blue-400",
    bg: "bg-blue-400/5",
    border: "border-blue-400/20",
  },
};

const ImprovementsPanel = ({ improvements = [] }) => {
  if (!improvements.length) {
    return (
      <div className="bg-dark-panel border border-gray-800 rounded-xl p-6 text-center text-gray-400">
        No improvement recommendations available.
      </div>
    );
  }

  return (
    <div className="bg-dark-panel border border-gray-800 rounded-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">
          Improvement Recommendations
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Prioritized actions to improve evaluation outcomes
        </p>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-800">
        {improvements.map((item, idx) => {
          const style = PRIORITY_STYLES[item.priority || "low"];

          return (
            <div
              key={idx}
              className={`px-6 py-4 flex items-start gap-4 ${style.bg}`}
            >
              {/* Priority indicator */}
              <div className="flex flex-col items-center mt-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${style.dot}`}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${style.text}`}>
                    {style.label} priority
                  </span>
                </div>

                <p className="text-sm text-gray-200 leading-relaxed">
                  {item.message}
                </p>

                {item.metric && (
                  <p className="text-xs text-gray-500 mt-1">
                    Related metric: {item.metric}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImprovementsPanel;
