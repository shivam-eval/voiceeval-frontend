import { useEffect, useRef, memo } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    fontFamily: "Inter, sans-serif",
    fontSize: "10px",
    primaryColor: "#E5F0FF",
    primaryTextColor: "#1F2937",
    primaryBorderColor: "#93C5FD",
    lineColor: "#9CA3AF",
    edgeLabelBackground: "#ffffff",
  },
  flowchart: {
    curve: "linear",
    nodeSpacing: 20,
    rankSpacing: 30,
  },
});

const CanonicalFlowDiagram = ({ mermaidCode }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!mermaidCode || !ref.current) {
      console.log("No mermaid code or ref", { mermaidCode, hasRef: !!ref.current });
      return;
    }

    const renderDiagram = async () => {
      try {
        console.log("Rendering mermaid diagram:", mermaidCode);
        
        // Clear previous content
        ref.current.innerHTML = "";

        // Generate unique ID for this render
        const id = `flowchart_${Date.now()}`;

        // Use the modern async API
        const { svg } = await mermaid.render(id, mermaidCode);
        
        if (ref.current) {
          ref.current.innerHTML = svg;
          console.log("Mermaid diagram rendered successfully");
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        
        // Display error in the component
        if (ref.current) {
          ref.current.innerHTML = `
            <div class="diagram-error">
              <strong class="diagram-error__title">Diagram Rendering Error:</strong>
              <pre class="diagram-error__message">${err.message}</pre>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  return (
    <div className="bg-white rounded-xl p-2 overflow-auto max-h-[600px]">
      {!mermaidCode && (
        <div className="text-gray-400 text-center py-8">
          No diagram data available
        </div>
      )}
      <div ref={ref} className="min-w-max" />
    </div>
  );
};

export default memo(CanonicalFlowDiagram);
