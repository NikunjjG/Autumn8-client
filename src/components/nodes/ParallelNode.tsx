import { type NodeProps } from '@xyflow/react'
import { ArrowsSplit } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function ParallelNode({ data, selected }: NodeProps) {
  const branchCount = (data.branches as number) || 2

  const outputs = Array.from({ length: branchCount }, (_, i) => ({
    id: `context_out_${i + 1}`,
  }))

  return (
    <BaseNode
      label="Parallel"
      icon={<ArrowsSplit weight="fill" className="size-4" />}
      accentColor="#F59E0B"
      borderColor="#fde68a"
      bgColor="#fffbeb"
      shape="diamond"
      inputs={[{ id: 'context_in' }]}
      outputs={outputs}
      selected={selected}
    >
      <p className="text-[10px] font-medium text-amber-600">{branchCount} branches</p>
    </BaseNode>
  )
}
