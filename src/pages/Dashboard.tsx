import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, PencilSimple, Trash, Check, Users, Globe, ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Workflow {
  id: string
  name: string
  published: boolean
  collaborative: boolean
  updatedAt: string
}

const MOCK_WORKFLOWS: Workflow[] = [
  { id: 'wf_1', name: 'Support Ticket Classifier', published: true, collaborative: true, updatedAt: '2026-06-21T14:30:00Z' },
  { id: 'wf_2', name: 'Weekly Sprint Digest', published: true, collaborative: false, updatedAt: '2026-06-20T09:15:00Z' },
  { id: 'wf_3', name: 'Customer Onboarding Flow', published: false, collaborative: true, updatedAt: '2026-06-22T11:00:00Z' },
  { id: 'wf_4', name: 'Untitled - 1', published: false, collaborative: false, updatedAt: '2026-06-22T16:45:00Z' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function WorkflowTable({ workflows, onEdit, onDelete, onRename }: {
  workflows: Workflow[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const startRename = (wf: Workflow) => {
    setEditingId(wf.id)
    setEditName(wf.name)
  }

  const commitRename = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim())
    }
    setEditingId(null)
  }

  if (workflows.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        No workflows yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Name</TableHead>
            <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Type</TableHead>
            <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Last Modified</TableHead>
            <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100 bg-white">
          {workflows.map((wf) => (
            <TableRow key={wf.id} className="hover:bg-slate-50/80 transition-colors group">
              <TableCell className="px-6 py-5">
                <div className="flex items-center gap-3">
                  {editingId === wf.id ? (
                    <Input
                      variant="ghost"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => commitRename(wf.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(wf.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                      className="max-w-[240px] h-8 text-sm font-semibold"
                    />
                  ) : (
                    <span
                      className="font-semibold text-slate-900 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => onEdit(wf.id)}
                    >
                      {wf.name}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-6 py-5">
                {wf.collaborative && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                    <Users className="size-3" />
                    Collab
                  </span>
                )}
                {!wf.collaborative && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                    Solo
                  </span>
                )}
              </TableCell>
              <TableCell className="px-6 py-5 text-slate-500 text-xs">{formatDate(wf.updatedAt)}</TableCell>
              <TableCell className="px-6 py-5 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEdit(wf.id)}
                    className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                    title="Open"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startRename(wf)}
                    className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                    title="Rename"
                  >
                    <PencilSimple className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(wf.id)}
                    className="p-1.5 text-slate-400 hover:text-error transition-colors"
                    title="Delete"
                  >
                    <Trash className="size-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const published = workflows.filter(w => w.published)
  const unpublished = workflows.filter(w => !w.published)

  const handleCreate = () => {
    const count = workflows.filter(w => w.name.startsWith('Untitled')).length
    const newWorkflow: Workflow = {
      id: `wf_${Date.now()}`,
      name: `Untitled - ${count + 1}`,
      published: false,
      collaborative: false,
      updatedAt: new Date().toISOString(),
    }
    setWorkflows([newWorkflow, ...workflows])
    navigate(`/workflow/${newWorkflow.id}`)
  }

  const handleEdit = (id: string) => {
    navigate(`/workflow/${id}`)
  }

  const handleDelete = (id: string) => {
    const wf = workflows.find(w => w.id === id)
    setWorkflows(workflows.filter(w => w.id !== id))
    showToast(`Deleted "${wf?.name}"`)
  }

  const handleRename = (id: string, name: string) => {
    setWorkflows(workflows.map(w => w.id === id ? { ...w, name } : w))
    showToast(`Renamed to "${name}"`)
  }

  return (
    <div className="flex-1 bg-[#fcfcfc]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Workflows</h1>
            <p className="text-sm text-slate-500 mt-1">Build, manage, and deploy your AI workflows.</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-1.5">
            <Plus className="size-4" />
            New Workflow
          </Button>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="size-4 text-success" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Published</h2>
              <span className="text-xs text-slate-400 font-medium">{published.length} workflows</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <WorkflowTable
                workflows={published}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <PencilSimple className="size-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Unpublished</h2>
              <span className="text-xs text-slate-400 font-medium">{unpublished.length} drafts</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <WorkflowTable
                workflows={unpublished}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            </div>
          </section>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-2 z-[9999]">
          <Check className="text-success size-5" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}
    </div>
  )
}
