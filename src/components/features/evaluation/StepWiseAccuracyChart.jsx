const DEFAULT_SEMANTIC = [0.95, 0.93, 0.91, 0.89, 0.87, 0.42, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
const DEFAULT_INTENT = [0.92, 0.90, 0.88, 0.86, 0.84, 0.40, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

const StepWiseAccuracyChart = ({ stepsSemantic, stepsIntent }) => {
  const sem = Array.isArray(stepsSemantic) && stepsSemantic.length ? stepsSemantic : DEFAULT_SEMANTIC
  const int = Array.isArray(stepsIntent) && stepsIntent.length ? stepsIntent : DEFAULT_INTENT
  const zeros = []
  sem.forEach((v, i) => { if (v <= 0.001) zeros.push({ type: "semantic", idx: i }) })
  int.forEach((v, i) => { if (v <= 0.001) zeros.push({ type: "intent", idx: i }) })
  return (
    <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
      <div className="relative h-64">
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0,1,2,3,4].map((i) => <div key={i} className="border-t border-gray-700/50 h-20p" />)}
        </div>
        <div className="absolute inset-0 flex items-end justify-between px-6">
          {Array.from({ length: sem.length }).map((_, i) => (
            <span key={i} className="text-xs text-gray-500">{i + 1}</span>
          ))}
        </div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            className="line-semantic"
            points={sem.map((v, i) => {
              const x = (i / (sem.length - 1)) * 100
              const y = 100 - v * 100
              return `${x},${y}`
            }).join(" ")}
            fill="none"
          />
          <polyline
            className="line-intent"
            points={int.map((v, i) => {
              const x = (i / (int.length - 1)) * 100
              const y = 100 - v * 100
              return `${x},${y}`
            }).join(" ")}
            fill="none"
          />
          {stepsSemantic.map((v, i) => {
            const x = (i / (stepsSemantic.length - 1)) * 100
            const y = 100 - v * 100
            return <circle key={`s-${i}`} cx={x} cy={y} r="1.2" className="dot-semantic" />
          })}
          {stepsIntent.map((v, i) => {
            const x = (i / (stepsIntent.length - 1)) * 100
            const y = 100 - v * 100
            return <circle key={`i-${i}`} cx={x} cy={y} r="1.2" className="dot-intent" />
          })}
          {zeros.map((z) => {
            const arr = z.type === "semantic" ? stepsSemantic : stepsIntent
            const x = (z.idx / (arr.length - 1)) * 100
            const y = 100 - arr[z.idx] * 100
            return <circle key={`z-${z.type}-${z.idx}`} cx={x} cy={y} r="2.2" className="zero-point" />
          })}
        </svg>
      </div>
      <div className="mt-2 text-xs text-gray-400">Semantic and intent accuracy with zero-collapse highlights.</div>
    </div>
  )
}

export default StepWiseAccuracyChart
