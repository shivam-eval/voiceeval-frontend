import ReactFlow, {
  Background,
  Controls,
  MiniMap
} from "reactflow"
import "reactflow/dist/style.css"

const GraphRenderer = ({ graph }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

export default GraphRenderer
