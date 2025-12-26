const DashboardOverview = () => {
  return (
    <div className="bg-dark-panel rounded-2xl p-6 border border-gray-800/50 shadow-xl h-full">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            Dashboard Overview
          </h3>
          <p className="text-gray-400 text-sm">
            Real-time performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-teal-400/20 border border-teal-400/50 rounded-full">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          <span className="text-teal-400 text-xs font-medium">Live</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Success Rate */}
        <div className="bg-dark-input rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">94.2%</div>
          <div className="text-gray-400 text-sm">Success Rate</div>
        </div>

        {/* Avg Response */}
        <div className="bg-dark-input rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">1.8s</div>
          <div className="text-gray-400 text-sm">Avg Response</div>
        </div>

        {/* Total Calls */}
        <div className="bg-dark-input rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">1,247</div>
          <div className="text-gray-400 text-sm">Total Calls</div>
        </div>
      </div>

      {/* Recent Evaluations */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Recent Evaluations</h4>
        <div className="space-y-3">
          {[
            { duration: '2:34', score: 9.2, status: 'success' },
            { duration: '1:52', score: 8.7, status: 'success' },
            { duration: '3:12', score: 7.1, status: 'warning' },
            { duration: '2:01', score: 9.5, status: 'success' },
          ].map((call, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-dark-input rounded-lg border border-gray-700">
              <div className="flex-shrink-0">
                {call.status === 'success' ? (
                  <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-400/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{call.duration}</span>
                  <span className="text-white text-sm font-semibold">{call.score}</span>
                </div>
                <div className="h-1.5 bg-dark-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      call.status === 'success' ? 'bg-teal-400' : 'bg-orange-400'
                    }`}
                    style={{ width: `${(call.score / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview

