import { useState } from "react";
import { ChevronRight, Search, Book, Zap, Code, Settings, Phone, Mic, Database } from "lucide-react";
import VAPIIntegrationSection from "./sections/VAPIIntegration";
import ElevenLabsIntegrationSection from "./sections/ElevenLabsIntegration";
import CartesiaIntegrationSection from "./sections/CartesiaIntegration";

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    {
      title: "Get Started",
      items: [
        { id: "introduction", label: "Introduction", icon: Book },
        { id: "quick-start", label: "Quick Start", icon: Zap },
        { id: "architecture", label: "Architecture", icon: Database },
      ],
    },
    {
      title: "Key Concepts",
      items: [
        { id: "agents", label: "Voice Agents", icon: Mic },
        { id: "test-suites", label: "Test Suites", icon: Code },
        { id: "evaluation", label: "Evaluation", icon: Settings },
      ],
    },
    {
      title: "Platform Integrations",
      items: [
        { id: "vapi", label: "VAPI Integration", icon: Phone },
        { id: "elevenlabs", label: "ElevenLabs Integration", icon: Mic },
        { id: "cartesia", label: "Cartesia Line Integration", icon: Mic },
        { id: "livekit", label: "LiveKit Integration", icon: Phone },
      ],
    },
    {
      title: "API Reference",
      items: [
        { id: "extraction-api", label: "Extraction API", icon: Code },
        { id: "generation-api", label: "Generation API", icon: Code },
        { id: "simulation-api", label: "Simulation API", icon: Code },
        { id: "evaluation-api", label: "Evaluation API", icon: Code },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "introduction":
        return <IntroductionSection />;
      case "quick-start":
        return <QuickStartSection />;
      case "architecture":
        return <ArchitectureSection />;
      case "agents":
        return <AgentsSection />;
      case "test-suites":
        return <TestSuitesSection />;
      case "evaluation":
        return <EvaluationSection />;
      case "vapi":
        return <VAPIIntegration />;
      case "elevenlabs":
        return <ElevenLabsIntegration />;
      case "cartesia":
        return <CartesiaIntegration />;
      case "livekit":
        return <LiveKitIntegrationSection />;
      case "extraction-api":
        return <ExtractionAPISection />;
      case "generation-api":
        return <GenerationAPISection />;
      case "simulation-api":
        return <SimulationAPISection />;
      case "evaluation-api":
        return <EvaluationAPISection />;
      default:
        return <IntroductionSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VE</span>
            </div>
            <h1 className="text-xl font-semibold">VoiceEval Documentation</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-sm focus:outline-none focus:border-purple-500 w-64"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400">
                Ctrl K
              </kbd>
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors">
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-gray-800/50 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
          <nav className="p-6 space-y-6">
            {navigation.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeSection === item.id
                              ? "bg-purple-600/20 text-purple-400 font-medium"
                              : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-12 py-8 max-w-4xl">
          {renderContent()}
        </main>

        {/* Right Sidebar - On This Page */}
        <aside className="w-64 border-l border-gray-800/50 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              On this page
            </h3>
            <OnThisPage section={activeSection} />
          </div>
        </aside>
      </div>
    </div>
  );
};

// Introduction Section
const IntroductionSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
      Introduction
    </h1>
    <p className="text-lg text-gray-400 mb-8">
      Testing for AI Voice Agents. Launch in minutes not weeks by ensuring your agents deliver a seamless experience in every conversational scenario.
    </p>

    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-3 text-purple-300">What is VoiceEval?</h2>
      <p className="text-gray-300">
        VoiceEval is an <strong>AI voice agent testing and evaluation platform</strong> that automates the process of testing conversational AI systems across different platforms (VAPI, ElevenLabs, Cartesia, LiveKit).
      </p>
    </div>

    <h2 className="text-2xl font-bold mt-12 mb-4">The Problem We Solve</h2>
    <p className="text-gray-400 mb-4">Testing voice agents is currently:</p>
    <ul className="space-y-3 text-gray-400">
      <li className="flex items-start gap-3">
        <span className="text-red-400 mt-1">⏰</span>
        <span><strong>Time-consuming:</strong> Manual testing of conversation flows</span>
      </li>
      <li className="flex items-start gap-3">
        <span className="text-red-400 mt-1">🎯</span>
        <span><strong>Incomplete:</strong> Hard to cover all edge cases and paths</span>
      </li>
      <li className="flex items-start gap-3">
        <span className="text-red-400 mt-1">📊</span>
        <span><strong>Unscalable:</strong> Cannot run regression tests on every deploy</span>
      </li>
      <li className="flex items-start gap-3">
        <span className="text-red-400 mt-1">🔄</span>
        <span><strong>Platform-specific:</strong> Different tools for different platforms</span>
      </li>
    </ul>

    <h2 className="text-2xl font-bold mt-12 mb-4">Our Solution</h2>
    <p className="text-gray-400 mb-6">
      VoiceEval provides an <strong>end-to-end automated testing pipeline</strong>:
    </p>
    
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between text-sm">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500 rounded-lg flex items-center justify-center mb-2">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-gray-300">Extract Config</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600" />
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-purple-600/20 border border-purple-500 rounded-lg flex items-center justify-center mb-2">
            <Code className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-gray-300">Generate Flows</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600" />
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-orange-600/20 border border-orange-500 rounded-lg flex items-center justify-center mb-2">
            <Mic className="w-6 h-6 text-orange-400" />
          </div>
          <span className="text-gray-300">Simulate</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600" />
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-green-600/20 border border-green-500 rounded-lg flex items-center justify-center mb-2">
            <Settings className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-gray-300">Evaluate</span>
        </div>
      </div>
    </div>

    <h2 className="text-2xl font-bold mt-12 mb-4">Key Features</h2>
    <div className="grid grid-cols-2 gap-4 mb-8">
      <FeatureCard
        icon={<Mic className="w-5 h-5" />}
        title="Simulate Real Environments"
        description="Test your voice agents in realistic settings with background noise, accents, and complex scenarios"
      />
      <FeatureCard
        icon={<Settings className="w-5 h-5" />}
        title="Gain Actionable Insights"
        description="Get detailed analytics and metrics to improve your prompts and agent performance"
      />
      <FeatureCard
        icon={<Zap className="w-5 h-5" />}
        title="Rapid Integration"
        description="Connect your agents in minutes with our simple API and SDK integrations"
      />
      <FeatureCard
        icon={<Code className="w-5 h-5" />}
        title="Developer-Friendly APIs"
        description="Build custom workflows with our comprehensive REST API and webhooks"
      />
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="text-purple-400">{icon}</div>
      <h3 className="font-semibold text-gray-200">{title}</h3>
    </div>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

// Quick Start Section
const QuickStartSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4">Quick Start</h1>
    <p className="text-lg text-gray-400 mb-8">
      Get started with VoiceEval in 5 minutes. Follow these steps to test your first voice agent.
    </p>

    <div className="space-y-8">
      <StepCard
        number="1"
        title="Connect Your Agent"
        description="Choose your platform and provide API credentials"
      >
        <CodeBlock language="bash">
{`# Navigate to Connect Agent
# Select your platform (VAPI, ElevenLabs, Cartesia, LiveKit)
# Enter your API key and Agent ID`}
        </CodeBlock>
      </StepCard>

      <StepCard
        number="2"
        title="Extract Configuration"
        description="VoiceEval automatically extracts your agent's configuration"
      >
        <CodeBlock language="json">
{`{
  "platform": "vapi",
  "api_key": "vapi_sk_...",
  "agent_id": "asst_123"
}`}
        </CodeBlock>
      </StepCard>

      <StepCard
        number="3"
        title="Generate Test Suite"
        description="AI-powered test generation creates comprehensive test scenarios"
      >
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-sm text-gray-400">
          <p>✓ Conversation flow analysis</p>
          <p>✓ Edge case generation</p>
          <p>✓ Multi-path testing</p>
        </div>
      </StepCard>

      <StepCard
        number="4"
        title="Run Simulation"
        description="Execute tests with real voice interactions"
      >
        <CodeBlock language="bash">
{`POST /api/v1/simulation/start
{
  "test_suite_id": "test_001",
  "agent_phone": "+1234567890"
}`}
        </CodeBlock>
      </StepCard>

      <StepCard
        number="5"
        title="View Results"
        description="Analyze performance metrics and conversation transcripts"
      >
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Success Rate:</span>
            <span className="text-green-400 font-semibold">94%</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Avg Response Time:</span>
            <span className="text-blue-400 font-semibold">1.2s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tests Passed:</span>
            <span className="text-purple-400 font-semibold">47/50</span>
          </div>
        </div>
      </StepCard>
    </div>
  </div>
);

const StepCard = ({ number, title, description, children }) => (
  <div className="relative pl-12">
    <div className="absolute left-0 top-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 mb-4">{description}</p>
    {children}
  </div>
);

const CodeBlock = ({ language, children }) => (
  <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
      <span className="text-xs text-gray-500 font-mono">{language}</span>
      <button className="text-xs text-gray-400 hover:text-gray-200">Copy</button>
    </div>
    <pre className="p-4 overflow-x-auto">
      <code className="text-sm text-gray-300 font-mono">{children}</code>
    </pre>
  </div>
);

// Architecture Section
const ArchitectureSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4">Architecture</h1>
    <p className="text-lg text-gray-400 mb-8">
      Understanding VoiceEval's 4-engine pipeline architecture.
    </p>

    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6">Pipeline Overview</h2>
      <div className="space-y-6">
        <EngineCard
          number="1"
          title="Extraction Engine"
          color="blue"
          description="Extract agent configuration, prompts, and workflows from platforms"
          features={[
            "Platform API integration",
            "Configuration parsing",
            "Tool and function extraction"
          ]}
        />
        <EngineCard
          number="2"
          title="Generation Engine"
          color="purple"
          description="Generate conversation flows and comprehensive test suites"
          features={[
            "LLM-powered flow generation",
            "Edge case identification",
            "Multi-path test creation"
          ]}
        />
        <EngineCard
          number="3"
          title="Simulation Engine"
          color="orange"
          description="Execute test conversations with real voice interactions"
          features={[
            "Telephony integration (Epicode)",
            "TTS/STT processing",
            "Real-time audio streaming"
          ]}
        />
        <EngineCard
          number="4"
          title="Evaluation Engine"
          color="green"
          description="Analyze results and generate performance metrics"
          features={[
            "Transcript analysis",
            "Success rate calculation",
            "Performance benchmarking"
          ]}
        />
      </div>
    </div>

    <h2 className="text-2xl font-bold mt-12 mb-4">Technology Stack</h2>
    <div className="grid grid-cols-2 gap-4">
      <TechCard title="Backend" items={["FastAPI", "Python 3.13+", "Poetry"]} />
      <TechCard title="Frontend" items={["React", "Vite", "TailwindCSS"]} />
      <TechCard title="Audio" items={["ElevenLabs TTS", "Gladia STT", "Silero VAD"]} />
      <TechCard title="Platforms" items={["VAPI", "ElevenLabs", "Cartesia", "LiveKit"]} />
    </div>
  </div>
);

const EngineCard = ({ number, title, color, description, features }) => {
  const colorClasses = {
    blue: "bg-blue-600/20 border-blue-500 text-blue-400",
    purple: "bg-purple-600/20 border-purple-500 text-purple-400",
    orange: "bg-orange-600/20 border-orange-500 text-orange-400",
    green: "bg-green-600/20 border-green-500 text-green-400",
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-300 mb-4">{description}</p>
          <ul className="space-y-1 text-sm text-gray-400">
            {features.map((feature, idx) => (
              <li key={idx}>• {feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const TechCard = ({ title, items }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
    <h3 className="font-semibold mb-3 text-gray-200">{title}</h3>
    <ul className="space-y-1 text-sm text-gray-400">
      {items.map((item, idx) => (
        <li key={idx}>• {item}</li>
      ))}
    </ul>
  </div>
);

// Placeholder sections (to be implemented)
const AgentsSection = () => <PlaceholderSection title="Voice Agents" />;
const TestSuitesSection = () => <PlaceholderSection title="Test Suites" />;
const EvaluationSection = () => <PlaceholderSection title="Evaluation" />;
const LiveKitIntegrationSection = () => <PlaceholderSection title="LiveKit Integration" />;
const ExtractionAPISection = () => <PlaceholderSection title="Extraction API" />;
const GenerationAPISection = () => <PlaceholderSection title="Generation API" />;
const SimulationAPISection = () => <PlaceholderSection title="Simulation API" />;
const EvaluationAPISection = () => <PlaceholderSection title="Evaluation API" />;

// Import integration sections
const VAPIIntegration = VAPIIntegrationSection;
const ElevenLabsIntegration = ElevenLabsIntegrationSection;
const CartesiaIntegration = CartesiaIntegrationSection;

const PlaceholderSection = ({ title }) => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4">{title}</h1>
    <p className="text-lg text-gray-400">Documentation coming soon...</p>
  </div>
);

// On This Page Component
const OnThisPage = ({ section }) => {
  const sections = {
    introduction: ["What is VoiceEval?", "The Problem We Solve", "Our Solution", "Key Features"],
    "quick-start": ["Connect Your Agent", "Extract Configuration", "Generate Test Suite", "Run Simulation", "View Results"],
    architecture: ["Pipeline Overview", "Technology Stack"],
  };

  const items = sections[section] || [];

  return (
    <ul className="space-y-2 text-sm">
      {items.map((item, idx) => (
        <li key={idx}>
          <a href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-gray-400 hover:text-purple-400 transition-colors">
            {item}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default DocsPage;
