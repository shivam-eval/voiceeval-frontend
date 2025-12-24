import {
  User,
  MessageSquare,
  Globe,
  Heart,
  ShieldCheck,
} from "lucide-react";
import InsightHeaderCard from '../../../../components/InsightHeaderCard';
import StatCard from '../../../../components/StatCard';
import PersonaDetailedMetrics from "./PersonaDetailedMetric";
import PersonaAlignmentRadar from "./PersonaRadar";

/* =========================
   Dummy Persona Metrics
========================= */
const PERSONA_STATS = [
  {
    icon: User,
    title: "Consistency",
    value: "100%",
    subtitle: "Persona maintained throughout",
  },
  {
    icon: MessageSquare,
    title: "Tone",
    value: "100%",
    subtitle: "Appropriate communication style",
  },
  {
    icon: Globe,
    title: "Regional Language",
    value: "100%",
    subtitle: "Culturally appropriate",
  },
  {
    icon: Heart,
    title: "Behavior",
    value: "100%",
    subtitle: "Trait alignment",
  },
];

const PersonaOverview = () => {
  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <InsightHeaderCard
        icon={User}
        title="Persona"
        description="Evaluates persona consistency and tone appropriateness"
        score={100}
        passedCount={4}
        failedCount={0}
        theme="teal"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PERSONA_STATS.map((item, idx) => (
          <StatCard
            key={idx}
            icon={item.icon}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
          />
        ))}
      </div>

      {/* Persona Stability Panel */}
      <div className="bg-[#0b1f26] border border-teal-500/30 rounded-xl p-6 flex items-start gap-4">
        <div className="p-3 rounded-lg bg-teal-500/20 text-teal-400">
          <ShieldCheck size={28} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-teal-300 mb-1">
            Persona Stable & Consistent
          </h3>
          <p className="text-teal-200/80">
            The agent maintained consistent personality, tone, and cultural
            appropriateness throughout the entire conversation. Brand safety
            is assured.
          </p>
        </div>
      </div>
      <PersonaAlignmentRadar/>
<PersonaDetailedMetrics/>
    </div>
  );
};

export default PersonaOverview;
