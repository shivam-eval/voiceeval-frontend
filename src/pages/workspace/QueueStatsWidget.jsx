import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getQueueStats } from "../../api";

const QueueStatsWidget = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getQueueStats();
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch queue stats:", err);
        toast.error(`Failed to fetch queue stats: ${err.message}`);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-700 rounded w-16"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 mb-2">
          Queue Status
        </h4>
        <p className="text-xs text-red-400">Unavailable</p>
      </div>
    );
  }

  // ✅ Swagger-correct normalization
  const activeCount = Array.isArray(stats.active)
    ? stats.active.length
    : stats.total_active ?? 0;

  const completedCount = Array.isArray(stats.completed)
    ? stats.completed.length
    : stats.total_completed ?? 0;

  const failedCount = Array.isArray(stats.completed)
    ? stats.completed.filter(s => s.status === "failed").length
    : 0;

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h4 className="text-sm font-medium text-gray-400 mb-3">
        Queue Status
      </h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Running</span>
          <span className="text-sm font-semibold text-teal-400">
            {activeCount}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Completed</span>
          <span className="text-sm font-semibold text-green-400">
            {completedCount}
          </span>
        </div>

        {failedCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Failed</span>
            <span className="text-sm font-semibold text-red-400">
              {failedCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueStatsWidget;
