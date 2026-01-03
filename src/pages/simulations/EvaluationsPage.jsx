import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Play,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { useSimulations } from "../../hooks/useSimulations";
import DashboardLoader from "../../components/DashboardLoader";

/* -----------------------------
   Helpers
------------------------------ */
const display = (value) =>
  value === null || value === undefined || value === ""
    ? "N/A"
    : value;

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDuration = (ms) => {
  if (!ms) return "N/A";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

const scoreColor = (score) => {
  if (score == null) return "text-gray-500";
  if (score >= 80) return "text-green-400";
  if (score >= 70) return "text-blue-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
};

const statusBadge = (sim) => {
  const score = sim.overall_score;

  if (sim.status === "failed") {
    return (
      <span className="badge bg-red-900/20 text-red-400 border-red-500/30">
        <XCircle className="w-3 h-3" /> Failed
      </span>
    );
  }

  if (score == null) {
    return (
      <span className="badge bg-gray-800 text-gray-400 border-gray-700">
        <AlertCircle className="w-3 h-3" /> N/A
      </span>
    );
  }

  if (score >= 80) {
    return (
      <span className="badge bg-green-900/20 text-green-400 border-green-500/30">
        <CheckCircle className="w-3 h-3" /> Excellent
      </span>
    );
  }

  if (score >= 70) {
    return (
      <span className="badge bg-blue-900/20 text-blue-400 border-blue-500/30">
        <CheckCircle className="w-3 h-3" /> Good
      </span>
    );
  }

  return (
    <span className="badge bg-yellow-900/20 text-yellow-400 border-yellow-500/30">
      <AlertCircle className="w-3 h-3" /> Needs Improvement
    </span>
  );
};

/* -----------------------------
   Component
------------------------------ */
const EvaluationsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useSimulations();
  const simulations = data?.simulations || [];

  const filtered = simulations.filter((sim) => {
    const name = display(sim.test_suite_name).toLowerCase();
    const id = display(sim.simulation_id).toLowerCase();

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      id.includes(searchTerm.toLowerCase());

    const score = sim.overall_score ?? -1;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "passed" && score >= 70) ||
      (statusFilter === "failed" && score >= 0 && score < 70);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <DashboardLoader message="Loading evaluations..." />;
  }

  return (
    <div className="h-screen flex flex-col bg-dark-bg">
      {/* Header */}
      <div className="border-b border-gray-800 bg-dark-surface px-8 py-6">
        <h1 className="text-3xl font-bold text-white">Evaluations</h1>
        <p className="text-gray-400">
          Review evaluation results from simulation runs
        </p>

        <div className="flex gap-4 mt-6">
          <input
            className="flex-1 px-4 py-2 bg-dark-input border border-gray-700 rounded-lg text-white"
            placeholder="Search by simulation ID or test suite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="px-4 py-2 bg-dark-input border border-gray-700 rounded-lg text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="passed">Passed (≥70%)</option>
            <option value="failed">Failed (&lt;70%)</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filtered.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center bg-dark-surface p-10 rounded-lg border border-gray-800">
              <BarChart3 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-4">No evaluations found</p>
              <Link
                to="/simulation/runs"
                className="inline-flex items-center gap-2 bg-primary-600 px-4 py-2 rounded-lg text-white"
              >
                <Play className="w-4 h-4" /> View Simulations
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((sim) => (
              <div
                key={sim.simulation_id}
                onClick={() =>
                  navigate(`/evaluations/results/${sim.simulation_id}`)
                }
                className="bg-dark-surface border border-gray-800 rounded-lg p-6 cursor-pointer hover:border-primary-500/50"
              >
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {display(sim.test_suite_name)}
                    </h3>
                    <p className="text-sm text-gray-400 font-mono">
                      {display(sim.simulation_id)}
                    </p>
                    <div className="mt-2">{statusBadge(sim)}</div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-3xl font-bold ${scoreColor(
                        sim.overall_score
                      )}`}
                    >
                      {sim.overall_score != null
                        ? `${Math.round(sim.overall_score)}%`
                        : "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">Overall Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-800 text-sm">
                  <div>
                    <div className="text-gray-500">Test Cases</div>
                    <div className="text-white">
                      {display(sim.completed_sessions)} /{" "}
                      {display(sim.total_sessions)}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500">Started</div>
                    <div className="text-white">
                      {formatDate(sim.started_at)}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500">Duration</div>
                    <div className="text-white">
                      {formatDuration(sim.duration_ms)}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500">Status</div>
                    <div className="text-white">{display(sim.status)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationsPage;
