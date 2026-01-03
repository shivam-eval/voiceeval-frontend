import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import StatCard from "../../../../components/StatCard";
import TaskCompletionDistribution from "./TaskCompletion";
import DetailedValidationSection from "./DetailedValidationSection";

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  const map = {
    task_completion_rate: "Task Completion",
    sequential_task_accuracy: "Sequential Accuracy",
    step_validation_pass_rate: "Step Validation",
    flow_path_coverage: "Flow Coverage",
  };
  return map[name] || name;
};

/* =========================
   TRANSFORMERS
========================= */

const normalizeMetricScore = (score) => {
  if (typeof score !== "number") return 0;
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
};

const transformStatCards = (response) => {
  if (!response || !Array.isArray(response.metrics)) return [];

  // Define priority metrics to display (only 3)
  const priorityMetrics = [
    'task_completion_rate',
    'sequential_task_accuracy',
    'step_validation_pass_rate'
  ];

  // Filter to only include priority metrics and map them
  return response.metrics
    .filter(m => priorityMetrics.includes(m.name))
    .map((m) => ({
      title: humanizeMetricName(m.name),
      value: normalizeMetricScore(m.score),
      passed: m.status === "passed",
    }))
    .slice(0, 3); // Ensure max 3 cards
};

/* =========================
   COMPONENT
========================= */

const TaskCompletionOverview = ({ response, data, onBack }) => {
  // Handle both single evaluation (response) and aggregated data (data)
  let metrics = [];
  let score = 0;

  if (response) {
    // Called from ViewReport with single evaluation's category data
    metrics = response?.metrics || [];
    score = typeof response.score === "number" ? Math.round(response.score * 100) : 0;
  } else if (data) {
    // Called from Dashboard with aggregated data
    const taskCategory = data.category_scores?.find(c => c.category === 'task_completion');
    if (taskCategory) {
      metrics = taskCategory.metrics || [];
      score = typeof taskCategory.average_score === "number"
        ? Math.round(taskCategory.average_score * 100)
        : 0;
    } else {
      // Fallback: aggregate from all evaluations
      const allMetrics = [];
      let totalScore = 0;
      let scoreCount = 0;

      data.evaluations?.forEach(evaluation => {
        const taskCat = evaluation.category_scores?.find(c => c.category === 'task_completion');
        if (taskCat?.metrics) {
          allMetrics.push(...taskCat.metrics);
          if (typeof taskCat.score === 'number') {
            totalScore += taskCat.score;
            scoreCount++;
          }
        }
      });

      metrics = allMetrics;
      score = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 100) : 0;
    }
  }

  if (!metrics || metrics.length === 0) return null;

  /* -------------------------
     DERIVED VALUES
  ------------------------- */

  const passedCount = metrics.filter(
    (m) => m.status === "passed"
  ).length;

  const failedCount = metrics.filter(
    (m) => m.status === "failed"
  ).length;

  const statCards = transformStatCards({ metrics });

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
      )}

      {/* ================= HEADER CARD ================= */}
      <div className="bg-[#0b1f26] border border-teal-500/40 rounded-xl p-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-xl bg-teal-500/20 text-teal-400">
            <CheckCircle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Task Completion
            </h2>
            <p className="text-gray-400 mt-1">
              Tracks successful task and flow completion rates
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          {/* Ring */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-teal-900"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={
                  2 * Math.PI * 40 * (1 - score / 100)
                }
                className="text-teal-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-teal-300">
                {score}%
              </span>
            </div>
          </div>

          {/* Passed / Failed */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2 text-teal-400">
              <CheckCircle size={16} />
              <span className="font-medium">{passedCount}</span>
              <span className="text-gray-400">Passed</span>
            </div>
            <div className="flex items-center gap-2 text-red-500">
              <XCircle size={16} />
              <span className="font-medium">{failedCount}</span>
              <span className="text-gray-400">Failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((m, idx) => (
          <StatCard
            key={idx}
            icon={CheckCircle}
            title={m.title}
            value={m.value}
            subtitle={m.passed ? "Passed validation" : "Below threshold"}
          />
        ))}
      </div>

      {/* ================= DISTRIBUTION ================= */}
      <TaskCompletionDistribution response={{ metrics }} />

      {/* ================= DETAILED VALIDATION ================= */}
      <DetailedValidationSection response={{ metrics }} />
    </div>
  );
};

export default TaskCompletionOverview;
