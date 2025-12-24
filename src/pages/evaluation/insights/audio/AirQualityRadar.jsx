import { ResponsiveRadar } from "@nivo/radar";
import { Volume2 } from "lucide-react";
import { darkTheme } from "../../const";

/* =========================
   Dummy Radar Data
========================= */
const radarData = [
  { metric: "Word Error", score: 100 },
  { metric: "Audio Technical", score: 100 },
  { metric: "Tts Naturalness", score: 88 },
];

const AudioQualityRadar = () => {
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

          /* Shape */
          curve="linearClosed"
          gridLevels={4}
          gridShape="linear"
          gridLabelOffset={20}

          /* Polygon */
          colors={["#2dd4bf"]}
          fillOpacity={0.25}
          borderWidth={2}
          borderColor="#2dd4bf"

          /* Dots */
          enableDots
          dotSize={6}
          dotColor="#ffffff"
          dotBorderWidth={2}
          dotBorderColor="#2dd4bf"

          /* Radial axis (0–100%) */
          radialAxisStart={{
            tickSize: 4,
            tickPadding: 6,
            tickRotation: 0,
            tickValues: [0, 25, 50, 75, 100],
            tickFormat: (v) => `${v}%`,
          }}

          /* Disable tooltip (matches screenshot) */
          sliceTooltip={() => null}

          /* Theme — makes axis & labels VISIBLE */
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
