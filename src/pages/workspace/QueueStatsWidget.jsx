import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getQueueStats } from "../../api";
import { useEvents } from "../../context/EventsContext";

const QueueStatsWidget = () => {
  const [localStats, setLocalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { queueStats: sseStats, isConnected } = useEvents();

  // Initial Fetch
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getQueueStats();
        setLocalStats(response.data);
      } catch (err) {
        console.error("Failed to fetch queue stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Use SSE stats if available, otherwise local stats
  const stats = sseStats || localStats;

  if (loading && !stats) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-700 rounded w-16"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 mb-2">
          Queue Status
        </h4>
        <p className="text-xs text-gray-500">Connecting...</p>
      </div>
    );
  }

  // ✅ Swagger-correct normalization
  const activeCount = Array.isArray(stats.active)
    ? stats.active.length
    : stats.total_active ?? (stats.active_jobs || 0);

  const completedCount = Array.isArray(stats.completed)
    ? stats.completed.length
    : stats.total_completed ?? (stats.total_jobs ? stats.total_jobs - (stats.active_jobs || 0) : 0);

  const failedCount = Array.isArray(stats.completed)
    ? stats.completed.filter(s => s.status === "failed").length
    : 0;

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-400">
          Queue Status
        </h4>
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? "Live Updates" : "Disconnected"}></span>
      </div>

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
