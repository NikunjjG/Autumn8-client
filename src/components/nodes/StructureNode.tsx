import { type NodeProps } from '@xyflow/react'
import { TreeStructure } from '@phosphor-icons/react'
import BaseNode from './BaseNode'

export default function StructureNode({ data, selected }: NodeProps) {
  const structureType = (data.structureType as string) || 'json'

  return (
    <BaseNode
      label="Structure"
      icon={<TreeStructure weight="fill" className="size-4" />}
      accentColor="#14B8A6"
      borderColor="#99f6e4"
      bgColor="#f0fdfa"
      shape="hexagon"
      inputs={[]}
      outputs={[{ id: 'structure_out' }]}
      selected={selected}
    >
      <p className="text-[10px] font-medium text-teal-600 uppercase">{structureType}</p>
    </BaseNode>
  )
}
