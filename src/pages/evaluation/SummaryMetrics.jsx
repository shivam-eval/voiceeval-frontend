const SummaryMetric = ({ mainText, sideText, successRate }) => {
  const isDuration = mainText.toLowerCase().includes("duration");

  return (
    <div className="bg-dark-panel rounded-xl p-6 border border-gray-800/50">
      <div className="text-gray-400 text-sm mb-2">{mainText}</div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-teal-400"></div>
        <span className="text-3xl font-bold text-white">
          {successRate}
          {!isDuration && typeof successRate === "number" ? "%" : ""}
        </span>
      </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{sideText}</span>
            </div>
          </div> );
}
 
export default SummaryMetric;