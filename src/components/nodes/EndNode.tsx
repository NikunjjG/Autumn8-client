import { type NodeProps } from '@xyflow/react'
import { FlagCheckered } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function EndNode({ selected }: NodeProps) {
  return (
    <BaseNode
      label="End"
      icon={<FlagCheckered weight="fill" className="size-4" />}
      accentColor="#F43F5E"
      borderColor="#fecdd3"
      bgColor="#fff1f2"
      shape="pill"
      inputs={[{ id: 'context_in' }]}
      outputs={[]}
      selected={selected}
    />
  )
}
