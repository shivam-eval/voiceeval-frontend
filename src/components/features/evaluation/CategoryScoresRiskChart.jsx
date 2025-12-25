const CategoryScoresRiskChart = () => {
  const cats = [
    { name: "Accuracy", val: 0.456, failed: true },
    { name: "Task Completion", val: 1.0, failed: false },
    { name: "Latency", val: 16460.68, failed: false },
    { name: "Audio Quality", val: 0.628, failed: false },
    { name: "Conversation Quality", val: 0.75, failed: false },
    { name: "Endpointing", val: 1046667, failed: true },
    { name: "Cost", val: 0.051, failed: false },
    { name: "Persona", val: 1.0, failed: false },
  ]
  const maxY = 1046667
  const pts = cats.map((c, i) => {
    const x = (i / (cats.length - 1)) * 100
    const y = 100 - (Math.min(c.val, maxY) / maxY) * 100
    return `${x},${y}`
  }).join(" ")
  return (
    <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
      <div className="relative h-48">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-700/60" />
        <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-700/60" />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={pts} fill="none" stroke="#60a5fa" strokeWidth="0.6" />
          {cats.map((c, i) => {
            const x = (i / (cats.length - 1)) * 100
            const y = 100 - (Math.min(c.val, maxY) / maxY) * 100
            return (
              <circle
                key={c.name}
                cx={x}
                cy={y}
                r="1.2"
                fill={c.failed ? "#ef4444" : "#60a5fa"}
                stroke={c.failed ? "#7f1d1d" : "#1d4ed8"}
                strokeWidth="0.4"
              />
            )
          })}
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-xs text-gray-400">
          {cats.map((c) => (
            <span key={c.name} className="w-20 text-center">{c.name}</span>
          ))}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400">Failed categories highlighted; magnitude indicates risk dominance.</div>
    </div>
  )
}

export default CategoryScoresRiskChart
