import { useState, useCallback, useRef, useEffect, type DragEvent } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
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
import ExecutionTerminal from '@/components/canvas/ExecutionTerminal'
import ExecuteModal from '@/components/canvas/ExecuteModal'
import { isValidConnection } from '@/utils/connectionValidation'
import { axiosInstance } from '@/utils/axiosInstance'
import { useWorkflowSocket } from '@/hooks/useWorkflowSocket'
import RemoteCursors from '@/components/canvas/RemoteCursors'
import { useAppDispatch } from '@/store/store'
import { setCredits } from '@/store/slices/authSlice'
import { SpinnerGap, FloppyDisk, Check, PencilSimple, UsersThree, Copy, X, Play, Globe } from '@phosphor-icons/react'

let nodeId = 1

interface RemoteCursor {
  userId: number
  username: string
  x: number
  y: number
}

const WorkflowEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const collabToken = searchParams.get('token')
  const isCollaborator = !!collabToken
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [workflowName, setWorkflowName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showCollabModal, setShowCollabModal] = useState(false)
  const [showExecuteModal, setShowExecuteModal] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([])
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [terminalEvents, setTerminalEvents] = useState<any[]>([])
  const [executing, setExecuting] = useState(false)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)

  const {
    emitNodesChange,
    emitEdgesChange,
    emitNodeAdded,
    emitEdgeAdded,
    emitCursorMovement,
    subscribeToCursors,
    subscribeToExecution,
  } = useWorkflowSocket({
    workflowId: id ?? '',
    collabToken,
    setNodes,
    setEdges,
  })

  useEffect(() => {
    subscribeToCursors(setRemoteCursors)
  }, [subscribeToCursors])

  useEffect(() => {
    subscribeToExecution((event: any) => {
      setTerminalEvents((prev) => [...prev, event])

      if (event.event === 'workflow_complete' || event.event === 'workflow_error' || event.event === 'node_failed') {
        setExecuting(false)
      }

      if (event.event === 'credits_deducted') {
        dispatch(setCredits(event.remaining))
      }
    })
  }, [subscribeToExecution, dispatch])

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (reactFlowInstance.current) {
        const position = reactFlowInstance.current.screenToFlowPosition({ x: e.clientX, y: e.clientY })
        emitCursorMovement(position.x, position.y)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [emitCursorMovement])

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
      emitNodesChange(changes)
    },
    [selectedNodeId, emitNodesChange],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
      emitEdgesChange(changes)
    },
    [emitEdgesChange],
  )

  const onConnect = useCallback(
    (params: Connection) => {
      const result = isValidConnection(params, nodes, edges)
      if (!result.valid) return
      setEdges((eds) => addEdge(params, eds))
      emitEdgeAdded(params)
    },
    [nodes, edges, emitEdgeAdded],
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
      emitNodeAdded(newNode)
    },
    [emitNodeAdded],
  )

  const fetchSessionDetails = async () => {
    try {
      const token = await axiosInstance.post(`/workflows/collaborate/${id}`)
      setSessionToken(token.data?.content)
      setShowCollabModal(true)
    } catch {
      console.error('Could not fetch session details')
    }
  }

  const handleCloseSession = async () => {
    try {
      await axiosInstance.delete(`/workflows/collaborate/${id}`)
      setSessionToken(null)
      setShowCollabModal(false)
    } catch {
      console.error('Could not close session')
    }
  }

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

  const handleExecute = async (triggerPayload: object) => {
    setShowExecuteModal(false)
    setTerminalEvents([])
    setTerminalOpen(true)
    setExecuting(true)
    try {
      const cleanNodes = nodes.map(({ id: nId, type, position, data, deletable }) => ({
        id: nId, type, position, data: data ?? {},
        ...(deletable === false ? { deletable: false } : {}),
      }))
      const cleanEdges = edges.map(({ id: eId, source, sourceHandle, target, targetHandle }) => ({
        id: eId, source, sourceHandle, target, targetHandle,
      }))
      await axiosInstance.post(`/workflows/execute/${id}`, { triggerPayload, nodes: cleanNodes, edges: cleanEdges })
    } catch (err: any) {
      const msg = err.response?.status === 403
        ? `Insufficient credits — need ${err.response.data.required}, have ${err.response.data.available}`
        : 'Failed to start execution'
      setTerminalEvents((prev) => [...prev, { event: 'workflow_error', error: msg }])
      setExecuting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <SpinnerGap className="size-6 text-slate-400 animate-spin" />
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <div className="flex-1 flex w-full min-h-0">
        <NodeSidebar />
        <div className="flex-1 relative min-h-0 overflow-hidden">
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg shadow-sm px-4 py-2.5">
                {!isCollaborator && isRenaming ? (
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
                    {!isCollaborator && (
                      <button
                        onClick={() => setIsRenaming(true)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <PencilSimple className="size-4" />
                      </button>
                    )}
                    {isCollaborator && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Live session &middot; Can't save</span>
                    )}
                  </>
                )}
              </div>
              {!isCollaborator && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowExecuteModal(true)}
                    disabled={executing}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    <Play className="size-4" weight="fill" />
                    {executing ? 'Running...' : 'Simulate'}
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-blue-500 text-white shadow-sm hover:bg-blue-600 transition-colors"
                  >
                    <Globe className="size-4" />
                    Publish
                  </button>
                  {sessionToken ? (
                    <button
                      onClick={() => setShowCollabModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-violet-500 text-white shadow-sm hover:bg-violet-600 transition-colors"
                    >
                      <UsersThree className="size-4" />
                      Live
                    </button>
                  ) : (
                    <button
                      onClick={fetchSessionDetails}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary text-white shadow-sm hover:bg-primary-hover transition-colors"
                    >
                      <UsersThree className="size-4" />
                      Collaborate
                    </button>
                  )}
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
              )}
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
              <RemoteCursors cursors={remoteCursors} />
            </ReactFlow>

            <ExecutionTerminal
              events={terminalEvents}
              isOpen={terminalOpen}
              onToggle={() => setTerminalOpen((prev) => !prev)}
            />
        </div>

        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            allNodes={nodes}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {showCollabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Collaborate</h3>
              <button
                onClick={() => { setShowCollabModal(false); setCopied(false) }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Share this link with your team. They must be logged in to join.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`${window.location.origin}/workflow/${id}?token=${sessionToken}`}
                className="flex-1 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none select-all"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/workflow/${id}?token=${sessionToken}`)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button
              onClick={handleCloseSession}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      )}

      {showExecuteModal && (
        <ExecuteModal
          onClose={() => setShowExecuteModal(false)}
          onExecute={handleExecute}
          executing={executing}
        />
      )}
    </ReactFlowProvider>
  )
}

export default WorkflowEditor
