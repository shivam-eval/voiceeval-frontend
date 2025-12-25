const DeterministicFlowExecution = () => {
  const nodes = [
    { label: "Task Completion Rate", value: "100%" },
    { label: "Sequential Task Accuracy", value: "100%" },
    { label: "Step Validation Pass Rate", value: "100%" },
    { label: "Flow Path Coverage", value: "100%" },
  ]
  return (
    <div className="bg-dark-input border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between gap-6">
        {nodes.map((n, idx) => (
          <div key={n.label} className="flex items-center gap-6">
            <div className="flow-node">
              <div className="flow-node-header">{n.value}</div>
              <div className="flow-node-label">{n.label}</div>
            </div>
            {idx < nodes.length - 1 && (
              <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-green-400 font-semibold">All nodes executed successfully</div>
    </div>
  )
}

export default DeterministicFlowExecution
