import { CheckCircle, Zap, Mic, Settings, BarChart3 } from "lucide-react";

const QuickStartSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4">Quick Start</h1>
    <p className="text-lg text-gray-400 mb-8">
      Get started with VoiceEval in minutes. This guide walks you through the
      core workflow of connecting, testing, and improving your voice AI agents.
    </p>

    {/* What VoiceEval Does */}
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 mb-10">
      <h2 className="text-xl font-semibold mb-3 text-purple-300">
        How VoiceEval Works
      </h2>
      <p className="text-gray-300">
        VoiceEval is a testing and evaluation platform for voice AI agents.
        It connects to your existing agent, understands its configuration,
        simulates conversations, and evaluates performance across multiple
        quality dimensions.
      </p>
    </div>

    {/* Step 1 */}
    <Step
      number="1"
      icon={<Mic className="w-5 h-5" />}
      title="Connect Your Voice Agent"
      description="Select your platform and securely connect your existing voice agent."
      points={[
        "Choose your agent platform (VAPI, ElevenLabs, Cartesia, LiveKit)",
        "Provide required credentials such as API key and Agent ID",
        "No changes to your agent code or deployment",
      ]}
    />

    {/* Step 2 */}
    <Step
      number="2"
      icon={<Settings className="w-5 h-5" />}
      title="Configuration Understanding"
      description="VoiceEval automatically understands how your agent works."
      points={[
        "Reads system prompts and agent instructions",
        "Identifies conversation flows and decision paths",
        "Maps tools, intents, and response logic",
      ]}
    />

    {/* Step 3 */}
    <Step
      number="3"
      icon={<Zap className="w-5 h-5" />}
      title="Generate Test Scenarios"
      description="Automatically generate test cases based on your agent behavior."
      points={[
        "Happy path and edge case coverage",
        "Multi-step conversation flows",
        "Failure and fallback scenarios",
      ]}
    />

    {/* Step 4 */}
    <Step
      number="4"
      icon={<Mic className="w-5 h-5" />}
      title="Run Voice Simulations"
      description="Execute tests using realistic voice conversations."
      points={[
        "Human-like speech simulation",
        "Turn-based conversation execution",
        "Support for noise, pauses, and timing variations",
      ]}
    />

    {/* Step 5 */}
    <Step
      number="5"
      icon={<BarChart3 className="w-5 h-5" />}
      title="Review Evaluation Results"
      description="Analyze how your agent performed and where it can improve."
      points={[
        "Accuracy, latency, and conversation quality metrics",
        "Step-level transcript analysis",
        "Actionable insights for improvement",
      ]}
    />

    {/* Outcome */}
    <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 mt-12">
      <h2 className="text-xl font-semibold mb-3 text-green-300">
        You’re Ready
      </h2>
      <p className="text-gray-300">
        Once these steps are complete, VoiceEval becomes part of your regular
        development workflow—helping you validate changes, prevent regressions,
        and continuously improve your voice AI agents.
      </p>
    </div>
  </div>
);

const Step = ({ number, icon, title, description, points }) => (
  <div className="relative pl-14 mb-10">
    <div className="absolute left-0 top-0 w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
      {number}
    </div>

    <h3 className="text-2xl font-semibold mb-2 flex items-center gap-3">
      <span className="text-purple-400">{icon}</span>
      {title}
    </h3>

    <p className="text-gray-400 mb-4">{description}</p>

    <ul className="space-y-2 text-gray-300">
      {points.map((p, i) => (
        <li key={i} className="flex items-start gap-3">
          <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default QuickStartSection;
