import { type NodeProps } from '@xyflow/react'
import { Globe } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function HttpRequestNode({ data, selected }: NodeProps) {
  const method = (data.method as string) || ''
  const url = (data.url as string) || ''

  return (
    <BaseNode
      label="HTTP Request"
      icon={<Globe weight="bold" className="size-4" />}
      accentColor="#f26522"
      borderColor="#fed7aa"
      bgColor="#fff7ed"
      shape="rectangle"
      inputs={[{ id: 'context_in' }]}
      outputs={[{ id: 'context_out' }]}
      selected={selected}
    >
      {(method || url) && (
        <p className="text-[10px] font-medium text-orange-600 truncate">
          {method && <span className="font-bold">{method} </span>}
          {url || 'Not configured'}
        </p>
      )}
    </BaseNode>
  )
}
