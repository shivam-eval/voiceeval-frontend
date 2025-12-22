import dagre from "dagre"

const nodeWidth = 220
const nodeHeight = 70

export const layoutGraph = (nodes, edges) => {
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

  return {
    nodes: nodes.map(node => {
      const pos = g.node(node.id)
      return {
        ...node,
        position: {
          x: pos.x - nodeWidth / 2,
          y: pos.y - nodeHeight / 2
        }
      }
    }),
    edges
  }
}

export const percentClass = (base, value) => {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)))
  return `${base}-${v}`
}
