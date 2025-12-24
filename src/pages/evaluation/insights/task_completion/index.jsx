import { CheckCircle } from "lucide-react";
import StatCard from "../../../../components/StatCard";
import TaskCompletionDistribution from "./TaskCompletion";
import DetailedValidationSection from "./DetailedValidationSection";

const TaskCompletionOverview = () => {
  return (
    <div className="flex flex-col gap-6">

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
                strokeDashoffset={0}
                className="text-teal-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-teal-300">
                100%
              </span>
            </div>
          </div>

          {/* Passed / Failed */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2 text-teal-400">
              <CheckCircle size={16} />
              <span className="font-medium">4</span>
              <span className="text-gray-400">Passed</span>
            </div>
            <div className="flex items-center gap-2 text-red-500">
              ×
              <span className="font-medium">0</span>
              <span className="text-gray-400">Failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={CheckCircle}
          title="Task Completion"
          value={100}
          subtitle="Successfully completed tasks"
        />
        <StatCard
          icon={CheckCircle}
          title="Flow Coverage"
          value={100}
          subtitle="Paths executed correctly"
        />
        <StatCard
          icon={CheckCircle}
          title="Sequential Accuracy"
          value={100}
          subtitle="Tasks in correct order"
        />
      </div>

      <TaskCompletionDistribution/>
      <DetailedValidationSection/>
    </div>
  );
};

export default TaskCompletionOverview;
