import { useState } from "react"
import FormInput from "../../components/FormInput"
import PrimaryButton from "../../components/PrimaryButton"

const AgentConnectionForm = ({ platform, onConnect, isConnecting }) => {
  const [apiKey, setApiKey] = useState("")
  const [assistantId, setAssistantId] = useState("")
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onConnect({
      platform,
      apiKey,
      assistantId: platform === "vapi" ? assistantId : null,
    })
  }

  const isFormValid =
    platform === "vapi"
      ? apiKey.trim() && assistantId.trim()
      : apiKey.trim()

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
          label={`${platform?.toUpperCase()} API Key`}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onFocus={() => setFocusedField("apiKey")}
          onBlur={() => setFocusedField(null)}
          focused={focusedField === "apiKey"}
          placeholder={`Enter your ${platform?.toUpperCase()} API key`}
          type="password"
          disabled={isConnecting}
        />

        {platform === "vapi" && (
          <FormInput
            label="VAPI Assistant ID"
            value={assistantId}
            onChange={(e) => setAssistantId(e.target.value)}
            onFocus={() => setFocusedField("assistantId")}
            onBlur={() => setFocusedField(null)}
            focused={focusedField === "assistantId"}
            placeholder="Enter your VAPI Assistant ID"
            type="password"
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
