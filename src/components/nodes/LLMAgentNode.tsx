import { type NodeProps } from '@xyflow/react'
import { Brain } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function LLMAgentNode({ data, selected }: NodeProps) {
  const model = (data.model as string) || ''

  return (
    <BaseNode
      label="LLM Agent"
      icon={<Brain weight="fill" className="size-4" />}
      accentColor="#8B5CF6"
      borderColor="#ddd6fe"
      bgColor="#f5f3ff"
      shape="rectangle"
      inputs={[
        { id: 'context_in' },
        { id: 'prompt_in' },
        { id: 'structure_in' },
        { id: 'tool_in', position: 'bottom' },
      ]}
      outputs={[{ id: 'context_out' }]}
      selected={selected}
    >
      {model && (
        <p className="text-[10px] font-medium text-violet-600 truncate">{model}</p>
      )}
    </BaseNode>
  )
}
