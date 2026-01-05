import { Target, CheckCircle, ArrowLeft, TrendingUp, ListChecks, Award, Flag } from "lucide-react";
import MetricCard from "../accuracy/MetricCard";
import DetailedMetric from "../../../../components/DetailedMetric";
import CriticalAlert from "../../../../components/CriticAlert";

/* =========================
   MOCK API RESPONSE
========================= */
const response = {
  category: "task_completion",
  overall_score: 0.6,
  passed: false,
  metrics: [
    {
      name: "task_completion_rate",
      score: 0.2,
      status: "failed",
      threshold: 0.8,
    },
    {
      name: "sequential_task_accuracy",
      score: 1,
      status: "passed",
      threshold: 0.9,
    },
    {
      name: "step_validation_pass_rate",
      score: 0.85,
      status: "passed",
      threshold: 0.8,
    },
    {
      name: "flow_path_coverage",
      score: 0.75,
      status: "passed",
      threshold: 0.7,
    }
  ],
};

const humanizeMetricName = (name) => {
  const map = {
    task_completion_rate: "Task Completion Rate",
    sequential_task_accuracy: "Sequential Task Accuracy",
    step_validation_pass_rate: "Step Validation Rate",
    flow_path_coverage: "Flow Path Coverage",
  };
  return map[name] || name;
};

const transformTaskMetrics = (response) =>
  response.metrics.map((m) => ({
    label: humanizeMetricName(m.name),
    value: m.execution_time_ms ? m.execution_time_ms : (m.score ? Math.round(m.score * 100) : (m.status === 'passed' ? 100 : 0)),
    unit: m.execution_time_ms ? "ms" : "%",
    threshold: m.execution_time_ms ? m.threshold * 1000 : (m.threshold ? Math.round(m.threshold * 100) : 80),
    time: m.execution_time_ms ? `${m.execution_time_ms.toFixed(2)}ms` : '0ms',
    status: m.status === "passed" ? "passed" : "failed",
  }));

/* =========================
   Sub-components
========================= */
const StatCard = ({ label, value, unit = "", icon: Icon, status = "passed" }) => (
  <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-5 flex items-center justify-between group hover:border-teal-500/30 transition-all">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${status === 'passed' ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-gray-400 text-sm">{label}</div>
        <div className="text-2xl font-bold text-white">
          {value}
          <span className="text-sm ml-1 text-gray-500 font-normal">{unit}</span>
        </div>
      </div>
    </div>
    <div className={`text-xs font-semibold px-2 py-1 rounded-full border ${
      status === 'passed' ? 'border-teal-500/30 text-teal-400 bg-teal-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5'
    }`}>
      {status === 'passed' ? 'COMPLETE' : 'INCOMPLETE'}
    </div>
  </div>
);

/* =========================
   Component
========================= */
const TaskCompletionOverview = ({ data, onBack }) => {
  // Use data from prop if available, otherwise fallback to mock response
  const metricsSource = data?.metricResults 
    ? data.metricResults.filter(m => m.category === 'task_completion')
    : response.metrics;

  const score = data?.categoryScores 
    ? data.categoryScores.find(c => c.category === 'task_completion')?.score || 0
    : Math.round(response.overall_score * 100);

  const passedCount = metricsSource.filter((m) => m.status === "passed").length;
  const failedCount = metricsSource.length - passedCount;
  const isCritical = score < 80; // Example threshold

  const detailedMetrics = metricsSource.map((m) => ({
    label: humanizeMetricName(m.name),
    value: m.execution_time_ms ? m.execution_time_ms : (m.score ? Math.round(m.score * 100) : (m.status === 'passed' ? 100 : 0)),
    unit: m.execution_time_ms ? "ms" : "%",
    threshold: m.threshold ? (m.execution_time_ms ? m.threshold * 1000 : Math.round(m.threshold * 100)) : 80,
    time: m.execution_time_ms ? `${m.execution_time_ms.toFixed(2)}ms` : '0ms',
    status: m.status === "passed" ? "passed" : "failed",
  }));

  const getMetricData = (name) => {
    const m = metricsSource.find(m => m.name === name);
    if (!m) return { value: 0, unit: "%", status: "passed" };
    return {
      value: m.execution_time_ms ? m.execution_time_ms : Math.round((m.score || 0) * 100),
      unit: m.execution_time_ms ? "ms" : "%",
      status: m.status
    };
  };

  const failedMetricsForAlert = detailedMetrics
    .filter(m => m.status === 'failed')
    .map(m => ({
      icon: Target,
      label: m.label,
      value: `${m.value}${m.unit}`
    }));

  return (
    <div className="flex flex-col gap-8">
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
      <MetricCard
        icon={Target}
        title="Task Completion"
        description="Measures the success rate of user requests and task flows"
        value={score}
        passed={passedCount}
        failed={failedCount}
        status={isCritical ? "critical" : "success"}
      />

      {/* ================= CRITICAL ALERT ================= */}
      {isCritical && (
        <CriticalAlert
          title="Critical: Flow Failure Detected"
          description="The system failed to complete the primary task or missed critical sequential steps."
          metrics={failedMetricsForAlert}
        />
      )}

      {/* ================= QUICK STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Completion Rate" 
          {...getMetricData('task_completion_rate')}
          icon={CheckCircle}
        />
        <StatCard 
          label="Task Accuracy" 
          {...getMetricData('sequential_task_accuracy')}
          icon={Award}
        />
        <StatCard 
          label="Validation Rate" 
          {...getMetricData('step_validation_pass_rate')}
          icon={ListChecks}
        />
        <StatCard 
          label="Flow Coverage" 
          {...getMetricData('flow_path_coverage')}
          icon={Flag}
        />
      </div>

      {/* ================= DETAILED METRICS ================= */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-teal-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-teal-400 rounded-full" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Detailed Metrics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {detailedMetrics.map((metric, idx) => (
            <DetailedMetric key={idx} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionOverview;
