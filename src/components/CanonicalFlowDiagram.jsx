// ═══════════════════════════════════════════════════════════════
// CANONICAL FLOW DIAGRAM SVG
// ═══════════════════════════════════════════════════════════════
// 
// TO UPDATE THE FLOW DIAGRAM:
// 1. Place your SVG file in: src/assets/canonical-flow.svg
// 2. Or replace the import path below with your SVG file location
// 3. The SVG will be displayed in the component below
//
import canonicalFlowSvg from '../assets/canonical-flow.svg'

const CanonicalFlowDiagram = () => {
  return (
    <div className="bg-dark-input rounded-xl p-6 border border-gray-700">
      <div className="mb-4">
        <h5 className="text-base font-semibold text-white mb-2">Canonical Flow Diagram</h5>
        <p className="text-gray-400 text-sm">
          Visual representation of your Voice Agent's conversation flow and decision points.
        </p>
      </div>
      
      <div className="bg-dark-bg rounded-lg border border-gray-800 p-4" style={{ height: '70vh', maxHeight: '800px', minHeight: '500px', overflow: 'hidden' }}>
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={canonicalFlowSvg}
            alt="Canonical Flow Diagram"
            className="w-full h-full"
            style={{ objectFit: 'contain', objectPosition: 'center' }}
          />
        </div>
      </div>
    </div>
  )
}

export default CanonicalFlowDiagram
