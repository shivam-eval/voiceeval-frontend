import AgentConnectionForm from "./AgentConnectionForm"

const ConnectionForm = ({ platform, onConnect, isConnecting, onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-1">
      <div className="space-y-3">

        {/* Logo + Back */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 hover:border-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 group shadow-lg"
            title="Go back"
          >
            <svg
              className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
            Voice<span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Eval</span>
          </h1>
        </div>

        {/* Hero Section - Enhanced */}
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white leading-tight">
            Evaluate Your Voice AI Agents
          </h2>
          <p className="text-gray-400 text-xs leading-relaxed">
            Run automated call simulations, analyze performance metrics, and optimize your Voice AI agents.
          </p>
        </div>

        {/* Connection Form */}
        <AgentConnectionForm
          platform={platform}
          onConnect={onConnect}
          isConnecting={isConnecting}
        />

        {/* Feature Icons - Enhanced */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-800/50">
          <div className="flex items-center gap-1.5 group cursor-default">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500/15 to-teal-600/5 border border-teal-500/30 flex items-center justify-center group-hover:border-teal-400/50 group-hover:shadow-lg group-hover:shadow-teal-500/20 transition-all duration-200">
              <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="text-gray-300 text-[11px] font-medium">Real-time</span>
          </div>
          <div className="flex items-center gap-1.5 group cursor-default">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/30 flex items-center justify-center group-hover:border-blue-400/50 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-200">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-gray-300 text-[11px] font-medium">Analytics</span>
          </div>
          <div className="flex items-center gap-1.5 group cursor-default">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500/15 to-green-600/5 border border-green-500/30 flex items-center justify-center group-hover:border-green-400/50 group-hover:shadow-lg group-hover:shadow-green-500/20 transition-all duration-200">
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-gray-300 text-[11px] font-medium">Auto-score</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionForm
