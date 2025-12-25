import {
  LayoutGrid,
  Target,
  CheckCircle2,
  Clock,
  Volume2,
  MessageSquare,
  Activity,
  DollarSign,
  User,
  XCircle,
} from "lucide-react";

const CATEGORY_LABELS = {
  accuracy: "Accuracy",
  task_completion: "Task Completion",
  latency: "Latency",
  audio: "Audio",
  conversation: "Conversation",
  endpointing: "Endpointing",
  cost: "Cost",
  persona: "Persona",
};

const TABS_CONFIG = [
  { id: "", label: "Overview", icon: LayoutGrid },
  { id: "accuracy", label: "Accuracy", icon: Target },
  { id: "task_completion", label: "Task Completion", icon: CheckCircle2 },
  { id: "latency", label: "Latency", icon: Clock },
  { id: "audio", label: "Audio Quality", icon: Volume2 },
  { id: "conversation_quality", label: "Conversation Quality", icon: MessageSquare },
  { id: "endpointing", label: "Endpointing", icon: Activity },
  { id: "cost", label: "Cost", icon: DollarSign },
  { id: "persona", label: "Persona", icon: User },
];

const InsightTabs = ({ active, onChange, categoryScores = [] }) => {
  return (
    <div className="w-full bg-[#0b1220] border border-gray-800/50 rounded-xl p-1.5 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 min-w-max">
        {TABS_CONFIG.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const score = categoryScores.find((c) => c.category === tab.id)?.score ?? 100;
          const isPassed = score >= 80;

          return (
            <div key={tab.id} className="flex items-center">
              {/* Vertical Separator after Overview */}
              {index === 1 && (
                <div className="h-6 w-[1px] bg-gray-700/50 mx-2" />
              )}

              <button
                onClick={() => onChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-accent-green text-gray-900 font-medium shadow-lg shadow-[#00ff88]/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
                  }
                `}
              >
                <Icon size={18} className={isActive ? "text-gray-900" : "text-inherit"} />
                <span className="whitespace-nowrap text-sm">{tab.label}</span>

                {/* Status Indicator (except for Overview) */}
                {tab.id !== "" && (
                  <div className="ml-1">
                    {isPassed ? (
                      <CheckCircle2
                        size={14}
                        className={isActive ? "text-gray-900" : "text-emerald-500"}
                      />
                    ) : (
                      <XCircle
                        size={14}
                        className={isActive ? "text-gray-900" : "text-red-500"}
                      />
                    )}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightTabs;
