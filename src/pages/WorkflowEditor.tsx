import { useState, useCallback, useRef, useEffect, type DragEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import { axiosInstance } from '@/utils/axiosInstance'
import { SpinnerGap, FloppyDisk, Check, PencilSimple } from '@phosphor-icons/react'

let nodeId = 1

const WorkflowEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [workflowName, setWorkflowName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const response = await axiosInstance.get(`/workflows/${id}`)
        const workflow = response.data.content
        setWorkflowName(workflow.name ?? 'Untitled')
        const loadedNodes = (workflow.nodes ?? []).map((n: any) => ({
          id: n.id,
          type: n.type,
          position: { x: n.position?.x ?? 0, y: n.position?.y ?? 0 },
          data: n.data ?? {},
          ...(n.deletable === false ? { deletable: false } : {}),
        }))
        const loadedEdges = (workflow.edges ?? []).map((e: any) => ({
          id: e.id,
          source: e.source,
          sourceHandle: e.sourceHandle,
          target: e.target,
          targetHandle: e.targetHandle,
        }))
        setNodes(loadedNodes)
        setEdges(loadedEdges)
        const maxId = (workflow.nodes ?? []).reduce((max: number, n: Node) => {
          const num = parseInt(n.id.split('_').pop() ?? '0', 10)
          return num > max ? num : max
        }, 0)
        nodeId = maxId
      } catch {
        console.error('Failed to load workflow')
      } finally {
        setLoading(false)
      }
    }
    loadWorkflow()
  }, [id])

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

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    try {
      const cleanNodes = nodes.map(({ id: nId, type, position, data, deletable }) => ({
        id: nId,
        type,
        position,
        data: data ?? {},
        ...(deletable === false ? { deletable: false } : {}),
      }))
      const cleanEdges = edges.map(({ id: eId, source, sourceHandle, target, targetHandle }) => ({
        id: eId,
        source,
        sourceHandle,
        target,
        targetHandle,
      }))
      await axiosInstance.post(`/workflows/save/${id}`, { nodes: cleanNodes, edges: cleanEdges, name: workflowName })
      setSaved(true)
      setTimeout(() => navigate('/'), 1000)
    } catch {
      console.error('Failed to save workflow')
    } finally {
      setSaving(false)
    }
  }, [id, nodes, edges, workflowName, navigate])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <SpinnerGap className="size-6 text-slate-400 animate-spin" />
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <div className="flex-1 flex w-full">
        <NodeSidebar />
        <div className="flex-1 relative">
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg shadow-sm px-4 py-2.5">
              {isRenaming ? (
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  onBlur={() => setIsRenaming(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsRenaming(false)
                    if (e.key === 'Escape') setIsRenaming(false)
                  }}
                  autoFocus
                  className="text-sm font-semibold text-slate-900 bg-transparent border-none outline-none w-52"
                />
              ) : (
                <>
                  <span className="text-sm font-semibold text-slate-900">{workflowName}</span>
                  <button
                    onClick={() => setIsRenaming(true)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <PencilSimple className="size-4" />
                  </button>
                </>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <SpinnerGap className="size-4 animate-spin text-slate-400" />
              ) : saved ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <FloppyDisk className="size-4 text-slate-500" />
              )}
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
          </div>
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
