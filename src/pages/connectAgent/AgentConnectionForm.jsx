import { useState } from "react"
import FormInput from "../../components/FormInput"
import PrimaryButton from "../../components/PrimaryButton"

const AgentConnectionForm = ({ platform, onConnect, isConnecting }) => {
  const [apiKey, setApiKey] = useState("")
  const [agentId, setAgentId] = useState("")
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onConnect({
      platform,
      apiKey,
      agentId,
    })
  }

  const isFormValid = apiKey.trim() && agentId.trim()

  // Get platform-specific labels
  const getPlatformLabels = () => {
    switch(platform) {
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
