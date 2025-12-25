const OverallResultsSummary = () => {
  return (
    <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 bg-dark-panel rounded-lg border border-gray-700">
          <div className="text-gray-400 text-xs mb-1">Total Tests</div>
          <div className="text-2xl font-bold text-white">30</div>
        </div>
        <div className="p-4 bg-dark-panel rounded-lg border border-gray-700">
          <div className="text-gray-400 text-xs mb-1">Passed</div>
          <div className="text-2xl font-bold text-green-400">27</div>
        </div>
        <div className="p-4 bg-dark-panel rounded-lg border border-gray-700">
          <div className="text-gray-400 text-xs mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-400">3</div>
        </div>
        <div className="p-4 bg-dark-panel rounded-lg border border-gray-700">
          <div className="text-gray-400 text-xs mb-1">Overall Status</div>
          <span className="metric-badge metric-badge-fail">NOT READY</span>
        </div>
        <div className="p-4 bg-dark-panel rounded-lg border border-gray-700">
          <div className="text-gray-400 text-xs mb-1">Total Exec Time</div>
          <div className="text-2xl font-bold text-white">~44.9s</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-yellow-300">Most tests passed, but failures block deployment readiness.</div>
    </div>
  )
}

export default OverallResultsSummary
