import { type NodeProps } from '@xyflow/react'
import { Plug } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function MCPToolNode({ data, selected }: NodeProps) {
  const serverId = (data.serverId as string) || ''

  return (
    <BaseNode
      label="MCP Tool"
      icon={<Plug weight="fill" className="size-4" />}
      accentColor="#6366F1"
      borderColor="#c7d2fe"
      bgColor="#eef2ff"
      shape="rectangle"
      inputs={[]}
      outputs={[{ id: 'tool_out', position: 'top' }]}
      selected={selected}
    >
      {serverId && (
        <p className="text-[10px] font-medium text-indigo-600 truncate">{serverId}</p>
      )}
    </BaseNode>
  )
}
