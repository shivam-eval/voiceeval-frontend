import { useState } from "react"
import { toast } from "react-toastify"
import FormInput from "../../components/FormInput"
import PrimaryButton from "../../components/PrimaryButton"
import { agentsApi } from "../../utils/api"

const AgentConnectionForm = ({ platform, onConnect, isConnecting }) => {
  const [apiKey, setApiKey] = useState("")
  const [agentId, setAgentId] = useState("")
  const [name, setName] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [direction, setDirection] = useState("inbound")
  const [focusedField, setFocusedField] = useState(null)

  // Bolna-specific state
  const [bolnaAgents, setBolnaAgents] = useState([])
  const [selectedBolnaAgent, setSelectedBolnaAgent] = useState(null)
  const [isFetchingBolnaAgents, setIsFetchingBolnaAgents] = useState(false)
  const [bolnaStep, setBolnaStep] = useState('api-key') // 'api-key' | 'select-agent'

  const isBolna = platform === 'bolna'

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isBolna && selectedBolnaAgent) {
      onConnect({
        platform: 'bolna',
        apiKey: apiKey,
        agentId: selectedBolnaAgent.agent_id,
        name: name || selectedBolnaAgent.agent_name || "Bolna Agent",
        direction,
        phoneNumber: direction === "inbound" ? phoneNumber : "",
      })
      return
    }

    onConnect({
      platform,
      apiKey: platform === 'custom' ? 'custom' : apiKey,
      agentId: platform === 'custom' ? 'custom' : agentId,
      name,
      customPrompt: platform === 'custom' ? customPrompt : "",
      direction,
      phoneNumber: direction === "inbound" ? phoneNumber : "",
    })
  }

  const fetchBolnaAgents = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Bolna API key first.')
      return
    }
    setIsFetchingBolnaAgents(true)
    try {
      const result = await agentsApi.listBolnaAgents({ api_key: apiKey })
      const agents = result.agents || []
      if (agents.length === 0) {
        toast.warning('No agents found for this API key.')
        return
      }
      setBolnaAgents(agents)
      setBolnaStep('select-agent')
    } catch (error) {
      toast.error('Failed to fetch Bolna agents. Check your API key.')
    } finally {
      setIsFetchingBolnaAgents(false)
    }
  }

  const handleBolnaAgentSelect = (agent) => {
    setSelectedBolnaAgent(agent)
    if (!name.trim()) {
      setName(agent.agent_name || '')
    }
  }

  const handleBackToApiKey = () => {
    setBolnaStep('api-key')
    setSelectedBolnaAgent(null)
    setBolnaAgents([])
  }

  const isFormValid = (() => {
    if (isBolna) {
      if (bolnaStep === 'api-key') return apiKey.trim()
      return selectedBolnaAgent && (direction === "inbound" ? phoneNumber.trim() : true)
    }
    return name.trim() &&
      (platform === 'custom'
        ? customPrompt.trim()
        : (apiKey.trim() && agentId.trim())) &&
      (direction === "inbound" ? phoneNumber.trim() : true)
  })()

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
      case 'bolna':
        return {
          apiKeyLabel: 'Bolna API Key (Bearer Token)',
          apiKeyPlaceholder: 'Enter your Bolna API key',
          agentIdLabel: 'Bolna Agent ID (UUID)',
          agentIdPlaceholder: 'Enter your Bolna Agent ID',
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

  // Bolna Step 1: API Key entry
  const renderBolnaApiKeyStep = () => (
    <>
      <FormInput
        label="Agent Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onFocus={() => setFocusedField("name")}
        onBlur={() => setFocusedField(null)}
        focused={focusedField === "name"}
        placeholder="My Bolna Agent (optional, auto-filled on selection)"
        disabled={isConnecting}
      />

      <FormInput
        label={labels.apiKeyLabel + " *"}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        onFocus={() => setFocusedField("apiKey")}
        onBlur={() => setFocusedField(null)}
        focused={focusedField === "apiKey"}
        placeholder={labels.apiKeyPlaceholder}
        type="password"
        disabled={isConnecting || isFetchingBolnaAgents}
      />

      <button
        type="button"
        onClick={fetchBolnaAgents}
        disabled={!apiKey.trim() || isFetchingBolnaAgents}
        className={`w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
          apiKey.trim() && !isFetchingBolnaAgents
            ? "bg-teal-400 hover:bg-teal-500 text-white shadow-lg shadow-teal-400/30"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isFetchingBolnaAgents ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Fetching Agents...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Fetch Agents
          </>
        )}
      </button>
    </>
  )

  // Bolna Step 2: Agent selection
  const renderBolnaAgentSelectStep = () => (
    <>
      <div className="flex items-center gap-2 mb-1">
        <button
          type="button"
          onClick={handleBackToApiKey}
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="Back to API key"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs text-gray-400">
          {bolnaAgents.length} agent{bolnaAgents.length !== 1 ? 's' : ''} found
        </span>
      </div>

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

      {/* Agent list */}
      <div>
        <label className="block text-white text-xs font-medium mb-1.5 ml-1">
          Select Agent *
        </label>
        <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
          {bolnaAgents.map((agent) => {
            const isSelected = selectedBolnaAgent?.agent_id === agent.agent_id
            return (
              <button
                key={agent.agent_id}
                type="button"
                onClick={() => handleBolnaAgentSelect(agent)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? "border-teal-400/50 bg-teal-500/10 shadow-sm shadow-teal-400/10"
                    : "border-gray-700 bg-dark-input hover:border-gray-600 hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white truncate">
                      {agent.agent_name || "Unnamed Agent"}
                    </div>
                    <div className="text-xs text-gray-500 font-mono truncate mt-0.5">
                      {agent.agent_id}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {agent.agent_status && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        agent.agent_status === 'active' || agent.agent_status === 'seeded'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-600/30 text-gray-400'
                      }`}>
                        {agent.agent_status}
                      </span>
                    )}
                    {isSelected && (
                      <svg className="w-4 h-4 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-300 ml-1">Direction</label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          className="w-full bg-dark-input border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-400 transition-colors"
          disabled={isConnecting}
        >
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
      </div>

      {direction === "inbound" && (
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
    </>
  )

  return (
                <div className="bg-dark-panel rounded-xl p-4 border border-gray-800/50 shadow-xl relative">
                  {isConnecting && (
                    <div className="absolute inset-0 bg-teal-400/10 animate-pulse rounded-xl" />
                  )}

                  <div className="mb-2.5 relative z-10 pl-1">
                    <h3 className="text-lg font-semibold text-white mb-0.5">
                      {isBolna && bolnaStep === 'select-agent' ? 'Select Bolna Agent' : 'Agent Details'}
                    </h3>
                    <p className="text-gray-400 text-[11px]">
                      {platform === 'custom'
                        ? 'Enter agent details and system prompt'
                        : isBolna && bolnaStep === 'api-key'
                        ? 'Enter your Bolna API key to fetch available agents'
                        : isBolna && bolnaStep === 'select-agent'
                        ? 'Choose an agent from your Bolna account'
                        : `Enter your ${platform?.toUpperCase()} credentials`}
                    </p>
                  </div>

      <div className="custom-scrollbar pr-1">
        <div className="space-y-3 relative z-10">
          {isBolna ? (
            bolnaStep === 'api-key' ? renderBolnaApiKeyStep() : renderBolnaAgentSelectStep()
          ) : (
            <>
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
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
              </div>

              {direction === "inbound" && (
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
            </>
          )}
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
