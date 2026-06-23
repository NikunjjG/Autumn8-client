import { type NodeProps } from '@xyflow/react'
import { TextT } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function InputNode({ selected }: NodeProps) {
  return (
    <BaseNode
      label="Input"
      icon={<TextT weight="bold" className="size-4" />}
      accentColor="#0EA5E9"
      borderColor="#bae6fd"
      bgColor="#f0f9ff"
      shape="rectangle"
      inputs={[]}
      outputs={[{ id: 'prompt_out' }]}
      selected={selected}
    />
  )
}
