import { CheckCircle, ExternalLink } from "lucide-react";

const ElevenLabsIntegrationSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4">ElevenLabs Integration</h1>
    <p className="text-lg text-gray-400 mb-8">
      Integrate your ElevenLabs Conversational AI agents with VoiceEval to run
      structured tests, simulations, and detailed evaluations.
    </p>

    {/* Overview */}
    <div className="bg-gradient-to-br from-orange-900/20 to-purple-900/20 border border-orange-500/30 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-3 text-orange-300">Overview</h2>
      <p className="text-gray-300 mb-4">
        This guide explains how to connect an existing ElevenLabs conversational
        agent to VoiceEval. Once connected, VoiceEval can securely read your
        agent’s configuration and enable automated evaluation across accuracy,
        latency, conversation quality, endpointing, cost, and persona alignment.
      </p>
      <a
        href="https://elevenlabs.io/docs"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm"
      >
        View ElevenLabs Documentation
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>

    {/* Prerequisites */}
    <h2 className="text-2xl font-bold mt-12 mb-4">Prerequisites</h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Active ElevenLabs account with Conversational AI enabled</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>At least one deployed ElevenLabs conversational agent</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>ElevenLabs API key with access to Conversational AI</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>VoiceEval account with integration access</span>
        </li>
      </ul>
    </div>

    {/* Required Information */}
    <h2 className="text-2xl font-bold mt-12 mb-4">
      Information Required by VoiceEval
    </h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
      <ul className="space-y-3 text-gray-300">
        <li>
          <strong>Agent ID</strong> — Identifies the ElevenLabs conversational
          agent to be evaluated.
        </li>
        <li>
          <strong>ElevenLabs API Key</strong> — Used securely by VoiceEval to read
          agent configuration and metadata.
        </li>
      </ul>
    </div>

    {/* Where to Find Info */}
    <h2 className="text-2xl font-bold mt-12 mb-4">
      Where to Find This Information
    </h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
      <p className="text-gray-300 mb-4">
        <strong>Agent ID</strong>
      </p>
      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400 ml-4 mb-6">
        <li>Open the ElevenLabs dashboard</li>
        <li>Navigate to Conversational AI → Agents</li>
        <li>Select the agent you want to evaluate</li>
        <li>Copy the Agent ID from the agent details page or URL</li>
      </ol>

      <p className="text-gray-300 mb-4">
        <strong>API Key</strong>
      </p>
      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400 ml-4">
        <li>Open Settings → API Keys in the ElevenLabs dashboard</li>
        <li>Create or copy an existing API key</li>
        <li>Ensure the key has Conversational AI permissions</li>
      </ol>
    </div>

    {/* What VoiceEval Does */}
    <h2 className="text-2xl font-bold mt-12 mb-4">
      What VoiceEval Handles Automatically
    </h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
      <ul className="space-y-3 text-gray-300">
        <li>System prompt and agent instructions</li>
        <li>Agent metadata and configuration</li>
        <li>Workflow structure and transitions</li>
        <li>Voice and transcription configuration</li>
        <li>Evaluation-ready representations for testing and simulation</li>
      </ul>
    </div>

    {/* No Changes Required */}
    <h2 className="text-2xl font-bold mt-12 mb-4">
      No Changes Required on Your Side
    </h2>
    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
      <ul className="space-y-3 text-green-200">
        <li>No changes to agent prompts or logic</li>
        <li>No redeployment of your agent</li>
        <li>No webhooks or manual data uploads</li>
        <li>No SDK or code modifications</li>
      </ul>
    </div>

    {/* Connect in VoiceEval */}
    <h2 className="text-2xl font-bold mt-12 mb-6">
      Connect Your Agent in VoiceEval
    </h2>
    <div className="space-y-6">
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 space-y-4">
        <p className="text-gray-400 text-sm">
          1. Open <strong>Connect Agent</strong> in the VoiceEval dashboard
        </p>
        <p className="text-gray-400 text-sm">
          2. Select <strong>ElevenLabs</strong> as the platform
        </p>
        <p className="text-gray-400 text-sm">
          3. Enter your ElevenLabs API Key and Agent ID
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              ElevenLabs API Key
            </label>
            <input
              type="password"
              placeholder="Your ElevenLabs API key"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Agent ID
            </label>
            <input
              type="text"
              placeholder="agent_..."
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300"
              disabled
            />
          </div>
          <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors">
            Connect Agent
          </button>
        </div>
      </div>
    </div>

    {/* What You Can Evaluate */}
    <h2 className="text-2xl font-bold mt-12 mb-6">
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
    <h2 className="text-2xl font-bold mt-12 mb-6">Next Steps</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <NextStepCard
        title="Generate Test Suites"
        description="Create structured tests from your agent configuration"
        link="/docs/test-suites"
      />
      <NextStepCard
        title="Run Simulations"
        description="Evaluate agent behavior using automated conversations"
        link="/docs/simulation-api"
      />
      <NextStepCard
        title="View Evaluation Results"
        description="Analyze detailed metrics and transcripts"
        link="/docs/evaluation"
      />
    </div>
  </div>
);

// Helper Components
const EvaluationFeature = ({ title }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
    <h4 className="font-semibold text-gray-200">{title}</h4>
  </div>
);

const NextStepCard = ({ title, description, link }) => (
  <a
    href={link}
    className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-orange-500/50 transition-colors group"
  >
    <h4 className="font-semibold mb-2 text-gray-200 group-hover:text-orange-400 transition-colors">
      {title}
    </h4>
    <p className="text-sm text-gray-400">{description}</p>
  </a>
);

export default ElevenLabsIntegrationSection;
