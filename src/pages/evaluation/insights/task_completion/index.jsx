import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import StatCard from "../../../../components/StatCard";
import TaskCompletionDistribution from "./TaskCompletion";
import DetailedValidationSection from "./DetailedValidationSection";

/* =========================
   Helpers
========================= */

const response=
{
  "category": "task_completion",
  "overall_score": 1.0,
  "passed": true,
  "metrics": [
    {
      "metric_name": "task_completion_rate",
      "category": "task_completion",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 1245.5,
      "value": 1.0,
      "threshold": 0.9
    },
    {
      "metric_name": "sequential_task_accuracy",
      "category": "task_completion",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 850.2,
      "value": 0.95,
      "threshold": 0.85
    },
    {
      "metric_name": "step_validation_pass_rate",
      "category": "task_completion",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 620.8,
      "value": 0.98,
      "threshold": 0.8
    },
    {
      "metric_name": "flow_path_coverage",
      "category": "task_completion",
      "status": "passed",
      "passed": true,
      "execution_time_ms": 450.3,
      "value": 1.0
    }
  ]
}
const humanizeMetricName = (name) => {
  const map = {
    task_completion_rate: "Task Completion",
    sequential_task_accuracy: "Sequential Accuracy",
    step_validation_pass_rate: "Step Validation",
    flow_path_coverage: "Flow Coverage",
  };
  return map[name] || name;
};

const transformStatCards = (response) =>
  response.metrics.map((m) => ({
    title: humanizeMetricName(m.metric_name),
    value: Math.round(m.value * 100),
    passed: m.passed,
  }));

/* =========================
   Component
========================= */
const TaskCompletionOverview = ({ onBack }) => {
  /* -------------------------
     Derived values
  ------------------------- */
  const score = Math.round(response.overall_score * 100);

  const passedCount = response.metrics.filter((m) => m.passed).length;
  const failedCount = response.metrics.length - passedCount;

  const statCards = transformStatCards(response);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <TaskCompletionDistribution response={response} />

      {/* ================= DETAILED VALIDATION ================= */}
      <DetailedValidationSection response={response} />

    </div>
  );
};

export default TaskCompletionOverview;
