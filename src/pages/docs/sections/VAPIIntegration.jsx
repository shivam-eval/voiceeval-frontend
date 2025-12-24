import { AlertCircle, CheckCircle, Copy, ExternalLink } from "lucide-react";

const VAPIIntegrationSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4">VAPI Integration</h1>
    <p className="text-lg text-gray-400 mb-8">
      Connect and test your VAPI voice agents with VoiceEval's comprehensive testing platform.
    </p>

    {/* Overview */}
    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-3 text-blue-300">Overview</h2>
      <p className="text-gray-300 mb-4">
        This guide walks you through setting up and testing your VAPI-based voice agents using VoiceEval's automated testing suite. Learn how to configure your integration and access powerful testing tools.
      </p>
      <a 
        href="https://docs.vapi.ai" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
      >
        View VAPI Documentation
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>

    {/* Prerequisites */}
    <h2 className="text-2xl font-bold mt-12 mb-4">Prerequisites</h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Active VAPI account with API access</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>VAPI API key (starts with <code className="text-purple-400">vapi_sk_...</code>)</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Assistant ID from your VAPI dashboard</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>VoiceEval account (sign up at voiceeval.ai)</span>
        </li>
      </ul>
    </div>

    {/* Step-by-Step Setup */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Setup Guide</h2>

    <div className="space-y-8">
      {/* Step 1 */}
      <SetupStep
        number="1"
        title="Get Your VAPI API Key"
        description="Navigate to your VAPI dashboard and retrieve your API credentials"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            1. Log in to your <a href="https://dashboard.vapi.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">VAPI Dashboard</a>
          </p>
          <p className="text-gray-400 text-sm">
            2. Navigate to <strong>Settings → API Keys</strong>
          </p>
          <p className="text-gray-400 text-sm">
            3. Copy your API key (it should start with <code className="text-purple-400">vapi_sk_</code>)
          </p>
          
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <strong>Security Note:</strong> Never share your API key publicly or commit it to version control. Store it securely in environment variables.
            </div>
          </div>
        </div>
      </SetupStep>

      {/* Step 2 */}
      <SetupStep
        number="2"
        title="Find Your Assistant ID"
        description="Locate the unique identifier for the voice agent you want to test"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            1. In your VAPI dashboard, go to <strong>Assistants</strong>
          </p>
          <p className="text-gray-400 text-sm">
            2. Click on the assistant you want to test
          </p>
          <p className="text-gray-400 text-sm">
            3. Copy the Assistant ID from the URL or settings page
          </p>
          
          <CodeBlock language="text">
{`Example Assistant ID: asst_1234567890abcdef`}
          </CodeBlock>
        </div>
      </SetupStep>

      {/* Step 3 */}
      <SetupStep
        number="3"
        title="Connect in VoiceEval"
        description="Add your VAPI credentials to VoiceEval platform"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            1. Navigate to <strong>Connect Agent</strong> in VoiceEval
          </p>
          <p className="text-gray-400 text-sm">
            2. Select <strong>VAPI</strong> as your platform
          </p>
          <p className="text-gray-400 text-sm">
            3. Enter your credentials:
          </p>
          
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">VAPI API Key</label>
              <input 
                type="password" 
                placeholder="vapi_sk_..." 
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Assistant ID</label>
              <input 
                type="text" 
                placeholder="asst_..." 
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300"
                disabled
              />
            </div>
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
              Connect Agent
            </button>
          </div>
        </div>
      </SetupStep>

      {/* Step 4 */}
      <SetupStep
        number="4"
        title="Verify Connection"
        description="VoiceEval will automatically extract and validate your agent configuration"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Once connected, VoiceEval will:
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Extract your agent's system prompt and configuration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Identify available tools and functions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Analyze conversation flows</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Generate initial test suite</span>
            </li>
          </ul>

          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-200">
              <strong>Success!</strong> Your VAPI agent is now connected and ready for testing.
            </div>
          </div>
        </div>
      </SetupStep>
    </div>

    {/* API Integration */}
    <h2 className="text-2xl font-bold mt-12 mb-6">API Integration</h2>
    <p className="text-gray-400 mb-6">
      You can also integrate VAPI agents programmatically using our REST API.
    </p>

    <h3 className="text-xl font-semibold mb-4">Extract Agent Configuration</h3>
    <CodeBlock language="bash">
{`curl -X POST https://api.voiceeval.ai/api/v1/extract \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_VOICEEVAL_API_KEY" \\
  -d '{
    "platform": "vapi",
    "api_key": "vapi_sk_...",
    "agent_id": "asst_..."
  }'`}
    </CodeBlock>

    <h3 className="text-xl font-semibold mt-8 mb-4">Response Example</h3>
    <CodeBlock language="json">
{`{
  "status": "success",
  "agent_id": "asst_1234567890",
  "config": {
    "system_prompt": "You are a helpful customer service agent...",
    "model": "gpt-4",
    "voice": {
      "provider": "elevenlabs",
      "voice_id": "rachel"
    },
    "tools": [
      {
        "name": "check_order_status",
        "description": "Check the status of a customer order",
        "parameters": {...}
      }
    ]
  },
  "extraction_timestamp": "2024-12-24T10:30:00Z"
}`}
    </CodeBlock>

    {/* Testing Your Agent */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Testing Your VAPI Agent</h2>
    <p className="text-gray-400 mb-6">
      After connecting your agent, you can run comprehensive tests:
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <TestingFeatureCard
        title="Automated Test Generation"
        description="AI-powered test suite creation based on your agent's capabilities"
      />
      <TestingFeatureCard
        title="Real Voice Simulation"
        description="Test with actual voice calls using telephony integration"
      />
      <TestingFeatureCard
        title="Edge Case Testing"
        description="Automatically identify and test edge cases and error scenarios"
      />
      <TestingFeatureCard
        title="Performance Metrics"
        description="Track response times, success rates, and conversation quality"
      />
    </div>

    {/* Troubleshooting */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Troubleshooting</h2>
    <div className="space-y-4">
      <TroubleshootingItem
        issue="Invalid API Key"
        solution="Ensure your API key starts with 'vapi_sk_' and has not expired. Generate a new key from your VAPI dashboard if needed."
      />
      <TroubleshootingItem
        issue="Assistant Not Found"
        solution="Verify the Assistant ID is correct and that the assistant exists in your VAPI account. Check for typos in the ID."
      />
      <TroubleshootingItem
        issue="Connection Timeout"
        solution="Check your network connection and ensure VAPI's API is accessible. Try again in a few moments."
      />
      <TroubleshootingItem
        issue="Insufficient Permissions"
        solution="Ensure your API key has the necessary permissions to access assistant configurations. You may need to regenerate your key with full access."
      />
    </div>

    {/* Best Practices */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Best Practices</h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start gap-3">
          <span className="text-purple-400 font-bold">→</span>
          <span><strong>Test Regularly:</strong> Run tests after every significant change to your agent's configuration</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-purple-400 font-bold">→</span>
          <span><strong>Use Staging:</strong> Test with a staging/development assistant before testing production agents</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-purple-400 font-bold">→</span>
          <span><strong>Monitor Metrics:</strong> Track performance trends over time to identify regressions</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-purple-400 font-bold">→</span>
          <span><strong>Secure Credentials:</strong> Store API keys in environment variables, never in code</span>
        </li>
      </ul>
    </div>

    {/* Next Steps */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Next Steps</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <NextStepCard
        title="Generate Tests"
        description="Create comprehensive test suites for your agent"
        link="/docs/test-suites"
      />
      <NextStepCard
        title="Run Simulations"
        description="Execute real voice conversations with your agent"
        link="/docs/simulation-api"
      />
      <NextStepCard
        title="View Analytics"
        description="Analyze performance and improve your agent"
        link="/docs/evaluation"
      />
    </div>
  </div>
);

// Helper Components
const SetupStep = ({ number, title, description, children }) => (
  <div className="relative pl-12">
    <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 mb-4 text-sm">{description}</p>
    {children}
  </div>
);

const CodeBlock = ({ language, children }) => (
  <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
      <span className="text-xs text-gray-500 font-mono">{language}</span>
      <button className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1">
        <Copy className="w-3 h-3" />
        Copy
      </button>
    </div>
    <pre className="p-4 overflow-x-auto">
      <code className="text-sm text-gray-300 font-mono">{children}</code>
    </pre>
  </div>
);

const TestingFeatureCard = ({ title, description }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
    <h4 className="font-semibold mb-2 text-gray-200">{title}</h4>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

const TroubleshootingItem = ({ issue, solution }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
    <h4 className="font-semibold mb-2 text-red-400 flex items-center gap-2">
      <AlertCircle className="w-4 h-4" />
      {issue}
    </h4>
    <p className="text-sm text-gray-400">{solution}</p>
  </div>
);

const NextStepCard = ({ title, description, link }) => (
  <a 
    href={link}
    className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-500/50 transition-colors group"
  >
    <h4 className="font-semibold mb-2 text-gray-200 group-hover:text-purple-400 transition-colors">{title}</h4>
    <p className="text-sm text-gray-400">{description}</p>
  </a>
);

export default VAPIIntegrationSection;
