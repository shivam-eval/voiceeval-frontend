import { useState } from 'react'

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
    <div className="w-full max-w-2xl mx-auto px-6">
      <div className="bg-dark-panel rounded-3xl p-12 shadow-2xl border border-gray-800/50 relative overflow-hidden">
        {/* Glowing background effect when connecting */}
        {isConnecting && (
          <div className="absolute inset-0 bg-accent-green opacity-10 animate-pulse" />
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-dark-input hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 group"
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

        {/* Close button */}
        <button
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-dark-input hover:bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 group"
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

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Voice<span className="text-teal-400">Eval</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Connect your {platform?.toUpperCase()} workspace
          </p>
        </div>

        {/* Connection Instructions */}
        <div className="mb-8">
          <h2 className="text-2xl text-white font-semibold mb-2">
            Connect your Voice Agent API
          </h2>
          <p className="text-gray-500 text-base">
            Enter your {platform?.toUpperCase()} credentials to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder={platform === 'vapi' ? 'Enter your VAPI API key' : `Enter your ${platform?.toUpperCase()} API key`}
                className={`w-full px-5 py-4 bg-dark-input border rounded-xl text-white text-base placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                  focusedField === 'apiKey' || apiKey
                    ? 'border-accent-green shadow-lg shadow-accent-green/30'
                    : 'border-gray-700 hover:border-gray-600'
                } ${isConnecting ? 'animate-glow' : ''}`}
                disabled={isConnecting}
              />
              {/* Glowing effect on focus */}
              {(focusedField === 'apiKey' || apiKey) && (
                <div className="absolute inset-0 rounded-xl bg-accent-green opacity-10 blur-xl -z-10 animate-glow" />
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
                      ? 'border-accent-green shadow-lg shadow-accent-green/30'
                      : 'border-gray-700 hover:border-gray-600'
                  } ${isConnecting ? 'animate-glow' : ''}`}
                  disabled={isConnecting}
                />
                {/* Glowing effect on focus */}
                {(focusedField === 'assistantId' || assistantId) && (
                  <div className="absolute inset-0 rounded-xl bg-accent-green opacity-10 blur-xl -z-10 animate-glow" />
                )}
              </div>
            </div>
          )}

          {/* Terms and Privacy */}
          <p className="text-gray-500 text-sm text-center pt-2">
            By continuing, you agree to our{' '}
            <a
              href="#"
              className="text-white hover:text-accent-green transition-colors font-medium"
            >
              Terms
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="text-white hover:text-accent-green transition-colors font-medium"
            >
              Privacy Policy
            </a>
          </p>

          {/* Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid || isConnecting}
              className={`w-full px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                isFormValid && !isConnecting
                  ? 'bg-accent-green hover:bg-green-400 text-white shadow-lg shadow-accent-green/50 animate-glow hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isConnecting ? (
                <span className="flex items-center justify-center gap-3">
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
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </form>

        {/* Connection Status Indicator */}
        {isConnecting && (
          <div className="mt-8 flex items-center justify-center gap-3 text-accent-green animate-pulse">
            <div className="w-2.5 h-2.5 bg-accent-green rounded-full animate-glow" />
            <span className="text-base font-medium">Establishing connection...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectionForm
