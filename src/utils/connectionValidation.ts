import type { Node, Edge, Connection } from '@xyflow/react'

const COMPATIBLE_HANDLES: Record<string, string[]> = {
  context_out: ['context_in'],
  prompt_out: ['prompt_in'],
  structure_out: ['structure_in'],
  tool_out: ['tool_in'],
}

const MULTI_CONNECTION_HANDLES = new Set(['tool_in'])

function hasCycle(_nodes: Node[], edges: Edge[], newSource: string, newTarget: string): boolean {
  const adjacency: Record<string, string[]> = {}
  for (const edge of edges) {
    if (!adjacency[edge.source]) adjacency[edge.source] = []
    adjacency[edge.source].push(edge.target)
  }
  if (!adjacency[newSource]) adjacency[newSource] = []
  adjacency[newSource].push(newTarget)

  const visited = new Set<string>()
  const stack = [newTarget]

  while (stack.length > 0) {
    const current = stack.pop()!
    if (current === newSource) return true
    if (visited.has(current)) continue
    visited.add(current)
    const neighbors = adjacency[current] ?? []
    for (const neighbor of neighbors) {
      stack.push(neighbor)
    }
  }

  return false
}

export function isValidConnection(
  connection: Connection,
  nodes: Node[],
  edges: Edge[],
): { valid: boolean; reason?: string } {
  const { source, target, sourceHandle, targetHandle } = connection

  if (!source || !target || !sourceHandle || !targetHandle) {
    return { valid: false, reason: 'Incomplete connection' }
  }

  if (source === target) {
    return { valid: false, reason: 'Cannot connect a node to itself' }
  }

  const sourceNode = nodes.find((n) => n.id === source)
  const targetNode = nodes.find((n) => n.id === target)
  if (!sourceNode || !targetNode) {
    return { valid: false, reason: 'Node not found' }
  }

  const allowed = COMPATIBLE_HANDLES[sourceHandle]
  if (!allowed || !allowed.includes(targetHandle)) {
    return { valid: false, reason: `Cannot connect ${sourceHandle} to ${targetHandle}` }
  }

  if (!MULTI_CONNECTION_HANDLES.has(targetHandle)) {
    const existingConnection = edges.find(
      (e) => e.target === target && e.targetHandle === targetHandle
    )
    if (existingConnection) {
      return { valid: false, reason: 'This input already has a connection' }
    }
  }

  if (hasCycle(nodes, edges, source, target)) {
    return { valid: false, reason: 'This connection would create a loop' }
  }

  return { valid: true }
}
