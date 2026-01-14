import { useState } from "react"
import FormInput from "../../components/FormInput"
import PrimaryButton from "../../components/PrimaryButton"

const AgentConnectionForm = ({ platform, onConnect, isConnecting }) => {
  const [apiKey, setApiKey] = useState("")
  const [agentId, setAgentId] = useState("")
  const [name, setName] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [direction, setDirection] = useState("both")
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onConnect({
      platform,
      apiKey: platform === 'custom' ? 'custom' : apiKey,
      agentId: platform === 'custom' ? 'custom' : agentId,
      name,
      customPrompt: platform === 'custom' ? customPrompt : "",
      direction,
      phoneNumber: (direction === "inbound" || direction === "both") ? phoneNumber : "",
    })
  }

  const isFormValid =
    name.trim() &&
    (platform === 'custom'
      ? customPrompt.trim()
      : (apiKey.trim() && agentId.trim())) &&
    ((direction === "inbound" || direction === "both") ? phoneNumber.trim() : true)

  // Get platform-specific labels
  const getPlatformLabels = () => {
    switch (platform) {
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
      case 'custom':
        return {
          apiKeyLabel: '',
          apiKeyPlaceholder: '',
          agentIdLabel: '',
          agentIdPlaceholder: '',
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
                <div className="bg-dark-panel rounded-xl p-4 border border-gray-800/50 shadow-xl relative">
                  {isConnecting && (
                    <div className="absolute inset-0 bg-teal-400/10 animate-pulse rounded-xl" />
                  )}

                  <div className="mb-2.5 relative z-10 pl-1">
                    <h3 className="text-lg font-semibold text-white mb-0.5">
                      Agent Details
                    </h3>
                    <p className="text-gray-400 text-[11px]">
                      {platform === 'custom'
                        ? 'Enter agent details and system prompt'
                        : `Enter your ${platform?.toUpperCase()} credentials`}
                    </p>
                  </div>

      <div className="custom-scrollbar pr-1">
        <div className="space-y-3 relative z-10">
          <FormInput
            label="Agent Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            focused={focusedField === "name"}
            placeholder="My Voice Agent"
            disabled={isConnecting}
            required
          />

          {platform === 'custom' ? (
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Custom Prompt
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onFocus={() => setFocusedField("customPrompt")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter system prompt..."
                disabled={isConnecting}
                rows={3}
                className={`w-full px-4 py-2 bg-dark-input border rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none transition-all duration-300 ${focusedField === "customPrompt" || customPrompt
                  ? "border-teal-400 shadow-sm shadow-teal-400/20"
                  : "border-gray-700 hover:border-gray-600"
                  }`}
                required
              />
            </div>
          ) : (
            <>
              <FormInput
                label={labels.apiKeyLabel + " *"}
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
                label={labels.agentIdLabel + " *"}
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 ml-1">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full bg-dark-input border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-400 transition-colors"
              disabled={isConnecting}
            >
              <option value="inbound">Inbound Only</option>
              <option value="outbound">Outbound Only</option>
            </select>
          </div>

          {(direction === "inbound" || direction === "both") && (
            <FormInput
              label="Agent Phone Number *"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onFocus={() => setFocusedField("phoneNumber")}
              onBlur={() => setFocusedField(null)}
              focused={focusedField === "phoneNumber"}
              placeholder="+1234567890"
              disabled={isConnecting}
              required
            />
          )}

          <PrimaryButton
            onClick={handleSubmit}
            loading={isConnecting}
            disabled={!isFormValid}
            className="py-2.5 text-sm"
          />
        </div>

        {isConnecting && (
          <div className="mt-3 flex items-center justify-center gap-2 text-teal-400 animate-pulse relative z-10">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-glow" />
            <span className="text-[11px] font-medium">
              {platform === 'custom' ? 'Saving...' : 'Connecting...'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentConnectionForm
