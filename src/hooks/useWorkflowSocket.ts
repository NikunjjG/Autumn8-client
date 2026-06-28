import { useEffect, useRef, useCallback } from 'react'
import type { Socket } from 'socket.io-client'
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import { establishSocketConnection } from '@/socket/socket.functions'
import { WEB_SOCKET_ACTIONS } from '@/socket/ws_actions'

interface RemoteCursor {
  userId: number
  username: string
  x: number
  y: number
}

interface UseWorkflowSocketParams {
  workflowId: string
  collabToken?: string | null
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
}

export function useWorkflowSocket({
  workflowId,
  collabToken,
  setNodes,
  setEdges,
}: UseWorkflowSocketParams) {
  const socketRef = useRef<Socket | null>(null)
  const remoteCursorsRef = useRef<Map<number, RemoteCursor>>(new Map())
  const cursorsStateRef = useRef<RemoteCursor[]>([])
  const setCursorsCallbackRef = useRef<((cursors: RemoteCursor[]) => void) | null>(null)
  const executionCallbackRef = useRef<((event: any) => void) | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    const authParams: any = { token }
    if (collabToken) {
      authParams.collabToken = collabToken
      authParams.workflowId = workflowId
    }

    const socket = establishSocketConnection(authParams)
    socketRef.current = socket

    socket.on(WEB_SOCKET_ACTIONS.CONNECT, () => {
      socket.emit(WEB_SOCKET_ACTIONS.JOIN_WORKFLOW, workflowId)
    })

    socket.on(WEB_SOCKET_ACTIONS.USER_JOINED, (data: { username: string }) => {
      console.log(`${data.username} joined the session`)
    })

    socket.on(WEB_SOCKET_ACTIONS.USER_LEFT, (data: { userId: number; username: string }) => {
      console.log(`${data.username} left the session`)
      remoteCursorsRef.current.delete(data.userId)
      updateCursorsState()
    })

    socket.on(WEB_SOCKET_ACTIONS.NODES_CHANGE, (data: { changes: NodeChange[] }) => {
      const filtered = data.changes.filter((c: NodeChange) => c.type !== 'select')
      if (filtered.length > 0) {
        setNodes((nds) => applyNodeChanges(filtered, nds))
      }
    })

    socket.on(WEB_SOCKET_ACTIONS.EDGES_CHANGE, (data: { changes: EdgeChange[] }) => {
      setEdges((eds) => applyEdgeChanges(data.changes, eds))
    })

    socket.on(WEB_SOCKET_ACTIONS.NODE_ADDED, (data: { node: Node }) => {
      setNodes((nds) => {
        if (nds.some((n) => n.id === data.node.id)) return nds
        return [...nds, data.node]
      })
    })

    socket.on(WEB_SOCKET_ACTIONS.EDGE_ADDED, (data: { edge: Edge }) => {
      setEdges((eds) => addEdge(data.edge as Connection, eds))
    })

    socket.on(WEB_SOCKET_ACTIONS.NODE_DATA_UPDATED, (data: { nodeId: string; nodeData: any }) => {
      setNodes((nds) =>
        nds.map((n) => n.id === data.nodeId ? { ...n, data: data.nodeData } : n)
      )
    })

    socket.on(WEB_SOCKET_ACTIONS.CURSOR_MOVEMENT, (data: RemoteCursor) => {
      remoteCursorsRef.current.set(data.userId, data)
      updateCursorsState()
    })

    socket.on('EXECUTION_PROGRESS', (data: any) => {
      executionCallbackRef.current?.(data)
    })

    socket.on(WEB_SOCKET_ACTIONS.SESSION_EXPIRED, () => {
      socket.disconnect()
      window.location.href = '/'
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [workflowId, collabToken, setNodes, setEdges])

  const updateCursorsState = () => {
    const cursors = Array.from(remoteCursorsRef.current.values())
    cursorsStateRef.current = cursors
    setCursorsCallbackRef.current?.(cursors)
  }

  const emitNodesChange = useCallback((changes: NodeChange[]) => {
    const filtered = changes.filter((c) => c.type !== 'select')
    if (filtered.length > 0 && socketRef.current?.connected) {
      socketRef.current.emit(WEB_SOCKET_ACTIONS.NODES_CHANGE, { changes: filtered })
    }
  }, [])

  const emitEdgesChange = useCallback((changes: EdgeChange[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(WEB_SOCKET_ACTIONS.EDGES_CHANGE, { changes })
    }
  }, [])

  const emitNodeAdded = useCallback((node: Node) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(WEB_SOCKET_ACTIONS.NODE_ADDED, { node })
    }
  }, [])

  const emitEdgeAdded = useCallback((edge: Connection) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(WEB_SOCKET_ACTIONS.EDGE_ADDED, { edge })
    }
  }, [])

  const emitNodeDataUpdated = useCallback((nodeId: string, nodeData: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(WEB_SOCKET_ACTIONS.NODE_DATA_UPDATED, { nodeId, nodeData })
    }
  }, [])

  const emitCursorMovement = useCallback((x: number, y: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(WEB_SOCKET_ACTIONS.CURSOR_MOVEMENT, { x, y })
    }
  }, [])

  const subscribeToCursors = useCallback((callback: (cursors: RemoteCursor[]) => void) => {
    setCursorsCallbackRef.current = callback
  }, [])

  const subscribeToExecution = useCallback((callback: (event: any) => void) => {
    executionCallbackRef.current = callback
  }, [])

  return {
    emitNodesChange,
    emitEdgesChange,
    emitNodeAdded,
    emitEdgeAdded,
    emitNodeDataUpdated,
    emitCursorMovement,
    subscribeToCursors,
    subscribeToExecution,
  }
}
