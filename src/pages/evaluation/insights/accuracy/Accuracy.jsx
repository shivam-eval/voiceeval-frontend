import { useState } from "react";
import {
  Target,
  CheckCircle,
  Clock,
  Volume2,
  MessageSquare,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import AccuracyBar from "./AccuracyBar";
import VoiceAccuracySteps from "./VoiceAccuracySteps";
import MetricCard from "./MetricCard";
import DetailedMetric from "../../../../components/DetailedMetric";
import CriticalAlert from "../../../../components/CriticAlert";
import MetricBar from "../../../../components/MetricBar";



export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState("accuracy");

  const tabs = [
    { id: "overview", label: "Overview", icon: Target },
    { id: "accuracy", label: "Accuracy", icon: Target },
    { id: "completion", label: "Task Completion", icon: CheckCircle },
    { id: "latency", label: "Latency", icon: Clock },
    { id: "audio", label: "Audio Quality", icon: Volume2 },
    { id: "conversation", label: "Conversation Quality", icon: MessageSquare },
    { id: "endpoints", label: "Endpointing", icon: TrendingUp, alert: true },
    { id: "cost", label: "Cost", icon: DollarSign },
  ];

  const summaryMetrics = [
    { label: 'Semantic Accuracy Rate', value: 90.9, threshold: 80 },
    { label: 'Keyword Match Accuracy', value: 91.7, threshold: 90 },
    { label: 'Semantic Similarity', value: 0.0, threshold: 75 },
    { label: 'Intent Classification Accuracy', value: 0.0, threshold: 85 },
  ];

  const detailedMetrics = [
    { label: 'Semantic Accuracy Rate', value: 90.9, threshold: 80.0, time: '31087.08ms', status: 'passed' },
    { label: 'Keyword Match Accuracy', value: 91.7, threshold: 90.0, time: '57.15ms', status: 'passed' },
    { label: 'Semantic Similarity', value: 0.0, threshold: 75.0, time: '0.02ms', status: 'failed' },
    { label: 'Intent Classification Accuracy', value: 0.0, threshold: 85.0, time: '0.02ms', status: 'failed' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Metric */}
        <MetricCard
          icon={Target}
          title="Accuracy"
          value={50}
          passed={2}
          failed={2}
          status="critical"
        />

        <CriticalAlert
          title="Critical: Zero Intent Understanding"
          description="The agent is matching keywords without semantic comprehension."
          metrics={[
            { icon: TrendingUp, label: "Semantic Similarity", value: "0%" },
            { icon: Target, label: "Intent Classification", value: "0%" },
          ]}
        />

        <div className="mt-4 grid grid-cols-2">
          <AccuracyBar/>
      <VoiceAccuracySteps/>
        </div>

        {/* Summary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {summaryMetrics.map((metric, idx) => (
            <MetricBar key={idx} {...metric} />
          ))}
        </div>

        {/* Detailed Metrics Section */}
        <div className="pt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-teal-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-teal-400 rounded-full" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">Detailed Metrics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {detailedMetrics.map((metric, idx) => (
              <DetailedMetric key={idx} {...metric} />
            ))}
          </div>
        </div>

      
      </div>
    </div>
  );
}