const MetricBar = ({ label, value, threshold }) => {
  const isAboveThreshold = value >= threshold;
  const percentage = (value / 100) * 100;
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-300 text-base font-medium">{label}</h3>
        <span className={`text-2xl font-bold ${isAboveThreshold ? 'text-teal-400' : 'text-red-500'}`}>
          {value}%
        </span>
      </div>
      <div className="relative">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${isAboveThreshold ? 'bg-teal-400' : 'bg-red-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>0</span>
          <span className="flex items-center gap-1">
            <div className="w-1 h-1 bg-gray-500 rounded-full" />
            Threshold: {threshold}%
          </span>
          <span>1</span>
        </div>
      </div>
    </div>
  );
};

export default MetricBar;