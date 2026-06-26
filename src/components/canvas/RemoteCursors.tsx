import { useReactFlow } from '@xyflow/react'

interface RemoteCursor {
  userId: number
  username: string
  x: number
  y: number
}

const CURSOR_COLORS = ['#F43F5E', '#8B5CF6', '#0EA5E9', '#10B981', '#F59E0B', '#6366F1']

export default function RemoteCursors({ cursors }: { cursors: RemoteCursor[] }) {
  const { flowToScreenPosition } = useReactFlow()

  return (
    <>
      {cursors.map((cursor, i) => {
        const color = CURSOR_COLORS[i % CURSOR_COLORS.length]
        const screenPos = flowToScreenPosition({ x: cursor.x, y: cursor.y })

        return (
          <div
            key={cursor.userId}
            className="pointer-events-none fixed z-50 transition-all duration-75 ease-out"
            style={{
              left: `${screenPos.x}px`,
              top: `${screenPos.y}px`,
            }}
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
              <path d="M0.5 0.5L11 7.5L5.5 8.5L3 15L0.5 0.5Z" fill={color} stroke="white" strokeWidth="1" />
            </svg>
            <span
              className="absolute left-3 top-3 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-sm shadow-sm whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {cursor.username}
            </span>
          </div>
        )
      })}
    </>
  )
}
