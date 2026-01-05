import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { toast } from "react-toastify";
import { ZoomIn, ZoomOut, Maximize2, Download } from "lucide-react";

// Initialize mermaid with enhanced dark theme styling
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "14px",

    // Node colors - using teal/cyan theme
    primaryColor: "#0d9488",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "#14b8a6",

    // Secondary nodes
    secondaryColor: "#1e40af",
    secondaryTextColor: "#ffffff",
    secondaryBorderColor: "#3b82f6",

    // Tertiary nodes
    tertiaryColor: "#7c3aed",
    tertiaryTextColor: "#ffffff",
    tertiaryBorderColor: "#8b5cf6",

    // Lines and edges
    lineColor: "#6b7280",
    edgeLabelBackground: "#1f2937",

    // Background
    background: "#111827",
    mainBkg: "#1f2937",
    secondBkg: "#374151",

    // Text
    textColor: "#f3f4f6",
    labelTextColor: "#e5e7eb",

    // Special states
    errorBkgColor: "#991b1b",
    errorTextColor: "#fecaca",

    // Node border radius
    nodeBorder: "2px",
    clusterBkg: "#374151",
    clusterBorder: "#4b5563",
  },
  flowchart: {
    curve: "basis",
    nodeSpacing: 80,
    rankSpacing: 100,
    padding: 20,
    useMaxWidth: false,
    htmlLabels: true,
    diagramPadding: 20,
  },
});

const CanonicalFlowDiagram = ({ mermaidCode }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);

  // Calculate zoom to fit diagram in container
  const calculateFitZoom = () => {
    if (!svgRef.current || !wrapperRef.current) return 1;

    const svg = svgRef.current;
    const wrapper = wrapperRef.current;

    // Get SVG dimensions
    const svgWidth = svg.viewBox.baseVal.width || svg.getBoundingClientRect().width;
    const svgHeight = svg.viewBox.baseVal.height || svg.getBoundingClientRect().height;

    // Get container dimensions (with generous padding to ensure everything fits)
    const containerWidth = wrapper.clientWidth - 100; // Extra padding for controls and margins
    const containerHeight = wrapper.clientHeight - 100;

    // Calculate scale to fit - always scale down to fit entire diagram
    const scaleX = containerWidth / svgWidth;
    const scaleY = containerHeight / svgHeight;
    const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure both dimensions fit

    // Add a small buffer (95%) to ensure nothing is cut off
    return Math.max(scale * 0.95, 0.1); // Minimum 10% zoom
  };

  useEffect(() => {
    if (!mermaidCode || !containerRef.current) {
      console.log("No mermaid code or ref", { mermaidCode, hasRef: !!containerRef.current });
      return;
    }

    const renderDiagram = async () => {
      try {
        console.log("Rendering mermaid diagram:", mermaidCode);

        // Clear previous content
        containerRef.current.innerHTML = "";
        setError(null);

        // Generate unique ID for this render
        const id = `flowchart_${Date.now()}`;

        // Use the modern async API
        const { svg } = await mermaid.render(id, mermaidCode);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;

          // Get the SVG element and enhance it
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgRef.current = svgElement;

            // Remove fixed width/height to allow scaling
            svgElement.removeAttribute('width');
            svgElement.removeAttribute('height');
            svgElement.style.maxWidth = 'none';
            svgElement.style.height = 'auto';

            // Trim viewBox to remove extra whitespace
            try {
              const bbox = svgElement.getBBox();
              if (bbox && bbox.width > 0 && bbox.height > 0) {
                // Add small padding around the content
                const padding = 20;
                const newViewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
                svgElement.setAttribute('viewBox', newViewBox);
                console.log('Trimmed viewBox:', newViewBox);
              }
            } catch (e) {
              console.warn('Could not trim viewBox:', e);
            }

            // Add custom styles to nodes
            const nodes = svgElement.querySelectorAll('.node');
            nodes.forEach((node, index) => {
              const rect = node.querySelector('rect, circle, polygon');
              if (rect) {
                rect.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))';
                rect.style.transition = 'all 0.2s ease';
              }

              // Add hover effect
              node.style.cursor = 'pointer';
              node.addEventListener('mouseenter', () => {
                if (rect) {
                  rect.style.filter = 'drop-shadow(0 8px 12px rgba(20, 184, 166, 0.4))';
                  rect.style.transform = 'scale(1.05)';
                }
              });
              node.addEventListener('mouseleave', () => {
                if (rect) {
                  rect.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))';
                  rect.style.transform = 'scale(1)';
                }
              });
            });

            // Style edges
            const edges = svgElement.querySelectorAll('.edgePath path');
            edges.forEach(edge => {
              edge.style.strokeWidth = '2px';
              edge.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';
            });

            // Style edge labels
            const edgeLabels = svgElement.querySelectorAll('.edgeLabel');
            edgeLabels.forEach(label => {
              const text = label.querySelector('text');
              if (text) {
                text.style.fill = '#d1d5db';
                text.style.fontSize = '12px';
                text.style.fontWeight = '500';
              }
              const bg = label.querySelector('rect');
              if (bg) {
                bg.style.fill = '#1f2937';
                bg.style.stroke = '#4b5563';
                bg.style.strokeWidth = '1px';
                bg.style.rx = '4px';
              }
            });

            // Calculate and apply fit zoom after a short delay to ensure layout is complete
            setTimeout(() => {
              const initialZoom = calculateFitZoom();
              setFitZoom(initialZoom);
              setZoom(initialZoom);
              console.log('Auto-fitted diagram with zoom:', initialZoom);
            }, 100);
          }

          console.log("Mermaid diagram rendered successfully");
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        toast.error("Failed to render diagram: " + (err.message || "Unknown error"));
        setError(err.message || "Failed to render diagram");

        // Display error in the component
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-6 text-red-400 border border-red-500/50 rounded-xl bg-red-900/20">
              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong class="text-lg">Diagram Rendering Error</strong>
                  <pre class="mt-2 text-sm text-red-300 whitespace-pre-wrap font-mono">${err.message}</pre>
                </div>
              </div>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.1));
  };

  const handleFitToScreen = () => {
    const newFitZoom = calculateFitZoom();
    setFitZoom(newFitZoom);
    setZoom(newFitZoom);
  };

  const handleDownload = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'flow-diagram.svg';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800/50 h-full flex flex-col">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50">
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-gray-300" />
        </button>
        <button
          onClick={handleFitToScreen}
          className="px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-xs text-gray-300 font-medium"
          title="Fit to Screen"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-gray-300" />
        </button>
        <div className="w-px h-6 bg-gray-700" />
        <button
          onClick={handleFitToScreen}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4 text-gray-300" />
        </button>
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Download SVG"
        >
          <Download className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Diagram Container */}
      <div
        ref={wrapperRef}
        className="flex-1 p-8 overflow-hidden"
      >
        {!mermaidCode && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No diagram data available</p>
              <p className="text-gray-600 text-xs mt-1">Flow diagram will appear here</p>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="transition-transform duration-200 ease-out flex items-center justify-center min-h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        />
      </div>
    </div>
  );
};

export default CanonicalFlowDiagram;