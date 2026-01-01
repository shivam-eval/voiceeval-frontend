import { ResponsivePie } from "@nivo/pie";
import { darkTheme } from "../../const";

/* =========================
   Helpers
========================= */
const formatUSD = (v) => `$${(v ?? 0).toFixed(4)}`;

/* =========================
   Component
========================= */
const CostDonut = ({ data }) => {
  if (!Array.isArray(data)) return null;

  // Remove zero / negative values to avoid empty arcs
  const filteredData = data.filter(
    (d) => typeof d.value === "number" && d.value > 0
  );

  if (!filteredData.length) return null;

  return (
    <div className="bg-[#0b1f26] border border-teal-500/20 rounded-xl p-6">
      <h3 className="text-white text-sm font-medium mb-4">
        Cost Distribution
      </h3>

      <div style={{ height: 220 }}>
        <ResponsivePie
          data={filteredData}
          innerRadius={0.65}
          padAngle={1}
          cornerRadius={4}
          colors={["#5EEAD4", "#2dd4bf", "#14b8a6"]}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          activeOuterRadiusOffset={6}

          tooltip={({ datum }) => (
            <div className="bg-[#020617] px-3 py-2 rounded-lg border border-gray-700 text-xs">
              <div className="text-gray-400">{datum.id}</div>
              <div className="text-teal-300 font-semibold">
                {formatUSD(datum.value)}
              </div>
            </div>
          )}

          theme={{
            ...darkTheme,
            tooltip: {
              container: {
                background: "#020617",
                color: "#fff",
                fontSize: 12,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default CostDonut;
