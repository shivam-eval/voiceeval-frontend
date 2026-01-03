import { useState } from "react"
import FormInput from "../../components/FormInput"
import PrimaryButton from "../../components/PrimaryButton"

const AgentConnectionForm = ({ platform, onConnect, isConnecting }) => {
  const [agentName, setAgentName] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [agentId, setAgentId] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [direction, setDirection] = useState("outbound")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onConnect({
      platform,
      agentName,
      apiKey: platform === 'custom' ? undefined : apiKey,
      agentId: platform === 'custom' ? undefined : agentId,
      customPrompt: platform === 'custom' ? customPrompt : undefined,
      direction,
      phoneNumber: direction === 'inbound' ? phoneNumber : undefined,
    })
  }

  const isFormValid = platform === 'custom' 
    ? agentName.trim() && customPrompt.trim() && (direction === 'outbound' || phoneNumber.trim())
    : agentName.trim() && apiKey.trim() && agentId.trim() && (direction === 'outbound' || phoneNumber.trim())

  // Get platform-specific labels
  const getPlatformLabels = () => {
    switch(platform) {
      case 'custom':
        return {
          agentNameLabel: 'Agent Name',
          agentNamePlaceholder: 'Enter a name for this agent',
          customPromptLabel: 'Custom System Prompt',
          customPromptPlaceholder: 'Enter the system prompt for your agent...',
        };
      case 'vapi':
        return {
          apiKeyLabel: 'VAPI API Key',
          apiKeyPlaceholder: 'Enter your VAPI API key',
          agentIdLabel: 'VAPI Assistant ID',
          agentIdPlaceholder: 'Enter your VAPI Assistant ID',
        };
      case 'elevenlabs':
        return {
          apiKeyLabel: 'ElevenLabs API Key (xi-api-key)',
          apiKeyPlaceholder: 'Enter your ElevenLabs API key',
          agentIdLabel: 'ElevenLabs Agent ID',
          agentIdPlaceholder: 'Enter your ElevenLabs Agent ID',
        };
      case 'cartesia':
        return {
          apiKeyLabel: 'Cartesia API Key (Bearer Token)',
          apiKeyPlaceholder: 'Enter your Cartesia API key',
          agentIdLabel: 'Cartesia Agent ID',
          agentIdPlaceholder: 'Enter your Cartesia Agent ID',
        };
      default:
        return {
          apiKeyLabel: `${platform?.toUpperCase()} API Key`,
          apiKeyPlaceholder: `Enter your ${platform?.toUpperCase()} API key`,
          agentIdLabel: `${platform?.toUpperCase()} Agent ID`,
          agentIdPlaceholder: `Enter your ${platform?.toUpperCase()} Agent ID`,
        };
    }
  };

  const labels = getPlatformLabels();

  return (
    <div className="bg-dark-panel rounded-2xl p-8 border border-gray-800/50 shadow-xl relative">
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

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <FormInput
          label="Agent Name"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          onFocus={() => setFocusedField("agentName")}
          onBlur={() => setFocusedField(null)}
          focused={focusedField === "agentName"}
          placeholder="Enter a name for this agent"
          disabled={isConnecting}
        />

        {platform === 'custom' ? (
          <div>
            <label className="block text-white text-base font-medium mb-3">
              {labels.customPromptLabel}
            </label>
            <div className="relative">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onFocus={() => setFocusedField("customPrompt")}
                onBlur={() => setFocusedField(null)}
                placeholder={labels.customPromptPlaceholder}
                disabled={isConnecting}
                rows={6}
                className={`w-full px-5 py-4 bg-dark-input border rounded-xl text-white text-base placeholder-gray-500 focus:outline-none transition-all duration-300 resize-none ${
                  focusedField === "customPrompt" || customPrompt
                    ? "border-teal-400 shadow-lg shadow-teal-400/30"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              />
              {(focusedField === "customPrompt" || customPrompt) && (
                <div className="absolute inset-0 rounded-xl bg-teal-400 opacity-10 blur-xl -z-10 animate-glow" />
              )}
            </div>
          </div>
        ) : (
          <>
            <FormInput
              label={labels.apiKeyLabel}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onFocus={() => setFocusedField("apiKey")}
              onBlur={() => setFocusedField(null)}
              focused={focusedField === "apiKey"}
              placeholder={labels.apiKeyPlaceholder}
              type="password"
              disabled={isConnecting}
            />

            <FormInput
              label={labels.agentIdLabel}
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              onFocus={() => setFocusedField("agentId")}
              onBlur={() => setFocusedField(null)}
              focused={focusedField === "agentId"}
              placeholder={labels.agentIdPlaceholder}
              type="password"
              disabled={isConnecting}
            />
          </>
        )}

        <div>
          <label className="block text-white text-base font-medium mb-3">
            Call Direction
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDirection("outbound")}
              className={`py-3 px-4 rounded-xl border transition-all duration-300 ${
                direction === "outbound"
                  ? "bg-teal-400/10 border-teal-400 text-teal-400 shadow-lg shadow-teal-400/20"
                  : "bg-dark-input border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
              disabled={isConnecting}
            >
              Outbound
            </button>
            <button
              type="button"
              onClick={() => setDirection("inbound")}
              className={`py-3 px-4 rounded-xl border transition-all duration-300 ${
                direction === "inbound"
                  ? "bg-teal-400/10 border-teal-400 text-teal-400 shadow-lg shadow-teal-400/20"
                  : "bg-dark-input border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
              disabled={isConnecting}
            >
              Inbound
            </button>
          </div>
        </div>

        {direction === "inbound" && (
          <FormInput
            label="Agent Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onFocus={() => setFocusedField("phoneNumber")}
            onBlur={() => setFocusedField(null)}
            focused={focusedField === "phoneNumber"}
            placeholder="e.g. +1234567890"
            disabled={isConnecting}
          />
        )}

        <p className="text-gray-400 text-sm">
          Your API key is encrypted and stored securely.
        </p>

        <PrimaryButton
          loading={isConnecting}
          disabled={!isFormValid}
        />
      </form>

      {isConnecting && (
        <div className="mt-6 flex items-center justify-center gap-3 text-teal-400 animate-pulse relative z-10">
          <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-glow" />
          <span className="text-base font-medium">
            Establishing connection...
          </span>
        </div>
      )}
    </div>
  )
}

export default AgentConnectionForm
