import { useState } from 'react'
import { X, Play, WarningCircle } from '@phosphor-icons/react'
import ReactSimpleCodeEditor from 'react-simple-code-editor'
const Editor = (ReactSimpleCodeEditor as any).default || ReactSimpleCodeEditor
import Prism from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'

interface ExecuteModalProps {
  onClose: () => void
  onExecute: (triggerPayload: object) => void
  executing: boolean
}

const DEFAULT_PAYLOAD = '{\n  \n}'

export default function ExecuteModal({ onClose, onExecute, executing }: ExecuteModalProps) {
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD)
  const [error, setError] = useState<string | null>(null)

  const handleExecute = () => {
    setError(null)
    try {
      const parsed = JSON.parse(payload)
      onExecute(parsed)
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Simulate Workflow</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Enter the trigger payload — this is the data that would arrive via the Start node's webhook.
        </p>

        <div className="border border-slate-200 rounded-lg overflow-hidden mb-3">
          <Editor
            value={payload}
            onValueChange={(code: string) => setPayload(code)}
            highlight={(code: string) =>
              Prism.languages.json ? Prism.highlight(code, Prism.languages.json, 'json') : code
            }
            padding={16}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              minHeight: '140px',
            }}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-3 text-xs text-red-600">
            <WarningCircle className="size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleExecute}
          disabled={executing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <Play className="size-4" weight="fill" />
          {executing ? 'Executing...' : 'Execute'}
        </button>
      </div>
    </div>
  )
}
