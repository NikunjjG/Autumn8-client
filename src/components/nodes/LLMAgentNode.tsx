import { type NodeProps } from '@xyflow/react'
import { Brain } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function LLMAgentNode({ data, selected }: NodeProps) {
  const PROVIDER_LABELS: Record<string, string> = {
    anthropic: 'Anthropic',
    openai: 'OpenAI',
    google: 'Google',
  }
  const provider = (data.provider as string) || ''

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
      ]}
      outputs={[{ id: 'context_out' }]}
      selected={selected}
    >
      {provider && (
        <p className="text-[10px] font-medium text-violet-600 truncate">{PROVIDER_LABELS[provider] ?? provider}</p>
      )}
    </BaseNode>
  )
}
