import { TrendingUp } from "lucide-react";

const LatencyDistribution = () => {
  return (
    <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6 items-center">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-teal-400" size={18} />
        <h3 className="text-lg font-semibold text-white">
          Latency Distribution
        </h3>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-6 gap-6">

        {/* Row 1 */}
        <div>
          <div className="text-gray-400 text-sm mb-2">Average Ms</div>
          <div className="text-white text-xl font-semibold">1.69s</div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-2">Max Ms</div>
          <div className="text-white text-xl font-semibold">1.80s</div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-2">Min Ms</div>
          <div className="text-white text-xl font-semibold">1.20s</div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-2">Median Ms</div>
          <div className="text-white text-xl font-semibold">1.70s</div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-2">P95 Ms</div>
          <div className="text-white text-xl font-semibold">1.80s</div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-2">P99 Ms</div>
          <div className="text-white text-xl font-semibold">1.80s</div>
        </div>

        {/* Row 2 */}
        <div>
          <div className="text-gray-400 text-sm mb-2">Count</div>
          <div className="text-white text-xl font-semibold">11</div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-2">Std Dev</div>
          <div className="text-white text-xl font-semibold">176ms</div>
        </div>

      </div>
    </div>
  );
};

export default LatencyDistribution;
