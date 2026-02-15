import { useState } from "react";

const CATEGORY_LABELS = {
  accuracy: "Accuracy",
  task_completion: "Task Completion",
  latency: "Latency",
  audio_quality: "Audio Quality",
  conversation_quality: "Conversation",
  endpointing: "Endpointing",
  persona: "Persona",
  pronunciation: "Pronunciation",
};

const titleize = (s) => {
  if (!s) return '';
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const normalizeScore = (raw) => {
  if (raw === undefined || raw === null) return 0;
  const n = Number(raw);
  if (isNaN(n)) return 0;
  return n <= 1 ? Math.round(n * 100) : Math.round(n);
};

const InsightTabs = ({ onChange, activeCategory, categoryScores = [], enabled = true, clickable = true }) => {
  // Prefer dynamic categories from `categoryScores`; fallback to fixed labels
  const items = (Array.isArray(categoryScores) && categoryScores.length > 0)
    ? categoryScores.map(c => ({ key: c.category || c.metric || c.id || 'unknown', label: titleize(c.category || c.metric || c.id || 'Unknown'), score: normalizeScore(c.score ?? c.value), raw: c }))
    : Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ key, label, score: 0, raw: null }));

  return (
    <div className="w-full grid grid-cols-8 gap-3">
      {items.map(({ key, label, score, raw }) => {
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
            onClick={() => clickable && onChange && onChange(key)}
            disabled={!clickable}
            className={`
              relative group rounded-xl transition-all flex flex-col items-center justify-center py-4
              ${isActive
                ? 'bg-teal-500/20 border-2 border-teal-500'
                : 'bg-gray-800'
              }
            `}
          >
            <div className="text-xs tracking-wide text-gray-400 mb-1">
              {label}
            </div>

            <div className={`text-xl font-semibold ${statusColor}`}>
              {score}%
            </div>

            {!isActive && enabled && clickable && (
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