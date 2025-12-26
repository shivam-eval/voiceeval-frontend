import AgentConnectionForm from "./AgentConnectionForm"

const ConnectionForm = ({ platform, onConnect, isConnecting, onBack }) => {
  return (
    <div className="w-full max-w-screen-2xl mx-auto">
      <div className="space-y-8">

        {/* Logo + Back */}
        <div className="flex items-start justify-between">
          <h1 className="text-4xl font-bold text-white">
            Voice<span className="text-teal-400">Eval</span>
          </h1>

          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-dark-input hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white"
          >
            ←
          </button>
        </div>

        {/* Hero */}
        <div>
          <h2 className="text-5xl font-bold text-white mb-4">
            Evaluate Your Voice AI Agents
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl">
            Run automated call simulations, analyze performance metrics,
            and optimize your Voice AI agents with real-time insights.
          </p>
        </div>

        
        <AgentConnectionForm
          platform={platform}
          onConnect={onConnect}
          isConnecting={isConnecting}
        />


          {/* Footer Icons */}
          <div className="flex items-center gap-8 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-input border border-gray-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Real-time Testing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-input border border-gray-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-input border border-gray-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Auto-scoring</span>
            </div>
          </div>
      </div>
    </div>
  )
}

export default ConnectionForm
