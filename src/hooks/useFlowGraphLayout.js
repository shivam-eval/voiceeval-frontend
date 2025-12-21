import { useMemo } from "react"
import dagre from "dagre"

const nodeWidth = 220
const nodeHeight = 70

export const useFlowGraphLayout = (nodes, edges) => {
  return useMemo(() => {
    const g = new dagre.graphlib.Graph()
    g.setGraph({ rankdir: "TB", ranksep: 70, nodesep: 40 })
    g.setDefaultEdgeLabel(() => ({}))

    nodes.forEach(node => {
      g.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })

    edges.forEach(edge => {
      g.setEdge(edge.source, edge.target)
    })

    dagre.layout(g)

    nodes.forEach(node => {
      const pos = g.node(node.id)
      node.position = {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2
      }
    })

    return { nodes, edges }
  }, [nodes, edges])
}
