export const flowToGraph = (flowData) => {
  const flowNodes = flowData.nodes

  const nodes = flowNodes.map(n => ({
    id: n.id,
    data: { label: n.label || n.id },
    position: { x: 0, y: 0 },
    type: "default"
  }))

  const edges = []

  flowNodes.forEach(n => {
    if (n.children && n.children.length > 0) {
      n.children.forEach(child => {
        edges.push({
          id: `${n.id}-${child.node_name}`,
          source: n.id,
          target: child.node_name,
          label: child.label || child.condition,
          animated: false
        })
      })
    }
  })

  return { nodes, edges }
}
