import { Waves } from "lucide-react";

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  // Use the name directly if it's already humanized (contains spaces and starts with uppercase)
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
  
  // No hardcoded map - just transform the snake_case name to Title Case
  return String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const VoiceQualityConsistency = ({ response }) => {
  // Extract metrics from response
  const metrics = response?.metrics?.map(m => ({
    label: humanizeMetricName(m.name),
    value: m.score !== null && m.score !== undefined
      ? Math.round(m.score * 100)
      : 100 // Default to 100 for null scores
  })) || [];

  // Fallback to default if no data
  if (metrics.length === 0) {
    return (
      <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Waves className="text-teal-400" size={18} />
          <h3 className="text-lg font-semibold text-white">
            Voice Quality Consistency
          </h3>
        </div>
        <p className="text-gray-400 text-sm">No voice quality data available</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Waves className="text-teal-400" size={18} />
        <h3 className="text-lg font-semibold text-white">
          Voice Quality Consistency
        </h3>
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-2">
              <span className="text-white text-sm">
                {metric.label}
              </span>
              <span className="text-teal-400 text-sm font-medium">
                {metric.value}%
              </span>
            </div>

            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceQualityConsistency;