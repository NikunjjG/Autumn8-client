import { type NodeProps } from '@xyflow/react'
import { Terminal } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function CodeNode({ data, selected }: NodeProps) {
  const hasCode = !!(data.code as string)

  return (
    <BaseNode
      label="Code"
      icon={<Terminal weight="bold" className="size-4" />}
      accentColor="#EAB308"
      borderColor="#fef08a"
      bgColor="#fefce8"
      shape="rectangle"
      inputs={[{ id: 'context_in' }]}
      outputs={[{ id: 'context_out' }]}
      selected={selected}
    >
      <p className="text-[10px] text-slate-400 italic">
        {hasCode ? 'Code configured' : 'Click to configure'}
      </p>
    </BaseNode>
  )
}
