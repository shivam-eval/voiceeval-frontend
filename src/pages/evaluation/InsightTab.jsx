const CATEGORY_LABELS = {
  accuracy: "Accuracy",
  task_completion: "Task Completion",
  latency: "Latency",
  audio: "Audio",
  conversation: "Conversation",
  endpointing: "Endpointing",
  cost: "Cost",
  persona: "Persona",
};

const InsightTabs = ({  onChange, categoryScores = [] }) => {
  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
        const score = categoryScores.find(c => c.category === key)?.score ?? 0;

        const statusColor =
          score >= 85
            ? "text-emerald-400"
            : score >= 70
            ? "text-yellow-400"
            : "text-red-400";

    

        return (
       <button
  key={key}
  onClick={() => onChange(key)}
  className=
    "relative group rounded-xl bg-dark-panel transition-all flex flex-col items-center justify-center  py-4">

  {/* Label */}
  <div className="text-xs tracking-wide text-gray-400 mb-1">
    {label}
  </div>

  {/* Score */}
  <div
    className={`
      text-xl font-semibold
      ${statusColor}
    `}
  >
    {score}%
  </div>

  {/* Hover overlay */}
  <div
    className="
      absolute inset-0 flex items-center justify-center
      bg-black/60 opacity-0 group-hover:opacity-100
      transition-opacity rounded-xl
    "
  >
    <span className="text-teal-300 text-sm font-medium">
      View details →
    </span>
  </div>
</button>

        );
      })}
    </div>
  );
};

export default InsightTabs;
