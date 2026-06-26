# Autumn8 — Client

Visual workflow editor and dashboard for the Autumn8 platform. Built with React, TypeScript, Vite, Tailwind CSS, ShadCN, and XYFlow.

## Features

### Workflow Canvas
- **XYFlow-powered editor** — controlled state, drag-and-drop from sidebar, configurable nodes
- **9 node types** with distinct visual identities (color-coded, shape-differentiated)
- **Connection validation** — type-safe handles (context, prompt, structure), DAG enforcement, single-connection-per-input rule
- **Config panel** — side panel with node-specific editors. Python and JSON editors with syntax highlighting (PrismJS). `/` mention system for referencing upstream node outputs.
- **Execution terminal** — real-time progress display during workflow simulation, color-coded events, context object dump on completion

### Collaboration
- **Socket.io integration** — real-time delta sync for node/edge changes between users
- **Cursor sharing** — Figma-style colored cursors with username labels, flow-coordinate normalized across zoom/pan levels
- **Session management** — owner generates shareable URLs, collaborators can edit but not save, session can be revoked
- **Role awareness** — UI adapts based on URL (owner sees full toolbar, collaborator sees "Live session" badge)

### Authentication
- **Redux Toolkit** — auth state (token, user, credits) persisted in localStorage
- **Protected/Public route guards** — redirect-based, localStorage token check
- **Axios interceptors** — auto-attach Bearer token, catch 401 → clear state → redirect to login

### Dashboard
- Published and unpublished workflow tables
- Create, rename (inline in editor), delete workflows
- Collaboration badge per workflow

## Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4, ShadCN (Radix Lyra) |
| Canvas | @xyflow/react |
| State | Redux Toolkit |
| Real-time | Socket.io Client |
| HTTP | Axios |
| Icons | Phosphor Icons |
| Code Editor | react-simple-code-editor + PrismJS |

## Project Structure

```
src/
├── components/
│   ├── canvas/          # ConfigPanel, NodeSidebar, ExecutionTerminal, ExecuteModal, RemoteCursors
│   ├── guards/          # ProtectedRoute, PublicRoute
│   ├── layout/          # Topbar (credits display, profile dropdown)
│   ├── nodes/           # BaseNode + 9 node type components
│   └── ui/              # ShadCN components (Button, Input, Table, etc.)
├── hooks/
│   └── useWorkflowSocket.ts   # Socket connection, event handling, cursor sync
├── pages/
│   ├── Dashboard.tsx    # Workflow list
│   ├── WorkflowEditor.tsx  # Canvas + sidebar + config + terminal
│   ├── Login.tsx        # Auth form
│   └── Signup.tsx       # Registration form
├── socket/              # Connection factory + event constants
├── store/               # Redux store + auth slice
└── utils/               # Axios instance, connection validation (DAG + type checks)
```

## Running

```bash
npm install
npm run dev
```

Requires `VITE_BACKEND_HOST_URI` in `.env` pointing to the Express server.
