const bars = [
  { label: "Happy paths", pct: 100, count: 20 },
  { label: "Edge cases", pct: 100, count: 7 },
  { label: "Failure paths", pct: 100, count: 3 },
]

const PathCoverageStackedBars = () => {
  return (
    <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-4 mb-3">
          <div className="w-40 text-sm text-gray-300">{b.label}</div>
          <div className="flex-1">
            <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-400 to-green-400 w-pct-100" />
            </div>
          </div>
          <div className="w-24 text-right text-sm text-white">{b.count} paths</div>
          <div className="w-16 text-sm text-green-400 font-semibold">{b.pct}%</div>
        </div>
      ))}
      <div className="mt-2 text-xs text-gray-400">All conversation path types fully covered.</div>
    </div>
  )
}

export default PathCoverageStackedBars
