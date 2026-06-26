import { type NodeProps } from '@xyflow/react'
import { GitFork } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function ConditionalNode({ data, selected }: NodeProps) {
  const operator = (data.operator as string) || ''
  const field = (data.field as string) || ''

  return (
    <BaseNode
      label="Condition"
      icon={<GitFork weight="fill" className="size-4" />}
      accentColor="#F59E0B"
      borderColor="#fde68a"
      bgColor="#fffbeb"
      shape="diamond"
      inputs={[{ id: 'context_in' }]}
      outputs={[
        { id: 'context_out_true' },
        { id: 'context_out_false' },
      ]}
      selected={selected}
    >
      {field && operator && (
        <p className="text-[10px] font-medium text-amber-600 truncate">{field} {operator} ...</p>
      )}
    </BaseNode>
  )
}
