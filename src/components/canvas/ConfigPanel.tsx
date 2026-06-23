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
  onClose: () => void
}

function StartConfig({ node }: { node: Node }) {
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

function InputConfig({ node }: { node: Node }) {
  const { updateNodeData } = useReactFlow()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Prompt Text</label>
        <textarea
          value={(node.data.value as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, value: e.target.value })}
          placeholder="Enter the prompt that will be sent to the LLM..."
          rows={6}
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
        />
      </div>
    </div>
  )
}

function LLMAgentConfig({ node }: { node: Node }) {
  const { updateNodeData } = useReactFlow()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Model</label>
        <select
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
          value={(node.data.model as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, model: e.target.value })}
        >
          <option value="" disabled>Select a model</option>
          <option value="claude-sonnet">Claude Sonnet</option>
          <option value="claude-haiku">Claude Haiku</option>
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
        </select>
      </div>
      <p className="text-[10px] text-slate-400">The model is selected from the API keys configured in your profile settings.</p>
    </div>
  )
}

function StructureConfig({ node }: { node: Node }) {
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

function CodeConfig({ node }: { node: Node }) {
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

function MCPToolConfig({ node }: { node: Node }) {
  const { updateNodeData } = useReactFlow()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">MCP Server</label>
        <select
          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          value={(node.data.serverId as string) ?? ''}
          onChange={(e) => updateNodeData(node.id, { ...node.data, serverId: e.target.value, toolName: '' })}
        >
          <option value="" disabled>Select MCP server</option>
          <option value="jira">Jira</option>
          <option value="github">GitHub</option>
          <option value="slack">Slack</option>
        </select>
      </div>
      {(node.data.serverId as string) && (
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tool</label>
          <select
            className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            value={(node.data.toolName as string) ?? ''}
            onChange={(e) => updateNodeData(node.id, { ...node.data, toolName: e.target.value })}
          >
            <option value="" disabled>Select tool</option>
            <option value="get_tickets">get_tickets</option>
            <option value="create_issue">create_issue</option>
            <option value="send_message">send_message</option>
          </select>
        </div>
      )}
      <p className="text-[10px] text-slate-400">MCP servers are configured in Profile → Integrations. The selected tool will be available to the connected LLM Agent.</p>
    </div>
  )
}

function HttpRequestConfig({ node }: { node: Node }) {
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

function EndConfig({ node }: { node: Node }) {
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

const CONFIG_COMPONENTS: Record<string, React.ComponentType<{ node: Node }>> = {
  start: StartConfig,
  input: InputConfig,
  llm_agent: LLMAgentConfig,
  structure: StructureConfig,
  code: CodeConfig,
  mcp_tool: MCPToolConfig,
  http_request: HttpRequestConfig,
  end: EndConfig,
}

const NODE_TITLES: Record<string, { label: string; color: string }> = {
  start: { label: 'Start', color: '#10B981' },
  input: { label: 'Input', color: '#0EA5E9' },
  llm_agent: { label: 'LLM Agent', color: '#8B5CF6' },
  structure: { label: 'Structure', color: '#14B8A6' },
  code: { label: 'Code', color: '#EAB308' },
  mcp_tool: { label: 'MCP Tool', color: '#6366F1' },
  http_request: { label: 'HTTP Request', color: '#f26522' },
  end: { label: 'End', color: '#F43F5E' },
}

export default function ConfigPanel({ node, onClose }: ConfigPanelProps) {
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
        <ConfigComponent node={node} />
      </div>
    </div>
  )
}
