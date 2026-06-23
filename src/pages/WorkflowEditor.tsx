import { useState, useCallback, useRef, type DragEvent } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type ReactFlowInstance,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from '@/components/nodes'
import NodeSidebar from '@/components/canvas/NodeSidebar'
import ConfigPanel from '@/components/canvas/ConfigPanel'
import { isValidConnection } from '@/utils/connectionValidation'

const initialNodes: Node[] = [
  {
    id: 'start_1',
    type: 'start',
    position: { x: 100, y: 300 },
    data: {},
    deletable: false,
  },
]

const initialEdges: Edge[] = []

let nodeId = 1

const WorkflowEditor = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (selectedNodeId) {
        const isSelectedDeleted = changes.some(
          (c) => c.type === 'remove' && c.id === selectedNodeId
        )
        if (isSelectedDeleted) setSelectedNodeId(null)
      }
      setNodes((nds) => applyNodeChanges(changes, nds))
    },
    [selectedNodeId],
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  )
  const onConnect = useCallback(
    (params: Connection) => {
      const result = isValidConnection(params, nodes, edges)
      if (!result.valid) return
      setEdges((eds) => addEdge(params, eds))
    },
    [nodes, edges],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/autumn8-node')
      if (!type || !reactFlowInstance.current) return

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      nodeId++
      const newNode: Node = {
        id: `${type}_${nodeId}`,
        type,
        position,
        data: {},
      }

      setNodes((nds) => [...nds, newNode])
    },
    [],
  )

  return (
    <ReactFlowProvider>
      <div className="flex-1 flex w-full">
        <NodeSidebar />
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onInit={(instance) => { reactFlowInstance.current = instance }}
            deleteKeyCode={['Backspace', 'Delete']}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { strokeWidth: 2 },
            }}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap zoomable pannable />
          </ReactFlow>
        </div>
        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </ReactFlowProvider>
  )
}

export default WorkflowEditor
