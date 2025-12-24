import { AlertCircle, CheckCircle, Copy, ExternalLink, Code, Zap, Terminal } from "lucide-react";

const CartesiaIntegrationSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4">Cartesia Line Integration</h1>
    <p className="text-lg text-gray-400 mb-8">
      Build and test intelligent, low-latency Voice Agents with Cartesia Line's background reasoning capabilities.
    </p>

    {/* Overview */}
    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-3 text-cyan-300">What is Cartesia Line?</h2>
      <p className="text-gray-300 mb-4">
        <strong>Cartesia Line</strong> is a platform for building real-time Voice Agents with code. Build production-ready Voice Agents that understand context, integrate with your systems, and respond in real-time.
      </p>
      <p className="text-gray-300 mb-4">
        Line handles the complex audio infrastructure while you focus on your Agent's reasoning and personality. Build your Agent with the Line SDK, and Line will deploy it, managing all audio infrastructure and orchestration for you.
      </p>
      <a 
        href="https://docs.cartesia.ai" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
      >
        View Cartesia Documentation
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>

    {/* Key Features */}
    <h2 className="text-2xl font-bold mt-12 mb-4">Key Features</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <FeatureCard
        icon={<Code className="w-5 h-5" />}
        title="Code-First Development"
        description="Build agents with full control using Python or JavaScript"
      />
      <FeatureCard
        icon={<Zap className="w-5 h-5" />}
        title="Low-Latency Audio"
        description="Ultra-fast speech processing with Ink (STT) and Sonic (TTS)"
      />
      <FeatureCard
        icon={<Terminal className="w-5 h-5" />}
        title="Custom Reasoning"
        description="Write custom logic, connect LLMs, databases, and APIs"
      />
      <FeatureCard
        icon={<CheckCircle className="w-5 h-5" />}
        title="Managed Infrastructure"
        description="Auto-scaling runtime with built-in audio orchestration"
      />
    </div>

    {/* Prerequisites */}
    <h2 className="text-2xl font-bold mt-12 mb-4">Prerequisites</h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Active Cartesia account with Line access</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Cartesia API key from your dashboard</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Line CLI installed (<code className="text-purple-400">npm install -g @cartesia/line-cli</code>)</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>Deployed Line agent with agent ID</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span>VoiceEval account for testing</span>
        </li>
      </ul>
    </div>

    {/* Setup Guide */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Setup Guide</h2>

    <div className="space-y-8">
      {/* Step 1 */}
      <SetupStep
        number="1"
        title="Install Line CLI"
        description="Set up the Cartesia Line command-line interface"
      >
        <div className="space-y-4">
          <CodeBlock language="bash">
{`# Install Line CLI globally
npm install -g @cartesia/line-cli

# Verify installation
line --version

# Login to Cartesia
line login`}
          </CodeBlock>
        </div>
      </SetupStep>

      {/* Step 2 */}
      <SetupStep
        number="2"
        title="Create Your Agent"
        description="Build a Line agent using the SDK or templates"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            <strong>Option 1: Use a Template</strong>
          </p>
          <CodeBlock language="bash">
{`# Create from template
line create my-agent --template customer-service

# Navigate to agent directory
cd my-agent`}
          </CodeBlock>

          <p className="text-gray-400 text-sm mt-6">
            <strong>Option 2: Text to Agent (AI-Generated)</strong>
          </p>
          <CodeBlock language="bash">
{`# Generate agent from natural language
line generate "Create a customer service agent that can check order status and process returns"

# Review and customize generated code
line edit`}
          </CodeBlock>

          <p className="text-gray-400 text-sm mt-6">
            <strong>Option 3: Build from Scratch</strong>
          </p>
          <CodeBlock language="python">
{`# agent.py
from cartesia import LineAgent, Context

class MyAgent(LineAgent):
    def __init__(self):
        super().__init__(
            name="Customer Service Agent",
            voice="sonic-english-female-1",
            system_prompt="You are a helpful customer service agent..."
        )
    
    async def on_user_message(self, message: str, context: Context):
        # Custom reasoning logic
        if "order" in message.lower():
            order_status = await self.check_order(context.user_id)
            return f"Your order status is: {order_status}"
        
        # Use LLM for general queries
        response = await self.llm_respond(message, context)
        return response
    
    async def check_order(self, user_id: str):
        # Connect to your database or API
        return "Shipped - Arriving tomorrow"`}
          </CodeBlock>
        </div>
      </SetupStep>

      {/* Step 3 */}
      <SetupStep
        number="3"
        title="Deploy Your Agent"
        description="Deploy to Cartesia's managed infrastructure"
      >
        <div className="space-y-4">
          <CodeBlock language="bash">
{`# Deploy agent
line deploy

# Get deployment info
line status

# View logs
line logs --follow`}
          </CodeBlock>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex gap-3 mt-4">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <strong>Note:</strong> After deployment, you'll receive an Agent ID. Save this for VoiceEval integration.
            </div>
          </div>
        </div>
      </SetupStep>

      {/* Step 4 */}
      <SetupStep
        number="4"
        title="Get API Credentials"
        description="Retrieve your Cartesia API key and Agent ID"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            <strong>API Key:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400 ml-4">
            <li>Log in to <a href="https://cartesia.ai/dashboard" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Cartesia Dashboard</a></li>
            <li>Navigate to <strong>Settings → API Keys</strong></li>
            <li>Copy your API key or create a new one</li>
          </ol>

          <p className="text-gray-400 text-sm mt-6">
            <strong>Agent ID:</strong>
          </p>
          <CodeBlock language="bash">
{`# List your deployed agents
line list

# Output:
# Agent ID: agent_abc123xyz
# Name: Customer Service Agent
# Status: Running
# Deployed: 2024-12-24`}
          </CodeBlock>
        </div>
      </SetupStep>

      {/* Step 5 */}
      <SetupStep
        number="5"
        title="Connect in VoiceEval"
        description="Integrate your Cartesia agent with VoiceEval"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            1. Navigate to <strong>Connect Agent</strong> in VoiceEval
          </p>
          <p className="text-gray-400 text-sm">
            2. Select <strong>Cartesia Line</strong> as your platform
          </p>
          <p className="text-gray-400 text-sm">
            3. Enter your credentials:
          </p>
          
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cartesia API Key</label>
              <input 
                type="password" 
                placeholder="Your Cartesia API key" 
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Agent ID</label>
              <input 
                type="text" 
                placeholder="agent_..." 
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300"
                disabled
              />
            </div>
            <button className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium transition-colors">
              Connect Agent
            </button>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex gap-3 mt-4">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-200">
              <strong>Success!</strong> Your Cartesia Line agent is now connected to VoiceEval.
            </div>
          </div>
        </div>
      </SetupStep>
    </div>

    {/* Extracting Agent Configuration */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Extracting Agent Configuration</h2>
    <p className="text-gray-400 mb-6">
      VoiceEval can extract your Line agent's configuration, including system prompts, custom logic, and tool integrations.
    </p>

    <h3 className="text-xl font-semibold mb-4">Using the API</h3>
    <CodeBlock language="bash">
{`curl -X POST https://api.voiceeval.ai/api/v1/extract \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_VOICEEVAL_API_KEY" \\
  -d '{
    "platform": "cartesia",
    "api_key": "your_cartesia_api_key",
    "agent_id": "agent_abc123xyz"
  }'`}
    </CodeBlock>

    <h3 className="text-xl font-semibold mt-8 mb-4">Response Example</h3>
    <CodeBlock language="json">
{`{
  "status": "success",
  "agent_id": "agent_abc123xyz",
  "config": {
    "name": "Customer Service Agent",
    "voice": "sonic-english-female-1",
    "system_prompt": "You are a helpful customer service agent...",
    "custom_logic": {
      "handlers": [
        "on_user_message",
        "on_tool_call",
        "on_context_update"
      ],
      "tools": [
        {
          "name": "check_order",
          "description": "Check order status for a user",
          "parameters": ["user_id"]
        }
      ]
    },
    "integrations": {
      "llm": "gpt-4",
      "database": "postgresql",
      "apis": ["order-api", "inventory-api"]
    }
  },
  "extraction_timestamp": "2024-12-24T10:30:00Z"
}`}
    </CodeBlock>

    {/* Architecture */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Line Architecture</h2>
    <p className="text-gray-400 mb-6">
      Understanding how Cartesia Line handles voice agent infrastructure:
    </p>

    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
      <div className="space-y-6">
        <ArchitectureLayer
          title="Your Agent Code"
          description="Custom reasoning, LLM integration, tool calls, business logic"
          color="cyan"
        />
        <div className="flex justify-center">
          <div className="w-px h-8 bg-gray-700"></div>
        </div>
        <ArchitectureLayer
          title="Line Runtime"
          description="Managed execution environment with auto-scaling"
          color="blue"
        />
        <div className="flex justify-center">
          <div className="w-px h-8 bg-gray-700"></div>
        </div>
        <ArchitectureLayer
          title="Audio Infrastructure"
          description="Ink (STT) + Sonic (TTS) + Audio orchestration"
          color="purple"
        />
        <div className="flex justify-center">
          <div className="w-px h-8 bg-gray-700"></div>
        </div>
        <ArchitectureLayer
          title="User Connection"
          description="WebRTC, Phone, or WebSocket"
          color="green"
        />
      </div>
    </div>

    {/* Testing with VoiceEval */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Testing with VoiceEval</h2>
    <p className="text-gray-400 mb-6">
      Once connected, VoiceEval provides comprehensive testing for your Line agents:
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <TestingFeatureCard
        title="Custom Logic Testing"
        description="Test your agent's custom reasoning and business logic"
      />
      <TestingFeatureCard
        title="Tool Call Validation"
        description="Verify tool integrations and API connections work correctly"
      />
      <TestingFeatureCard
        title="Latency Monitoring"
        description="Measure response times and audio processing latency"
      />
      <TestingFeatureCard
        title="Context Management"
        description="Test conversation context handling and memory"
      />
    </div>

    {/* Developer Tools */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Developer Tools</h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Line CLI Commands</h3>
      <div className="space-y-3 text-sm">
        <CLICommand
          command="line create <name>"
          description="Create a new agent from template"
        />
        <CLICommand
          command="line generate <prompt>"
          description="Generate agent code from natural language"
        />
        <CLICommand
          command="line deploy"
          description="Deploy agent to production"
        />
        <CLICommand
          command="line test"
          description="Test agent locally before deployment"
        />
        <CLICommand
          command="line logs"
          description="View real-time agent logs"
        />
        <CLICommand
          command="line rollback"
          description="Rollback to previous deployment"
        />
      </div>
    </div>

    {/* Troubleshooting */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Troubleshooting</h2>
    <div className="space-y-4">
      <TroubleshootingItem
        issue="Deployment failed"
        solution="Check your agent code for syntax errors. Run 'line test' locally first. Verify your API key has deployment permissions."
      />
      <TroubleshootingItem
        issue="Agent not responding"
        solution="Check agent status with 'line status'. View logs with 'line logs'. Ensure your agent's runtime dependencies are properly configured."
      />
      <TroubleshootingItem
        issue="High latency"
        solution="Optimize your custom logic. Reduce external API calls. Consider caching frequently accessed data. Use async/await properly."
      />
      <TroubleshootingItem
        issue="Tool calls failing"
        solution="Verify tool function signatures match the schema. Check API credentials for external services. Review error logs for specific failure reasons."
      />
    </div>

    {/* Best Practices */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Best Practices</h2>
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
      <ul className="space-y-3 text-gray-300">
        <li className="flex items-start gap-3">
          <span className="text-cyan-400 font-bold">→</span>
          <span><strong>Test Locally First:</strong> Use 'line test' to validate your agent before deploying</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-cyan-400 font-bold">→</span>
          <span><strong>Version Control:</strong> Track agent versions and use 'line rollback' if issues arise</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-cyan-400 font-bold">→</span>
          <span><strong>Monitor Performance:</strong> Use VoiceEval to track latency and success rates</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-cyan-400 font-bold">→</span>
          <span><strong>Optimize Logic:</strong> Keep custom reasoning fast and efficient for low-latency responses</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-cyan-400 font-bold">→</span>
          <span><strong>Environment Variables:</strong> Use environment variables for API keys and sensitive data</span>
        </li>
      </ul>
    </div>

    {/* Next Steps */}
    <h2 className="text-2xl font-bold mt-12 mb-6">Next Steps</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <NextStepCard
        title="Generate Tests"
        description="Create test suites for your Line agent"
        link="/docs/test-suites"
      />
      <NextStepCard
        title="Run Simulations"
        description="Test with automated voice conversations"
        link="/docs/simulation-api"
      />
      <NextStepCard
        title="View Analytics"
        description="Monitor performance and optimize your agent"
        link="/docs/evaluation"
      />
    </div>
  </div>
);

// Helper Components
const SetupStep = ({ number, title, description, children }) => (
  <div className="relative pl-12">
    <div className="absolute left-0 top-0 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-sm">
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
      <code className="text-sm text-gray-300 font-mono whitespace-pre">{children}</code>
    </pre>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="text-cyan-400">{icon}</div>
      <h4 className="font-semibold text-gray-200">{title}</h4>
    </div>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

const ArchitectureLayer = ({ title, description, color }) => {
  const colorClasses = {
    cyan: "border-cyan-500 bg-cyan-600/10",
    blue: "border-blue-500 bg-blue-600/10",
    purple: "border-purple-500 bg-purple-600/10",
    green: "border-green-500 bg-green-600/10",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <h4 className="font-semibold mb-1 text-gray-200">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
};

const TestingFeatureCard = ({ title, description }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
    <h4 className="font-semibold mb-2 text-gray-200">{title}</h4>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

const CLICommand = ({ command, description }) => (
  <div className="flex items-start gap-3">
    <code className="text-cyan-400 font-mono text-xs bg-gray-950 px-2 py-1 rounded flex-shrink-0">
      {command}
    </code>
    <span className="text-gray-400">{description}</span>
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
    className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-cyan-500/50 transition-colors group"
  >
    <h4 className="font-semibold mb-2 text-gray-200 group-hover:text-cyan-400 transition-colors">{title}</h4>
    <p className="text-sm text-gray-400">{description}</p>
  </a>
);

export default CartesiaIntegrationSection;
