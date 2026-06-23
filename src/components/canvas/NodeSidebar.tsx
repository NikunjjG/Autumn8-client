import {
  FlagCheckered,
  TextT,
  Brain,
  TreeStructure,
  Terminal,
  Plug,
  Globe,
} from '@phosphor-icons/react'
import type { ReactNode, DragEvent } from 'react'

interface NodeItem {
  type: string
  label: string
  icon: ReactNode
  color: string
}

interface NodeGroup {
  category: string
  items: NodeItem[]
}

const NODE_GROUPS: NodeGroup[] = [
  {
    category: 'Triggers',
    items: [
      { type: 'input', label: 'Input', icon: <TextT weight="bold" className="size-4" />, color: '#0EA5E9' },
    ],
  },
  {
    category: 'Processing',
    items: [
      { type: 'llm_agent', label: 'LLM Agent', icon: <Brain weight="fill" className="size-4" />, color: '#8B5CF6' },
      { type: 'structure', label: 'Structure', icon: <TreeStructure weight="fill" className="size-4" />, color: '#14B8A6' },
      { type: 'code', label: 'Code', icon: <Terminal weight="bold" className="size-4" />, color: '#EAB308' },
    ],
  },
  {
    category: 'Integrations',
    items: [
      { type: 'http_request', label: 'HTTP Request', icon: <Globe weight="bold" className="size-4" />, color: '#f26522' },
      { type: 'mcp_tool', label: 'MCP Tool', icon: <Plug weight="fill" className="size-4" />, color: '#6366F1' },
    ],
  },
  {
    category: 'Output',
    items: [
      { type: 'end', label: 'End', icon: <FlagCheckered weight="fill" className="size-4" />, color: '#F43F5E' },
    ],
  },
]

function onDragStart(event: DragEvent, nodeType: string) {
  event.dataTransfer.setData('application/autumn8-node', nodeType)
  event.dataTransfer.effectAllowed = 'move'
}

export default function NodeSidebar() {
  return (
    <div className="w-52 h-full border-r border-slate-200 bg-white overflow-y-auto">
      <div className="px-4 py-4 border-b border-slate-100">
        <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Nodes</p>
      </div>

      <div className="py-2">
        {NODE_GROUPS.map((group) => (
          <div key={group.category} className="mb-1">
            <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {group.category}
            </p>
            <div className="space-y-0.5 px-2">
              {group.items.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type)}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors"
                >
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded shrink-0"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="text-white">{item.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
