const SummaryMetric = ({ mainText, sideText, successRate }) => {
  const displayScore = typeof successRate === 'number'
    ? (successRate > 1 ? Math.round(successRate) : Math.round(successRate * 100))
    : 0;

  return (
    <div className="bg-[#030712] rounded-xl p-6 border border-teal-500/20">
      <div className="text-gray-400 text-sm mb-2">{sideText}</div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${displayScore >= 70 ? 'bg-teal-400' : 'bg-red-400'}`}></div>
        <span className="text-3xl font-bold text-white">{displayScore}%</span>
      </div>
      <div className={`flex items-center gap-1 text-sm ${displayScore >= 70 ? 'text-green-400' : 'text-red-400'}`}>
        {displayScore >= 70 ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span>{mainText}</span>
      </div>
    </div>);
}
 
export default SummaryMetric;