import { useState } from 'react'
import DashboardOverview from './DashboardOverview'

const ConnectionForm = ({ platform, onConnect, isConnecting, onBack }) => {
  const [apiKey, setApiKey] = useState('')
  const [assistantId, setAssistantId] = useState('')
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (platform === 'vapi') {
      if (apiKey.trim() && assistantId.trim()) {
        onConnect({ apiKey, assistantId })
      }
    } else {
      if (apiKey.trim()) {
        onConnect({ apiKey, assistantId: null })
      }
    }
  }

  const isFormValid = platform === 'vapi' 
    ? apiKey.trim() && assistantId.trim()
    : apiKey.trim()

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-8 py-8">
      <div className="grid grid-cols-3 gap-8">
        {/* Left Section - Main Content */}
        <div className="col-span-2 space-y-8">
          {/* Logo and Feature Tag */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Voice<span className="text-teal-400">Eval</span>
              </h1>
              <button className="px-4 py-1.5 bg-dark-input border border-teal-400/50 text-teal-400 rounded-lg text-sm font-medium flex items-center gap-2 hover:border-teal-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI-Powered Evaluation
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-dark-input hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 group"
              >
                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="w-10 h-10 rounded-full bg-dark-input hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 group"
                onClick={() => window.location.reload()}
              >
                <svg
                  className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Main Heading */}
          <div>
            <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
              Evaluate Your Voice AI Agents
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
              Run automated call simulations, analyze performance metrics, and optimize your Voice AI agents with real-time insights.
            </p>
          </div>

          {/* Connection Form Panel */}
          <div className="bg-dark-panel rounded-2xl p-8 border border-gray-800/50 shadow-xl relative">
            {/* Glowing background effect when connecting */}
            {isConnecting && (
              <div className="absolute inset-0 bg-teal-400/10 animate-pulse rounded-2xl" />
            )}

            <div className="mb-6 relative z-10">
              <h3 className="text-2xl font-semibold text-white mb-2">
                Connect your Voice Agent API
              </h3>
              <p className="text-gray-400 text-base">
                Enter your {platform?.toUpperCase()} credentials to get started
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* API Key Input */}
              <div>
                <label className="block text-white text-base font-medium mb-3">
                  {platform === 'vapi' ? 'VAPI API Key' : `${platform?.charAt(0).toUpperCase() + platform?.slice(1)} API Key`}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onFocus={() => setFocusedField('apiKey')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={platform === 'vapi' ? 'sk_live_...' : `Enter your ${platform?.toUpperCase()} API key`}
                    className={`w-full px-5 py-4 bg-dark-input border rounded-xl text-white text-base placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                      focusedField === 'apiKey' || apiKey
                        ? 'border-teal-400 shadow-lg shadow-teal-400/30'
                        : 'border-gray-700 hover:border-gray-600'
                    } ${isConnecting ? 'animate-glow' : ''}`}
                    disabled={isConnecting}
                  />
                  {/* Glowing effect on focus */}
                  {(focusedField === 'apiKey' || apiKey) && (
                    <div className="absolute inset-0 rounded-xl bg-teal-400 opacity-10 blur-xl -z-10 animate-glow" />
                  )}
                </div>
              </div>

              {/* Assistant ID Input - Only for VAPI */}
              {platform === 'vapi' && (
                <div>
                  <label className="block text-white text-base font-medium mb-3">
                    VAPI Assistant ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={assistantId}
                      onChange={(e) => setAssistantId(e.target.value)}
                      onFocus={() => setFocusedField('assistantId')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your VAPI Assistant ID"
                      className={`w-full px-5 py-4 bg-dark-input border rounded-xl text-white text-base placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                        focusedField === 'assistantId' || assistantId
                          ? 'border-teal-400 shadow-lg shadow-teal-400/30'
                          : 'border-gray-700 hover:border-gray-600'
                      } ${isConnecting ? 'animate-glow' : ''}`}
                      disabled={isConnecting}
                    />
                    {/* Glowing effect on focus */}
                    {(focusedField === 'assistantId' || assistantId) && (
                      <div className="absolute inset-0 rounded-xl bg-teal-400 opacity-10 blur-xl -z-10 animate-glow" />
                    )}
                  </div>
                </div>
              )}

              {/* Security Message */}
              <p className="text-gray-400 text-sm">
                Your API key is encrypted and stored securely.
              </p>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid || isConnecting}
                  className={`w-full px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                    isFormValid && !isConnecting
                      ? 'bg-teal-400 hover:bg-teal-500 text-white shadow-lg shadow-teal-400/50 animate-glow hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isConnecting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <span>Connect Agent</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Connection Status Indicator */}
            {isConnecting && (
              <div className="mt-6 flex items-center justify-center gap-3 text-teal-400 animate-pulse relative z-10">
                <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-glow" />
                <span className="text-base font-medium">Establishing connection...</span>
              </div>
            )}
          </div>

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

        {/* Right Section - Dashboard Overview */}
        <div className="col-span-1">
          <DashboardOverview />
        </div>
      </div>
    </div>
  )
}

export default ConnectionForm
