import { useState } from "react";
import { Book, Zap, Code, Settings, Phone, Mic, Database, ArrowLeft, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import VAPIIntegrationSection from "./sections/VAPIIntegration";
import ElevenLabsIntegrationSection from "./sections/ElevenLabsIntegration";
import CartesiaIntegrationSection from "./sections/CartesiaIntegration";
import QuickStartSection from "./sections/QuickStart";
import LiveKitIntegrationSection from "./sections/LiveKitIntegration";

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  const navigation = [
    {
      title: "Get Started",
      items: [
        { id: "introduction", label: "Introduction", icon: Book },
        { id: "quick-start", label: "Quick Start", icon: Zap },
        // { id: "architecture", label: "Architecture", icon: Database },
      ],
    },
    // {
    //   title: "Key Concepts",
    //   items: [
    //     { id: "agents", label: "Voice Agents", icon: Mic },
    //     { id: "test-suites", label: "Test Suites", icon: Code },
    //     { id: "evaluation", label: "Evaluation", icon: Settings },
    //   ],
    // },
    {
      title: "Platform Integrations",
      items: [
        { id: "vapi", label: "VAPI Integration", icon: Phone },
        { id: "elevenlabs", label: "ElevenLabs Integration", icon: Mic },
        { id: "cartesia", label: "Cartesia Line Integration", icon: Headphones },
        { id: "livekit", label: "LiveKit/Pipecat Integration", icon: Phone },
      ],
    },
    // {
    //   title: "API Reference",
    //   items: [
    //     { id: "extraction-api", label: "Extraction API", icon: Code },
    //     { id: "generation-api", label: "Generation API", icon: Code },
    //     { id: "simulation-api", label: "Simulation API", icon: Code },
    //     { id: "evaluation-api", label: "Evaluation API", icon: Code },
    //   ],
    // },
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

  const hasOnThisPage = !!OnThisPageData[activeSection];

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <div className="w-10 h-10 rounded-lg bg-teal-400/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-teal-400">V</span>
            </div>
            <h1 className="text-xl font-semibold text-white">
              Voice<span className="text-teal-400">Eval</span> Documentation
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/">
              <button className="px-4 py-2 bg-[#b61249] hover:bg-[#c91d5a] text-white rounded-lg text-sm font-medium transition-colors">
                Dashboard
              </button>
            </Link>
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
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left h-auto ${activeSection === item.id
                              ? "bg-teal-400/20 text-teal-400 font-medium border border-teal-400/50"
                              : "text-gray-400 hover:text-white hover:bg-dark-input"
                            }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="whitespace-normal leading-tight">{item.label}</span>
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
        {hasOnThisPage && (
          <aside className="w-64 border-l border-gray-800/50 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                On this page
              </h3>
              <OnThisPage section={activeSection} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

const OnThisPageData = {
  introduction: ["What is VoiceEval?", "The Problem We Solve", "Our Solution", "Key Features"],
  "quick-start": ["Connect Your Agent", "Extract Configuration", "Generate Test Suite", "Run Simulation", "View Results"],
  architecture: ["Pipeline Overview", "Technology Stack"],
};

// Introduction Section
const IntroductionSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4 text-white">
      Introduction
    </h1>

    <div className="bg-dark-panel border border-teal-400/30 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-3 text-teal-400">What is VoiceEval?</h2>
      <p className="text-gray-300">
        Voice AI agents are notoriously difficult to test at scale. We automate end-to-end testing, evaluation and monitoring for voice AI agents built on platforms like VAPI and Bolna, as well as frameworks such as LiveKit, Pipecat, or fully custom orchestrations.
      </p>
    </div>

    <h2 className="text-2xl font-bold mt-12 mb-4 text-white">Key Features</h2>
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
  <div className="bg-dark-panel border border-gray-800/50 rounded-lg p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="text-[#b61249]">{icon}</div>
      <h3 className="font-semibold text-white">{title}</h3>
    </div>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

const StepCard = ({ number, title, description, children }) => (
  <div className="relative pl-12">
    <div className="absolute left-0 top-0 w-8 h-8 bg-[#b61249] rounded-full flex items-center justify-center font-bold text-sm text-white">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-400 mb-4">{description}</p>
    {children}
  </div>
);

const CodeBlock = ({ language, children }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    toast.success("Code copied to clipboard");
  };

  return (
    <div className="bg-dark-input border border-gray-800/50 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-dark-panel border-b border-gray-800/50">
        <span className="text-xs text-gray-500 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-[#b61249] transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono">{children}</code>
      </pre>
    </div>
  );
};

// Architecture Section
const ArchitectureSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4 text-white">Architecture</h1>
    <p className="text-lg text-gray-400 mb-8">
      Understanding VoiceEval's 4-engine pipeline architecture.
    </p>

    <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Pipeline Overview</h2>
      <div className="space-y-6">
        <EngineCard
          number="1"
          title="Extraction Engine"
          color="teal"
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
          color="teal"
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
          color="teal"
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
          color="teal"
          description="Analyze results and generate performance metrics"
          features={[
            "Transcript analysis",
            "Success rate calculation",
            "Performance benchmarking"
          ]}
        />
      </div>
    </div>
  </div>
);

const EngineCard = ({ number, title, color, description, features }) => {
  const colorClasses = {
    teal: "bg-[#b61249]/20 border-[#b61249]/50 text-[#b61249]",
    blue: "bg-[#b61249]/20 border-[#b61249]/50 text-[#b61249]",
    purple: "bg-[#b61249]/20 border-[#b61249]/50 text-[#b61249]",
    orange: "bg-[#b61249]/20 border-[#b61249]/50 text-[#b61249]",
    green: "bg-[#b61249]/20 border-[#b61249]/50 text-[#b61249]",
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color] || colorClasses.teal}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-dark-input rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-white">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
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
  <div className="bg-dark-panel border border-gray-800/50 rounded-lg p-4">
    <h3 className="font-semibold mb-3 text-white">{title}</h3>
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
    <h1 className="text-4xl font-bold mb-4 text-white">{title}</h1>
    <p className="text-lg text-gray-400">Documentation coming soon...</p>
  </div>
);

// On This Page Component
const OnThisPage = ({ section }) => {
  const items = OnThisPageData[section] || [];

  return (
    <ul className="space-y-2 text-sm">
      {items.map((item, idx) => (
        <li key={idx}>
          <a href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-gray-400 hover:text-[#b61249] transition-colors">
            {item}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default DocsPage;
