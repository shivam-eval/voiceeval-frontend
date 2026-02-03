import { Volume2 } from "lucide-react";

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
  return String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const normalizeScore = (score) => {
  if (typeof score !== "number") return 0;
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
};

/* =========================
   TRANSFORMER
========================= */

const extractGibberishMetrics = (response) => {
  if (!response || !Array.isArray(response.metric_results)) {
    return null;
  }

  const gibberishMetric = response.metric_results.find(
    m => m.metric_name === "gibberish_detection"
  );

  if (!gibberishMetric) return null;

  return {
    score: normalizeScore(gibberishMetric.score),
    hasGibberish: gibberishMetric.details?.has_gibberish || false,
    examples: gibberishMetric.details?.gibberish_examples || [],
    reasoning: gibberishMetric.details?.reasoning || "",
    status: gibberishMetric.status
  };
};

/* =========================
   DONUT CHART
========================= */

const GibberishDonut = ({ score, hasGibberish }) => {
  const radius = 90;
  const stroke = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const color = hasGibberish ? "#ef4444" : "#4EEAD7";
  const bgColor = hasGibberish ? "#7f1d1d" : "#0b2a33";

  return (
    <svg width="240" height="240" viewBox="0 0 240 240">
      <g transform="translate(120,120) rotate(-90)">
        {/* Background circle */}
        <circle
          r={radius}
          cx="0"
          cy="0"
          fill="transparent"
          stroke={bgColor}
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <circle
          r={radius}
          cx="0"
          cy="0"
          fill="transparent"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
        />
      </g>
      {/* Center text */}
      <text
        x="120"
        y="110"
        textAnchor="middle"
        className="text-4xl font-bold"
        fill="white"
      >
        {score}%
      </text>
      <text
        x="120"
        y="135"
        textAnchor="middle"
        className="text-sm"
        fill="#9ca3af"
      >
        Clear Speech
      </text>
    </svg>
  );
};

/* =========================
   STATUS BADGE
========================= */

const StatusBadge = ({ hasGibberish }) => {
  const config = hasGibberish
    ? {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/20",
        label: "Issues Detected"
      }
    : {
        bg: "bg-teal-500/10",
        text: "text-teal-400",
        border: "border-teal-500/20",
        label: "All Clear"
      };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.border} ${config.bg}`}>
      <div className={`w-2 h-2 rounded-full ${hasGibberish ? 'bg-red-400' : 'bg-teal-400'}`} />
      <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
    </div>
  );
};

/* =========================
   EXAMPLE CARD
========================= */

const ExampleCard = ({ example, index }) => (
  <div className="bg-[#0b2a33] border border-red-500/20 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs font-semibold text-red-400">{index + 1}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-300 leading-relaxed">{example}</p>
      </div>
    </div>
  </div>
);

/* =========================
   COMPONENT
========================= */

const GibberishDetection = ({ response }) => {
  console.log('=== GibberishDetection ===');
  console.log('Received response:', response);

  const data = extractGibberishMetrics(response);

  console.log('Extracted data:', data);

  if (!data) return null;

  return (
    <div className="bg-[#071a23] border border-teal-500/20 rounded-xl p-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Gibberish Detection</h3>
        </div>
        <StatusBadge hasGibberish={data.hasGibberish} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Donut Chart */}
        <div className="flex flex-col items-center">
          <GibberishDonut score={data.score} hasGibberish={data.hasGibberish} />
          
          <div className="mt-6 text-center max-w-sm">
            <p className="text-sm text-gray-400 leading-relaxed">
              {data.reasoning}
            </p>
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Analysis Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-teal-500/10">
                <span className="text-sm text-gray-400">Status</span>
                <span className={`text-sm font-semibold ${data.status === 'passed' ? 'text-teal-400' : 'text-red-400'}`}>
                  {data.status === 'passed' ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-teal-500/10">
                <span className="text-sm text-gray-400">Clarity Score</span>
                <span className="text-sm font-semibold text-white">{data.score}%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">Issues Found</span>
                <span className="text-sm font-semibold text-white">{data.examples.length}</span>
              </div>
            </div>
          </div>

          {data.examples.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Detected Issues</h4>
              <div className="space-y-3">
                {data.examples.map((example, i) => (
                  <ExampleCard key={i} example={example} index={i} />
                ))}
              </div>
            </div>
          )}

          {data.examples.length === 0 && (
            <div className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-6 text-center">
              <p className="text-sm text-teal-400">
                No gibberish or unintelligible speech detected in the audio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GibberishDetection;
