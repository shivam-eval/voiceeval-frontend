import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import StatCard from "../../../../components/StatCard";
import TaskCompletionDistribution from "./TaskCompletion";
import DetailedValidationSection from "./DetailedValidationSection";
import { GitBranch } from "lucide-react";

/* =========================
   HELPERS
========================= */

const humanizeMetricName = (name) => {
  if (!name) return "Unknown Metric";
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
  const map = {
    task_completion_rate: "Task Completion",
    sequential_task_accuracy: "Sequential Accuracy",
    step_validation_pass_rate: "Step Validation",
    flow_path_coverage: "Flow Coverage",
  };
  return map[name] || String(name).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
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

  // Define priority metrics to display
  const priorityMetrics = [
    'task_completion_rate',
    'sequential_task_accuracy',
    'step_validation_pass_rate',
    'flow_path_coverage'
  ];

  // Filter to only include priority metrics and map them
  return response.metrics
    .filter(m => m && priorityMetrics.includes(m.name || m.metric_name))
    .map((m) => ({
      title: humanizeMetricName(m.name || m.metric_name),
      value: normalizeMetricScore(m.score),
      passed: m.status === "passed",
    }));
};

/* =========================
   COMPONENT
========================= */

const TaskCompletionOverview = ({ response, data, onBack }) => {
  console.log('=== TaskCompletionOverview Render ===');
  console.log('TaskCompletionOverview received response:', response);
  console.log('TaskCompletionOverview received data:', data);

  // Handle both single evaluation (response) and aggregated data (data)
  let metrics = [];
  let score = 0;

  if (response) {
    // Called from ViewReport with single evaluation's category data
    console.log('Using response.metrics:', response.metrics);
    metrics = response?.metrics || [];
    score = typeof response.score === "number" ? Math.round(response.score * 100) : 0;
  } else if (data) {
    // Called from Dashboard with aggregated data
    console.log('Using data - category_scores:', data.category_scores);
    const taskCategory = data.category_scores?.find(c => c.category === 'task_completion');
    console.log('Found task_completion category:', taskCategory);

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
      console.log('Aggregated metrics from evaluations:', metrics);
    }
  }

  // Ensure metrics is an array of objects
  const safeMetrics = Array.isArray(metrics) ? metrics.filter(Boolean) : [];

  // Ensure score is a valid number for the ring visualization
  const displayScore = typeof score === 'number' && !isNaN(score) ? score : 0;

  // Use safe versions for the rest of the component
  metrics = safeMetrics;
  score = displayScore;

  if (!metrics || metrics.length === 0) {
    console.warn('No task completion metrics available - showing empty state');
    return (
      <div className="space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-dark-input hover:bg-dark-input/80 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </button>
        )}
        <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No task completion metrics available</p>
          <p className="text-gray-600 text-xs mt-1">
            {response ? 'Response has no metrics' : data ? 'Data has no task_completion category' : 'No data provided'}
          </p>
        </div>
      </div>
    );
  }

  console.log('Rendering TaskCompletionOverview with', metrics.length, 'metrics');

  /* -------------------------
     DERIVED VALUES
  ------------------------- */

  const passedCount = metrics.filter(
    (m) => m.status === "passed"
  ).length;

  const totalCount = metrics.length;
  const failedCount = totalCount - passedCount;

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
      <div className="bg-[#0b1220] border border-gray-800/50 rounded-xl p-6 flex items-center justify-between shadow-lg">
        {/* Left */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <CheckCircle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Task Completion Analytics
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Tracks successful task and flow completion rates
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-4xl font-bold text-teal-400">{score}%</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Overall Score</span>
          </div>

          <div className="h-10 w-px bg-gray-800" />

          {/* Passed / Failed */}
          <div className="flex gap-6 text-sm">
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{passedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Passed</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{failedCount}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EXECUTION ANALYTICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, idx) => {
          const isPassed = metric.status === "passed";
          const mName = metric.name || metric.metric_name;
          const label = humanizeMetricName(mName);
          const score = typeof metric.score === 'number' ? Math.round(metric.score * 100) : 0;

          // Filter and humanize details
          const details = Object.entries(metric.details || {})
            .filter(([key]) => !['passed', 'threshold', 'execution_time_ms', 'llm_usage', 'value'].includes(key));

          return (
            <div key={idx} className={`rounded-xl p-6 border ${isPassed ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-red-950/10 border-red-900/20'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{label}</span>
                  <span className={`text-2xl font-bold ${isPassed ? 'text-teal-400' : 'text-red-400'}`}>
                    {score}%
                  </span>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {isPassed ? '✓ PASSED' : '✗ FAILED'}
                </div>
              </div>

              {details.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 pt-6 border-t border-gray-800/50">
                  {details.map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <div className="text-sm">
                        {value === null ? (
                          <span className="text-gray-600 italic">Not available</span>
                        ) : Array.isArray(value) ? (
                          value.length === 0 ? (
                            <span className="text-gray-600 italic">Empty</span>
                          ) : (
                            <ul className="space-y-1.5">
                              {value.map((item, i) => (
                                <li key={i} className="text-gray-300 flex items-start gap-2">
                                  <div className="w-1 h-1 bg-teal-500/40 rounded-full mt-2 flex-shrink-0" />
                                  <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
                                </li>
                              ))}
                            </ul>
                          )
                        ) : (
                          <span className="text-gray-300 leading-relaxed capitalize">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskCompletionOverview;
