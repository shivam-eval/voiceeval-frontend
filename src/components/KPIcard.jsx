const KpiCard = ({
  label,
  value,
  change,          // optional (number)
  trend = 'up',    // 'up' | 'down'
  showProgress = false,
  progressValue,   // number (0–100)
  helperText       // optional string
}) => {
  const isPositive = trend === 'up'

  return (
    <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
      {/* Label */}
      <div className="text-gray-400 text-sm mb-2">
        {label}
      </div>

      {/* Value + Change */}
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-3xl font-bold text-white">
          {value}
        </span>

        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isPositive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              )}
            </svg>
            <span>{change}%</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && typeof progressValue === 'number' && (
        <div className="h-1 bg-dark-input rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-400 transition-all duration-500"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <div className="text-gray-500 text-xs mt-2">
          {helperText}
        </div>
      )}
    </div>
  )
}

export default KpiCard
