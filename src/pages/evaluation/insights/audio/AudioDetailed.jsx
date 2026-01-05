import { ResponsiveRadar } from "@nivo/radar";
import { Volume2 } from "lucide-react";
import { darkTheme } from "../../const";

/* =========================
   Helpers
========================= */
const humanizeRadarLabel = (name) => {
  if (!name) return "Unknown Metric";
  if (typeof name === 'string' && name.includes(' ') && name[0] === name[0].toUpperCase()) return name;
  const map = {
    word_error_rate: "Word Error",
    audio_technical_quality: "Audio Technical",
    tts_naturalness: "TTS Naturalness",
    average_pitch: "Average Pitch",
    voice_quality_index: "Voice Quality"
  };
  return map[name] || String(name).replace(/_/g, " ");
};

/* =========================
   Audio Quality Radar
========================= */
const AudioQualityRadar = ({ response }) => {
  if (!response?.metrics) return null;

  const radarData = response.metrics.map((m) => ({
    metric: humanizeRadarLabel(m.name || m.metric_name),
    score: m.score !== null && m.score !== undefined
      ? Math.round(m.score * 100)
      : 100 // Default to 100 for null scores
  }));

  return (
    <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Volume2 className="text-teal-400" size={18} />
        <h3 className="text-lg font-semibold text-white">
          Audio Quality Radar
        </h3>
      </div>

      {/* Radar */}
      <div style={{ height: 360 }}>
        <ResponsiveRadar
          data={radarData}
          keys={["score"]}
          indexBy="metric"
          maxValue={100}
          margin={{ top: 50, right: 90, bottom: 50, left: 90 }}

          curve="linearClosed"
          gridLevels={4}
          gridShape="linear"
          gridLabelOffset={20}

          colors={["#2dd4bf"]}
          fillOpacity={0.25}
          borderWidth={2}
          borderColor="#2dd4bf"

          enableDots
          dotSize={6}
          dotColor="#ffffff"
          dotBorderWidth={2}
          dotBorderColor="#2dd4bf"

          radialAxisStart={{
            tickSize: 4,
            tickPadding: 6,
            tickValues: [0, 25, 50, 75, 100],
            tickFormat: (v) => `${v}%`,
          }}

          sliceTooltip={() => null}

          theme={{
            ...darkTheme,
            grid: {
              line: {
                stroke: "#334155",
                strokeDasharray: "3 4",
              },
            },
            labels: {
              text: {
                fill: "#9CA3AF",
                fontSize: 12,
              },
            },
            axis: {
              ticks: {
                text: {
                  fill: "#9CA3AF",
                  fontSize: 11,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AudioQualityRadar;
