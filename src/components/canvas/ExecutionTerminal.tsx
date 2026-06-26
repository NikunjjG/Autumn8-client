import { useEffect, useRef } from 'react'
import { CaretUp, CaretDown } from '@phosphor-icons/react'

interface TerminalEvent {
  event: string
  nodeId?: string
  nodeType?: string
  output?: any
  error?: string
  totalNodes?: number
  totalCost?: number
  context?: Record<string, any>
  cost?: number
  remaining?: number
}

interface ExecutionTerminalProps {
  events: TerminalEvent[]
  isOpen: boolean
  onToggle: () => void
}

function getEventColor(event: string): string {
  switch (event) {
    case 'workflow_started': return 'text-blue-400'
    case 'node_started': return 'text-yellow-400'
    case 'node_completed': return 'text-emerald-400'
    case 'node_skipped': return 'text-slate-500'
    case 'node_failed': return 'text-red-400'
    case 'workflow_complete': return 'text-emerald-300'
    case 'workflow_error': return 'text-red-400'
    case 'credits_deducted': return 'text-amber-400'
    default: return 'text-slate-400'
  }
}

function getEventIcon(event: string): string {
  switch (event) {
    case 'workflow_started': return '▶'
    case 'node_started': return '⟳'
    case 'node_completed': return '✓'
    case 'node_skipped': return '⊘'
    case 'node_failed': return '✗'
    case 'workflow_complete': return '★'
    case 'workflow_error': return '✗'
    case 'credits_deducted': return '◉'
    default: return '·'
  }
}

function formatEvent(e: TerminalEvent): string {
  switch (e.event) {
    case 'workflow_started':
      return `Workflow started — ${e.totalNodes} nodes to execute`
    case 'node_started':
      return `Executing ${e.nodeType} [${e.nodeId}]`
    case 'node_completed':
      return `Completed ${e.nodeType} [${e.nodeId}] → ${JSON.stringify(e.output).slice(0, 80)}`
    case 'node_skipped':
      return `Skipped ${e.nodeType} [${e.nodeId}] (conditional branch)`
    case 'node_failed':
      return `Failed ${e.nodeType} [${e.nodeId}]: ${e.error}`
    case 'workflow_complete':
      return `Workflow complete — total cost: ${e.totalCost} credits`
    case 'workflow_error':
      return `Workflow error: ${e.error}`
    case 'credits_deducted':
      return `Credits deducted: -${e.cost} → ${e.remaining} remaining`
    default:
      return JSON.stringify(e)
  }
}

export default function ExecutionTerminal({ events, isOpen, onToggle }: ExecutionTerminalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [events])

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-20 border-t border-slate-700 bg-[#1e293b] transition-all duration-200 ${isOpen ? 'h-56' : 'h-9'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition-colors"
      >
        <span>Terminal {events.length > 0 && `(${events.length})`}</span>
        {isOpen ? <CaretDown className="size-3.5" /> : <CaretUp className="size-3.5" />}
      </button>

      {isOpen && (
        <div ref={scrollContainerRef} className="h-[calc(100%-36px)] overflow-y-auto px-4 pb-3 font-mono text-[11px] leading-5">
          {events.length === 0 && (
            <p className="text-slate-600 italic">Click Simulate to execute the workflow...</p>
          )}
          {events.map((e, i) => (
            <div key={i}>
              <div className="flex gap-2">
                <span className={`shrink-0 ${getEventColor(e.event)}`}>{getEventIcon(e.event)}</span>
                <span className={getEventColor(e.event)}>{formatEvent(e)}</span>
              </div>
              {e.event === 'workflow_complete' && e.context && (
                <pre className="mt-2 ml-5 text-[10px] text-slate-400 bg-slate-800 rounded p-2 overflow-x-auto">
                  {JSON.stringify(e.context, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
