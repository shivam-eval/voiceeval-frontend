import { ResponsiveRadar } from "@nivo/radar";
import { Sparkles } from "lucide-react";
import { darkTheme } from "../../const";

/* =========================
   Helpers
========================= */

const humanizeMetricName = (name) => {
  const map = {
    persona_consistency: "Persona Consistency",
    tone_appropriateness: "Tone Appropriateness",
    region_appropriate_language: "Region Appropriate Language",
    behavior_trait_alignment: "Behavior Trait Alignment",
  };
  return map[name] || name.replace(/_/g, " ");
};

const toPercent = (v) =>
  typeof v === "number" ? Math.round(v * 100) : 0;

/* =========================
   Component
========================= */

const PersonaAlignmentRadar = ({ metrics = [] }) => {
  if (!metrics.length) return null;

  const radarData = metrics.map((m) => ({
    metric: humanizeMetricName(m.name),
    score: toPercent(m.value),
  }));

  return (
    <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-teal-400" size={18} />
        <h3 className="text-lg font-semibold text-white">
          Persona Alignment Radar
        </h3>
      </div>

      {/* Radar */}
      <div style={{ height: 380 }}>
        <ResponsiveRadar
          data={radarData}
          keys={["score"]}
          indexBy="metric"
          maxValue={100}
          margin={{ top: 50, right: 80, bottom: 50, left: 80 }}

          curve="linearClosed"
          borderWidth={2}
          borderColor="#2dd4bf"
          colors={["#2dd4bf"]}
          fillOpacity={0.25}

          enableDots
          dotSize={6}
          dotColor="#ffffff"
          dotBorderWidth={2}
          dotBorderColor="#2dd4bf"

          gridLevels={4}
          gridShape="linear"
          gridLabelOffset={18}

          radialAxisStart={{
            tickSize: 0,
            tickValues: [0, 25, 50, 75, 100],
            tickFormat: (v) => `${v}%`,
          }}

          theme={{
            ...darkTheme,
            grid: {
              line: {
                stroke: "#1f2937",
                strokeDasharray: "2 4",
              },
            },
            labels: {
              text: {
                fill: "#9ca3af",
                fontSize: 12,
              },
            },
          }}

          sliceTooltip={() => null}
        />
      </div>
    </div>
  );
};

export default PersonaAlignmentRadar;
