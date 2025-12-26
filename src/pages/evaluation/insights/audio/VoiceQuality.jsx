import { Waves } from "lucide-react";

const METRICS = [
  { label: "Word Error Rate", value: 0 },
  { label: "Audio Technical Quality", value: 100 },
  { label: "Tts Naturalness", value: 88 },
];

const VoiceQualityConsistency = () => {
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
        {METRICS.map((metric, idx) => (
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
                className="h-full bg-teal-400 rounded-full"
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
