import { type NodeProps } from '@xyflow/react'
import { Lightning } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function StartNode({ selected }: NodeProps) {
  return (
    <BaseNode
      label="Start"
      icon={<Lightning weight="fill" className="size-4" />}
      accentColor="#10B981"
      borderColor="#d1fae5"
      bgColor="#f0fdf4"
      shape="pill"
      inputs={[]}
      outputs={[{ id: 'context_out' }]}
      selected={selected}
    />
  )
}
