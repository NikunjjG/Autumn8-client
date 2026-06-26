import { Handle, Position } from '@xyflow/react'
import type { ReactNode } from 'react'

interface HandleDef {
  id: string
  position?: 'left' | 'right' | 'top' | 'bottom'
}

interface BaseNodeProps {
  label: string
  icon: ReactNode
  accentColor: string
  borderColor: string
  bgColor: string
  children?: ReactNode
  shape?: 'pill' | 'rectangle' | 'diamond' | 'hexagon'
  inputs?: HandleDef[]
  outputs?: HandleDef[]
  selected?: boolean
}

const HANDLE_COLORS: Record<string, string> = {
  context_in: '#f26522',
  context_out: '#f26522',
  context_out_true: '#10B981',
  context_out_false: '#F43F5E',
  context_out_1: '#8B5CF6',
  context_out_2: '#0EA5E9',
  context_out_3: '#EAB308',
  prompt_in: '#0EA5E9',
  prompt_out: '#0EA5E9',
  structure_in: '#14B8A6',
  structure_out: '#14B8A6',
}

const POSITION_MAP: Record<string, Position> = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
}

export default function BaseNode({
  label,
  icon,
  accentColor,
  borderColor,
  bgColor,
  children,
  shape = 'rectangle',
  inputs = [],
  outputs = [],
  selected,
}: BaseNodeProps) {
  const shapeClasses: Record<string, string> = {
    pill: 'rounded-full px-5 py-2.5',
    rectangle: 'rounded-lg px-4 py-3',
    diamond: 'rounded-lg px-4 py-3',
    hexagon: 'rounded-lg px-4 py-3',
  }

  const leftInputs = inputs.filter(h => (h.position ?? 'left') === 'left')
  const bottomInputs = inputs.filter(h => h.position === 'bottom')
  const topInputs = inputs.filter(h => h.position === 'top')

  const rightOutputs = outputs.filter(h => (h.position ?? 'right') === 'right')
  const topOutputs = outputs.filter(h => h.position === 'top')
  const bottomOutputs = outputs.filter(h => h.position === 'bottom')

  const renderHandle = (
    handle: HandleDef,
    type: 'source' | 'target',
    group: HandleDef[],
    index: number,
    defaultPosition: 'left' | 'right' | 'top' | 'bottom',
  ) => {
    const pos = handle.position ?? defaultPosition
    const handleColor = HANDLE_COLORS[handle.id] ?? accentColor
    const isHorizontal = pos === 'top' || pos === 'bottom'

    const style: React.CSSProperties = {
      backgroundColor: handleColor,
    }

    if (isHorizontal) {
      style.left = group.length === 1 ? '50%' : `${((index + 1) / (group.length + 1)) * 100}%`
    } else {
      style.top = group.length === 1 ? '50%' : `${((index + 1) / (group.length + 1)) * 100}%`
    }

    return (
      <Handle
        key={handle.id}
        type={type}
        position={POSITION_MAP[pos]}
        id={handle.id}
        className="!w-3 !h-3 !border-2 !border-white"
        style={style}
      />
    )
  }

  return (
    <div
      className={`
        relative border-2 shadow-sm transition-shadow
        ${shapeClasses[shape]}
        ${selected ? 'shadow-md ring-2 ring-offset-1' : 'hover:shadow-md'}
      `}
      style={{
        borderColor: selected ? accentColor : borderColor,
        backgroundColor: bgColor,
        minWidth: shape === 'pill' ? '140px' : '160px',
        ...( selected ? { '--tw-ring-color': accentColor } as React.CSSProperties : {}),
      }}
    >
      {leftInputs.map((h, i) => renderHandle(h, 'target', leftInputs, i, 'left'))}
      {topInputs.map((h, i) => renderHandle(h, 'target', topInputs, i, 'top'))}
      {bottomInputs.map((h, i) => renderHandle(h, 'target', bottomInputs, i, 'bottom'))}

      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          <span className="text-white text-sm">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{label}</p>
        </div>
      </div>

      {children && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100">
          {children}
        </div>
      )}

      {rightOutputs.map((h, i) => renderHandle(h, 'source', rightOutputs, i, 'right'))}
      {topOutputs.map((h, i) => renderHandle(h, 'source', topOutputs, i, 'top'))}
      {bottomOutputs.map((h, i) => renderHandle(h, 'source', bottomOutputs, i, 'bottom'))}
    </div>
  )
}
