import { useState, useRef } from 'react'
import { useReactFlow, type Node } from '@xyflow/react'
import { X } from '@phosphor-icons/react'
import ReactSimpleCodeEditor from 'react-simple-code-editor'
const Editor = (ReactSimpleCodeEditor as any).default || ReactSimpleCodeEditor
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'

interface ConfigPanelProps {
  node: Node
  allNodes: Node[]
  onClose: () => void
}

interface NodeConfigProps {
  node: Node
  allNodes: Node[]
}

function StartConfig({ node }: NodeConfigProps) {
  const webhookUrl = (node.data?.webhookUrl as string) || 'Generated on publish'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Webhook URL</label>
        <p className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-2.5 truncate select-all">
          {webhookUrl}
        </p>
      </div>
      <p className="text-[10px] text-slate-400">This URL is generated when the workflow is published. Incoming POST requests to this URL trigger the workflow.</p>
    </div>
  )
}

function InputConfig({ node, allNodes }: NodeConfigProps) {
  const { updateNodeData } = useReactFlow()
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [cursorPos, setCursorPos] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const availableNodes = allNodes.filter((n) => n.id !== node.id)
  const filteredNodes = availableNodes.filter((n) =>
    n.id.toLowerCase().includes(mentionFilter.toLowerCase()) ||
    (n.type ?? '').toLowerCase().includes(mentionFilter.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '/') {
      setCursorPos(e.currentTarget.selectionStart + 1)
      setMentionFilter('')
      setShowMentions(true)
    } else if (e.key === 'Escape') {
      setShowMentions(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    updateNodeData(node.id, { ...node.data, value: val })

    if (showMentions) {
      const textAfterSlash = val.slice(cursorPos)
      const spaceIdx = textAfterSlash.indexOf(' ')
      const filterText = spaceIdx === -1 ? textAfterSlash : textAfterSlash.slice(0, spaceIdx)
      setMentionFilter(filterText)
      if (spaceIdx !== -1 && filterText === '') setShowMentions(false)
    }
  }

  const insertMention = (mentionNodeId: string) => {
    const val = (node.data.value as string) ?? ''
    const before = val.slice(0, cursorPos - 1)
    const after = val.slice(cursorPos + mentionFilter.length)
    const newVal = `${before}{{${mentionNodeId}}}${after}`
    updateNodeData(node.id, { ...node.data, value: newVal })
    setShowMentions(false)

    setTimeout(() => {
      const newPos = before.length + mentionNodeId.length + 4
      textareaRef.current?.setSelectionRange(newPos, newPos)
      textareaRef.current?.focus()
    }, 0)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Prompt Text</label>
        <textarea
          ref={textareaRef}
          value={(node.data.value as string) ?? ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowMentions(false), 200)}
          placeholder="Type / to reference a node's output..."
          rows={6}
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 font-mono"
        />
        {showMentions && filteredNodes.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-20 max-h-48 overflow-y-auto">
            {filteredNodes.map((n) => (
              <button
                key={n.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertMention(n.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: NODE_TITLES[n.type ?? '']?.color ?? '#94a3b8' }}
                />
                <span className="text-xs font-medium text-slate-700">{n.id}</span>
                <span className="text-[10px] text-slate-400">{NODE_TITLES[n.type ?? '']?.label ?? n.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-400">Type <code className="font-mono bg-slate-100 px-1 rounded">/</code> to reference another node's output. It inserts <code className="font-mono bg-slate-100 px-1 rounded">{'{{node_id}}'}</code> which resolves at execution.</p>
    </div>
  )
}

function LLMAgentConfig({ node }: NodeConfigProps) {
  const { updateNodeData } = useReactFlow()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Provider</label>
        <select
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
          value={(node.data.provider as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, provider: e.target.value })}
        >
          <option value="" disabled>Select a provider</option>
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
          <option value="google">Google</option>
        </select>
      </div>
      <p className="text-[10px] text-slate-400">API keys are configured in Profile → Settings. The cheapest model for the selected provider will be used.</p>
    </div>
  )
}

function StructureConfig({ node }: NodeConfigProps) {
  const { updateNodeData } = useReactFlow()
  const structureType = (node.data.structureType as string) ?? 'json'
  const lang = structureType === 'json' ? 'json' : 'python'
  const placeholder = structureType === 'json'
    ? '{\n  "name": "string",\n  "age": "number"\n}'
    : 'class Output(BaseModel):\n    name: str\n    age: int'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
        <div className="flex gap-2">
          <button
            className={`flex-1 text-xs font-bold px-3 py-2 rounded-md border transition-colors ${
              structureType === 'json'
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => updateNodeData(node.id, { ...node.data, structureType: 'json' })}
          >
            JSON
          </button>
          <button
            className={`flex-1 text-xs font-bold px-3 py-2 rounded-md border transition-colors ${
              structureType === 'pydantic'
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => updateNodeData(node.id, { ...node.data, structureType: 'pydantic' })}
          >
            Pydantic
          </button>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Schema</label>
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <Editor
            value={(node.data.schema as string) ?? placeholder}
            onValueChange={(code: string) => updateNodeData(node.id, { ...node.data, schema: code })}
            highlight={(code: string) => Prism.languages[lang] ? Prism.highlight(code, Prism.languages[lang], lang) : code}
            padding={12}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              minHeight: '160px',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function CodeConfig({ node }: NodeConfigProps) {
  const { updateNodeData } = useReactFlow()
  const defaultCode = 'def process(context):\n    # Transform the context object\n    return context'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Python Code</label>
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <Editor
            value={(node.data.code as string) ?? defaultCode}
            onValueChange={(code: string) => updateNodeData(node.id, { ...node.data, code: code })}
            highlight={(code: string) => Prism.languages.python ? Prism.highlight(code, Prism.languages.python, 'python') : code}
            padding={12}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              minHeight: '200px',
            }}
          />
        </div>
      </div>
      <p className="text-[10px] text-slate-400">Your function receives a <code className="font-mono bg-slate-100 px-1 rounded">context</code> object and must return it. Executed in a sandboxed environment with a 5s timeout. No network or filesystem access.</p>
    </div>
  )
}

function HttpRequestConfig({ node }: NodeConfigProps) {
  const { updateNodeData } = useReactFlow()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Method</label>
        <select
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
          value={(node.data.method as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, method: e.target.value })}
        >
          <option value="" disabled>Select method</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">URL</label>
        <input
          type="url"
          value={(node.data.url as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, url: e.target.value })}
          placeholder="https://api.example.com/data"
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Headers (JSON)</label>
        <textarea
          value={(node.data.headers as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, headers: e.target.value })}
          placeholder='{"Authorization": "Bearer ..."}'
          rows={3}
          spellCheck={false}
          className="w-full text-xs font-mono text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Body (JSON)</label>
        <textarea
          value={(node.data.body as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, body: e.target.value })}
          placeholder='{"key": "{{context.field}}"}'
          rows={4}
          spellCheck={false}
          className="w-full text-xs font-mono text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
        />
      </div>
      <p className="text-[10px] text-slate-400">Use <code className="font-mono bg-slate-100 px-1 rounded">{'{{context.field}}'}</code> syntax in headers and body to reference values from the context object.</p>
    </div>
  )
}

function ConditionalConfig({ node, allNodes }: NodeConfigProps) {
  const { updateNodeData } = useReactFlow()
  const conditionType = (node.data.conditionType as string) ?? 'arithmetic'

  const sourceNodes = allNodes.filter((n) => n.id !== node.id)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Condition Type</label>
        <div className="flex gap-2">
          <button
            className={`flex-1 text-xs font-bold px-3 py-2 rounded-md border transition-colors ${
              conditionType === 'arithmetic'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => updateNodeData(node.id, { ...node.data, conditionType: 'arithmetic', operator: '' })}
          >
            Arithmetic
          </button>
          <button
            className={`flex-1 text-xs font-bold px-3 py-2 rounded-md border transition-colors ${
              conditionType === 'string'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => updateNodeData(node.id, { ...node.data, conditionType: 'string', operator: '' })}
          >
            String
          </button>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Source Node</label>
        <select
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
          value={(node.data.sourceNode as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, sourceNode: e.target.value })}
        >
          <option value="" disabled>Select source node</option>
          {sourceNodes.map((n) => (
            <option key={n.id} value={n.id}>{n.id} ({n.type})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Field Path</label>
        <input
          type="text"
          value={(node.data.field as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, field: e.target.value })}
          placeholder="e.g. age, ticket.urgency"
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Operator</label>
        <select
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
          value={(node.data.operator as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, operator: e.target.value })}
        >
          <option value="" disabled>Select operator</option>
          {conditionType === 'arithmetic' ? (
            <>
              <option value=">">Greater than (&gt;)</option>
              <option value="<">Less than (&lt;)</option>
              <option value=">=">Greater or equal (&gt;=)</option>
              <option value="<=">Less or equal (&lt;=)</option>
              <option value="==">Equals (==)</option>
              <option value="!=">Not equals (!=)</option>
            </>
          ) : (
            <>
              <option value="equals">Equals</option>
              <option value="not_equals">Not equals</option>
              <option value="contains">Contains</option>
              <option value="starts_with">Starts with</option>
              <option value="ends_with">Ends with</option>
            </>
          )}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Compare Value</label>
        <input
          type="text"
          value={(node.data.compareValue as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, compareValue: e.target.value })}
          placeholder={conditionType === 'arithmetic' ? 'e.g. 18' : 'e.g. active'}
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
        />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-slate-500">True path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-[10px] text-slate-500">False path</span>
        </div>
      </div>
    </div>
  )
}

function ParallelConfig({ node }: NodeConfigProps) {
  const { updateNodeData } = useReactFlow()
  const branchCount = (node.data.branches as number) || 2
  const BRANCH_COLORS = ['#8B5CF6', '#0EA5E9', '#EAB308', '#F43F5E', '#10B981', '#f26522']

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Number of Branches</label>
        <input
          type="number"
          min={2}
          max={6}
          value={branchCount}
          onChange={(e) => {
            const val = Math.max(2, Math.min(6, parseInt(e.target.value) || 2))
            updateNodeData(node.id, { ...node.data, branches: val })
          }}
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
        />
      </div>
      <div className="space-y-2">
        {Array.from({ length: branchCount }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRANCH_COLORS[i % BRANCH_COLORS.length] }} />
            <span className="text-xs text-slate-500">Branch {i + 1}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400">All branches execute simultaneously. Use an LLM Agent node to merge the results.</p>
    </div>
  )
}

function EndConfig({ node }: NodeConfigProps) {
  const { updateNodeData } = useReactFlow()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Webhook URL</label>
        <input
          type="url"
          value={(node.data.webhookUrl as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, webhookUrl: e.target.value })}
          placeholder="https://your-api.com/webhook"
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
        />
      </div>
      <p className="text-[10px] text-slate-400">The final context object will be sent as a POST request to this URL when the workflow completes.</p>
    </div>
  )
}

const CONFIG_COMPONENTS: Record<string, React.ComponentType<NodeConfigProps>> = {
  start: StartConfig,
  input: InputConfig,
  llm_agent: LLMAgentConfig,
  structure: StructureConfig,
  code: CodeConfig,
  http_request: HttpRequestConfig,
  conditional: ConditionalConfig,
  parallel: ParallelConfig,
  end: EndConfig,
}

const NODE_TITLES: Record<string, { label: string; color: string }> = {
  start: { label: 'Start', color: '#10B981' },
  input: { label: 'Input', color: '#0EA5E9' },
  llm_agent: { label: 'LLM Agent', color: '#8B5CF6' },
  structure: { label: 'Structure', color: '#14B8A6' },
  code: { label: 'Code', color: '#EAB308' },
  http_request: { label: 'HTTP Request', color: '#f26522' },
  conditional: { label: 'Condition', color: '#F59E0B' },
  parallel: { label: 'Parallel', color: '#F59E0B' },
  end: { label: 'End', color: '#F43F5E' },
}

export default function ConfigPanel({ node, allNodes, onClose }: ConfigPanelProps) {
  const type = node.type ?? ''
  const ConfigComponent = CONFIG_COMPONENTS[type]
  const meta = NODE_TITLES[type]

  if (!ConfigComponent || !meta) return null

  return (
    <div className="w-80 h-full border-l border-slate-200 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: meta.color }}
          />
          <span className="text-sm font-bold text-slate-900">{meta.label}</span>
          <span className="text-[10px] font-mono text-slate-400">{node.id}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ConfigComponent node={node} allNodes={allNodes} />
      </div>
    </div>
  )
}
