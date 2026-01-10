import { CheckCircle, ExternalLink } from "lucide-react";

const VAPIIntegrationSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4 text-white">VAPI Integration</h1>
    <p className="text-lg text-gray-400 mb-8">
      Integrate your VAPI voice assistants with VoiceEval to run structured
      simulations and evaluate agent behavior across key quality dimensions.
    </p>

    {/* Overview */}
    <div className="bg-dark-panel border border-[#b61249]/30 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-3 text-[#b61249]">Overview</h2>
      <p className="text-gray-300 mb-4">
        This guide explains how to connect an existing VAPI assistant to
        VoiceEval. Once connected, VoiceEval securely reads your assistant
        configuration and enables automated evaluation across accuracy,
        latency, conversation quality, endpointing, cost, and persona
        alignment.
      </p>
      <a
        href="https://docs.vapi.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-[#b61249] hover:text-[#d42d5f] text-sm transition-colors"
      >
        View VAPI Documentation
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>

    {/* Prerequisites */}
    <h2 className="text-2xl font-bold mt-12 mb-4 text-white">Prerequisites</h2>
    <div className="bg-dark-panel border border-gray-800/50 rounded-lg p-6 mb-8">
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Active VAPI account with at least one assistant created</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>VAPI API key with access to assistant configurations</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Assistant ID of the agent you want to evaluate</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>VoiceEval account with integration access</span>
        </li>
      </ul>
    </div>

    {/* Required Information */}
    <h2 className="text-2xl font-bold mt-12 mb-4 text-white">
      Information Required by VoiceEval
    </h2>
    <div className="bg-dark-panel border border-gray-800/50 rounded-lg p-6 mb-8">
      <ul className="space-y-3 text-gray-300">
        <li>
          <strong>Assistant ID</strong> — Identifies the VAPI assistant to be
          evaluated.
        </li>
        <li>
          <strong>VAPI API Key</strong> — Used securely by VoiceEval to read
          assistant configuration and metadata.
        </li>
      </ul>
    </div>

    {/* Where to Find Info */}
    <h2 className="text-2xl font-bold mt-12 mb-4 text-white">
      Where to Find This Information
    </h2>
    <div className="bg-dark-panel border border-gray-800/50 rounded-lg p-6 mb-8">
      <p className="text-gray-300 mb-4">
        <strong>Assistant ID</strong>
      </p>
      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400 ml-4 mb-6">
        <li>Open the VAPI dashboard</li>
        <li>Navigate to Assistants</li>
        <li>Select the assistant you want to evaluate</li>
        <li>Copy the Assistant ID from the assistant details page</li>
      </ol>

      <p className="text-gray-300 mb-4">
        <strong>API Key</strong>
      </p>
      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400 ml-4">
        <li>Open Settings → API Keys in the VAPI dashboard</li>
        <li>Create or copy an existing API key</li>
        <li>Ensure the key has access to assistant configurations</li>
      </ol>
    </div>

    {/* Connect in VoiceEval */}
    <h2 className="text-2xl font-bold mt-12 mb-6 text-white">
      Connect Your Assistant in VoiceEval
    </h2>
    <div className="space-y-6">
      <div className="bg-dark-input border border-gray-800/50 rounded-lg p-6 space-y-4">
        <p className="text-gray-400 text-sm">
          1. Open <strong className="text-white">Connect Agent</strong> in the VoiceEval dashboard
        </p>
        <p className="text-gray-400 text-sm">
          2. Select <strong className="text-white">VAPI</strong> as the platform
        </p>
        <p className="text-gray-400 text-sm">
          3. Enter your VAPI API Key and Assistant ID
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              VAPI API Key
            </label>
            <input
              type="password"
              placeholder="vapi_sk_..."
              className="w-full px-4 py-2 bg-dark-panel border border-gray-700 rounded-lg text-gray-300"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Assistant ID
            </label>
            <input
              type="text"
              placeholder="asst_..."
              className="w-full px-4 py-2 bg-dark-panel border border-gray-700 rounded-lg text-gray-300"
              disabled
            />
          </div>
          <button className="w-full px-4 py-2 bg-[#b61249] hover:bg-[#c91d5a] text-white rounded-lg font-medium transition-colors">
            Connect Agent
          </button>
        </div>
      </div>
    </div>

    {/* What VoiceEval Does */}
    <h2 className="text-2xl font-bold mt-12 mb-4 text-white">
      What VoiceEval Handles Automatically
    </h2>
    <div className="bg-dark-panel border border-gray-800/50 rounded-lg p-6 mb-8">
      <ul className="space-y-3 text-gray-300">
        <li>System prompt and assistant instructions</li>
        <li>Model and voice configuration</li>
        <li>Tool and function definitions</li>
        <li>Conversation flow structure</li>
        <li>Evaluation-ready representations for testing and simulation</li>
      </ul>
    </div>

    {/* What You Can Evaluate */}
    <h2 className="text-2xl font-bold mt-12 mb-6 text-white">
      What You Can Evaluate with VoiceEval
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <EvaluationFeature title="Accuracy & Intent Understanding" />
      <EvaluationFeature title="Latency & Responsiveness" />
      <EvaluationFeature title="Conversation Quality & Context Handling" />
      <EvaluationFeature title="Endpointing & Turn Management" />
      <EvaluationFeature title="Cost & Resource Usage" />
      <EvaluationFeature title="Persona & Tone Consistency" />
    </div>

    {/* Next Steps */}
    <h2 className="text-2xl font-bold mt-12 mb-6 text-white">Next Steps</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <NextStepCard
        title="Generate Test Suites"
        description="Create structured tests from your assistant configuration"
        link="/docs/test-suites"
      />
      <NextStepCard
        title="Run Simulations"
        description="Evaluate assistant behavior using automated conversations"
        link="/docs/simulation-api"
      />
      <NextStepCard
        title="View Evaluation Results"
        description="Analyze metrics, transcripts, and insights"
        link="/docs/evaluation"
      />
    </div>
  </div>
);

// Helper Components
const EvaluationFeature = ({ title }) => (
  <div className="bg-dark-panel border border-gray-800/50 rounded-lg p-4">
    <h4 className="font-semibold text-white">{title}</h4>
  </div>
);

const NextStepCard = ({ title, description, link }) => (
  <a
    href={link}
    className="bg-dark-panel border border-gray-800/50 rounded-lg p-4 hover:border-[#b61249]/50 transition-colors group"
  >
    <h4 className="font-semibold mb-2 text-white group-hover:text-[#b61249] transition-colors">
      {title}
    </h4>
    <p className="text-sm text-gray-400">{description}</p>
  </a>
);

export default VAPIIntegrationSection;
