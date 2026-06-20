import { useEffect, useRef, useState } from 'react'
import './App.css'
import { establishSocketConnection } from './socket/socket.functions'
import type { Socket } from 'socket.io-client'
import { WEB_SOCKET_ACTIONS } from './socket/ws_actions'
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import PublicRoute from '@/components/guards/PublicRoute';

// Phosphor icons
import { 
  MagnifyingGlass, 
  PencilSimple, 
  Trash, 
  WarningCircle, 
  ShareNetwork, 
  Check, 
  Plus, 
  FileCsv
} from '@phosphor-icons/react'

// Shadcn Custom UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppSelector } from './store/store'

interface ISessionToken {
  sessionId: string;
  sessionToken: string;
}

interface ICoordinates {
  x: number,
  y: number
}

interface ICursorMap {
  [key: string]: ICoordinates
}

function SocketPlaceHolder() {
  const { token } = useParams()

  const [USER] = useState(() => ({
    userId: `user_${Math.random().toString(36).substring(2, 11)}`,
    userName: "Nikunj"
  }))

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  const socketRef = useRef<null | Socket>(null)
  const [sessionToken, setSessionToken] = useState<ISessionToken | null>(null)
  const [remoteCursors, setRemoteCursors] = useState<ICursorMap>({});
  
  // Interactive showcase state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [students, setStudents] = useState([
    { id: "AJ", name: "Alex Johnson", course: "Computer Science 101", status: "Paid", date: "Aug 12, 2023" },
    { id: "SW", name: "Sarah Williams", course: "Digital Marketing", status: "Pending", date: "Aug 15, 2023" },
    { id: "MC", name: "Michael Chen", course: "Business Management", status: "Overdue", date: "Aug 09, 2023" }
  ])
  const [newStudentName, setNewStudentName] = useState("")
  const [newStudentCourse, setNewStudentCourse] = useState("")

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const enableCollaboration = () => {
    if (socketRef.current) return;

    const socket = establishSocketConnection()
    socketRef.current = socket

    socket.on(WEB_SOCKET_ACTIONS.CONNECT, () => {
      triggerToast("Collaboration enabled! Sharing workspace...")
      if (token) {
        socket.emit(WEB_SOCKET_ACTIONS.JOIN_SESSION, token)
      } else {
        socket.emit(WEB_SOCKET_ACTIONS.CREATE_SESSION, USER.userId)
      }
    })

    socket.on(WEB_SOCKET_ACTIONS.SESSION_CREATED, (data) => {
      setSessionToken(data)
    });

    socket.on(WEB_SOCKET_ACTIONS.CURSOR_MOVEMENT_LISTENER, (data: { userId: string; coordinates: ICoordinates }) => {
      setRemoteCursors((prevCursors) => ({
        ...prevCursors,
        [data.userId]: data.coordinates
      }));
    });
  }

  useEffect(() => {
    if (token) {
      enableCollaboration()
    }
  }, [token])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const socket = socketRef.current;
      if (socket && socket.connected) {
        socket.emit(WEB_SOCKET_ACTIONS.CURSOR_MOVEMENT, {
          userId: USER.userId,
          coordinates: { x: event.clientX, y: event.clientY }
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
  
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [USER.userId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMovement = (data: { userId: string; coordinates: ICoordinates }) => {
      setRemoteCursors((prevCursors) => ({
        ...prevCursors,
        [data.userId]: data.coordinates
      }));
    };

    socket.on(WEB_SOCKET_ACTIONS.CURSOR_MOVEMENT, handleMovement);

    return () => {
      socket.off(WEB_SOCKET_ACTIONS.CURSOR_MOVEMENT, handleMovement);
    };
  }, [remoteCursors]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudentName || !newStudentCourse) {
      triggerToast("Please fill in both Name and Course!")
      return
    }
    const initials = newStudentName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    const newStudent = {
      id: initials || "ST",
      name: newStudentName,
      course: newStudentCourse,
      status: "Pending",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    setStudents([...students, newStudent])
    setNewStudentName("")
    setNewStudentCourse("")
    triggerToast(`Added student ${newStudent.name}!`)
  }

  const handleDeleteStudent = (id: string, name: string) => {
    setStudents(students.filter(s => s.id !== id))
    triggerToast(`Removed student ${name}`)
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#334155] font-sans antialiased flex flex-col">
      {/* Cursors Layer */}
      {Object.entries(remoteCursors).map(([userId, coords]) => (
        <div
          key={userId}
          className="pointer-events-none absolute transition-all duration-75 ease-out"
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            zIndex: 9999,
          }}
        >
          <svg
            className="w-5 h-5 fill-primary stroke-[#1e293b] stroke-2 drop-shadow-md"
            viewBox="0 0 24 24"
          >
            <path d="M4.5 3V18l4.28-4.28 4.72 9.56 3.14-1.56-4.72-9.56H19.5z" />
          </svg>
          <span className="ml-3 bg-primary text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
            {userId === USER.userId ? "You" : `User ${userId}`}
          </span>
        </div>
      ))}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-2 z-[9999] animate-fade-in">
          <Check className="text-success size-5" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Real-time Collaboration Sandbox Widget */}
      {sessionToken?.sessionToken && (
        <div className="bg-orange-50 border-b border-orange-200 py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShareNetwork className="text-primary size-5" />
              <p className="text-xs font-medium text-orange-950">
                Invite team members to view and test your live components simultaneously!
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                readOnly
                value={`${window.location.origin}/${sessionToken.sessionToken}`}
                className="bg-white border border-orange-200 text-xs px-3 py-1.5 rounded w-full sm:w-80 font-mono text-slate-600 focus:outline-none"
              />
              <Button size="xs" onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${sessionToken.sessionToken}`);
                triggerToast("Session link copied to clipboard!");
              }}>
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Showcase */}
      <main className="flex-1">
        {/* Colors Section */}
        <section className="section-container" id="colors">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Color Palette</h2>
            <p className="text-slate-500">Our color system is built to ensure consistent visual identity and accessibility.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Primary Brand */}
            <div className="card-outline">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Primary Brand</h3>
              <div className="flex items-center gap-6">
                <div className="h-24 w-48 rounded bg-primary shadow-sm flex items-end p-3 text-white text-xs font-bold font-mono">
                  #F26522
                </div>
                <div>
                  <p className="font-bold text-slate-900">Primary Orange</p>
                  <p className="text-sm text-slate-500">Main brand interaction color.</p>
                  <p className="font-mono text-xs text-slate-400 mt-1">var(--primary)</p>
                </div>
              </div>
            </div>

            {/* Functional Status */}
            <div className="card-outline">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Functional Status</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="h-16 w-full rounded bg-success mb-2 shadow-inner" />
                  <p className="text-[10px] font-bold text-slate-900 uppercase">Success</p>
                  <p className="text-[10px] font-mono text-slate-400">#10B981</p>
                </div>
                <div>
                  <div className="h-16 w-full rounded bg-warning mb-2 shadow-inner" />
                  <p className="text-[10px] font-bold text-slate-900 uppercase">Warning</p>
                  <p className="text-[10px] font-mono text-slate-400">#F59E0B</p>
                </div>
                <div>
                  <div className="h-16 w-full rounded bg-error mb-2 shadow-inner" />
                  <p className="text-[10px] font-bold text-slate-900 uppercase">Error</p>
                  <p className="text-[10px] font-mono text-slate-400">#F43F5E</p>
                </div>
                <div>
                  <div className="h-16 w-full rounded bg-info mb-2 shadow-inner" />
                  <p className="text-[10px] font-bold text-slate-900 uppercase">Info</p>
                  <p className="text-[10px] font-mono text-slate-400">#0EA5E9</p>
                </div>
              </div>
            </div>
          </div>

          {/* Neutral Scale */}
          <div className="card-outline">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Neutral Scale (Slate)</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
              <div className="text-center">
                <div className="h-12 w-full rounded bg-[#F8FAFC] border border-slate-200 mb-2" />
                <span className="text-[10px] text-slate-500 font-mono">50</span>
              </div>
              <div className="text-center">
                <div className="h-12 w-full rounded bg-[#F1F5F9] mb-2" />
                <span className="text-[10px] text-slate-500 font-mono">100</span>
              </div>
              <div className="text-center">
                <div className="h-12 w-full rounded bg-[#E2E8F0] mb-2" />
                <span className="text-[10px] text-slate-500 font-mono">200</span>
              </div>
              <div className="text-center">
                <div className="h-12 w-full rounded bg-[#CBD5E1] mb-2" />
                <span className="text-[10px] text-slate-500 font-mono">300</span>
              </div>
              <div className="text-center">
                <div className="h-12 w-full rounded bg-[#94A3B8] mb-2" />
                <span className="text-[10px] text-slate-500 font-mono">400</span>
              </div>
              <div className="text-center">
                <div className="h-12 w-full rounded bg-[#64748B] mb-2" />
                <span className="text-[10px] text-slate-500 font-mono">500</span>
              </div>
              <div className="text-center">
                <div className="h-12 w-full rounded bg-[#475569] mb-2" />
                <span className="text-[10px] text-slate-500 font-mono">600</span>
              </div>
              <div className="text-center">
                <div className="h-12 w-full rounded bg-[#334155] mb-2" />
                <span className="text-[10px] text-slate-500 font-mono">700</span>
              </div>
              <div className="text-center">
                <div className="h-12 w-full rounded bg-[#1E293B] mb-2" />
                <span className="text-[10px] text-slate-500 font-mono">800</span>
              </div>
              <div className="text-center">
                <div className="h-12 w-full rounded bg-[#0F172A] mb-2" />
                <span className="text-[10px] text-slate-500 font-mono">900</span>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="section-container border-t border-slate-100" id="typography">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Typography</h2>
            <p className="text-slate-500">Using 'Inter' as our primary typeface for clarity and legibility.</p>
          </div>
          
          <div className="card-outline divide-y divide-slate-100 space-y-8">
            <div className="pt-2 flex flex-col md:flex-row md:items-center gap-4 md:gap-24">
              <span className="text-[10px] font-mono text-slate-400 w-32 shrink-0 uppercase tracking-widest">Heading 1 (36px)</span>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">The quick brown fox jumps over the lazy dog</h1>
            </div>
            <div className="pt-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-24">
              <span className="text-[10px] font-mono text-slate-400 w-32 shrink-0 uppercase tracking-widest">Heading 2 (30px)</span>
              <h2 className="text-3xl font-semibold text-slate-900">The quick brown fox jumps over the lazy dog</h2>
            </div>
            <div className="pt-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-24">
              <span className="text-[10px] font-mono text-slate-400 w-32 shrink-0 uppercase tracking-widest">Body Large (18px)</span>
              <p className="text-lg text-slate-700">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div className="pt-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-24">
              <span className="text-[10px] font-mono text-slate-400 w-32 shrink-0 uppercase tracking-widest">Body Base (16px)</span>
              <p className="text-base text-slate-600">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div className="pt-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-24 pb-2">
              <span className="text-[10px] font-mono text-slate-400 w-32 shrink-0 uppercase tracking-widest">Label Small (12px)</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">The quick brown fox jumps over the lazy dog</span>
            </div>
          </div>
        </section>

        {/* Forms Section */}
        <section className="section-container border-t border-slate-100" id="forms">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Forms &amp; Inputs</h2>
            <p className="text-slate-500">Standardized ghost input fields and form controls for a borderless, airy user experience.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ghost Text Inputs */}
            <div className="card-outline bg-white">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Text Inputs (Ghost)</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Default State</label>
                  <Input 
                    variant="ghost" 
                    placeholder="Enter text..." 
                    onChange={() => triggerToast("Input value changed!")}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Active / Focus</label>
                  <Input 
                    variant="ghost" 
                    isActive={true} 
                    defaultValue="Currently being edited" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Error State</label>
                  <Input 
                    variant="ghost" 
                    isError={true} 
                    defaultValue="Invalid input" 
                  />
                  <div className="mt-1.5 flex items-center gap-1 error-text font-medium text-xs">
                    <WarningCircle className="size-4" />
                    <span>Please enter a valid email address.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Select */}
            <div className="card-outline bg-white">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Search &amp; Dropdowns</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Search Bar</label>
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <MagnifyingGlass className="size-5" />
                    </span>
                    <Input 
                      variant="ghost" 
                      className="pl-10" 
                      placeholder="Search records..." 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select Menu</label>
                  <Select onValueChange={(v) => triggerToast(`Option selected: ${v}`)}>
                    <SelectTrigger variant="ghost" className="w-full">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="elementary-school">Elementary School</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Textarea</label>
                  <Textarea variant="ghost" placeholder="Enter description..." rows={3} />
                </div>
              </div>
            </div>

            {/* Checkboxes & Radios */}
            <div className="card-outline lg:col-span-2 bg-white">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Checkboxes &amp; Radio Buttons</h3>
              
              <div className="flex flex-wrap gap-12">
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Checkboxes</label>
                  
                  <div className="flex items-center gap-3">
                    <Checkbox id="chk-active" defaultChecked onCheckedChange={(c) => triggerToast(`Active Status changed: ${c}`)} />
                    <label htmlFor="chk-active" className="text-sm font-medium text-slate-600 select-none cursor-pointer">
                      Active Status
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox id="chk-optin" onCheckedChange={(c) => triggerToast(`Newsletter changed: ${c}`)} />
                    <label htmlFor="chk-optin" className="text-sm font-medium text-slate-600 select-none cursor-pointer">
                      Newsletter Opt-in
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Radio Buttons</label>
                  
                  <RadioGroup defaultValue="student" onValueChange={(r) => triggerToast(`Role selected: ${r}`)}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="student" id="rad-student" />
                      <label htmlFor="rad-student" className="text-sm font-medium text-slate-600 select-none cursor-pointer">
                        Student
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="teacher" id="rad-teacher" />
                      <label htmlFor="rad-teacher" className="text-sm font-medium text-slate-600 select-none cursor-pointer">
                        Teacher
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tables Section */}
        <section className="section-container border-t border-slate-100" id="tables">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Data Tables</h2>
            <p className="text-slate-500">Structured data presentation with clear hierarchy and actionable items.</p>
          </div>

          <div className="card-outline overflow-hidden px-0 py-0 bg-white">
            {/* Table Control Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Student Enrollment Records</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-white" onClick={() => triggerToast("Exporting CSV...")}>
                  <FileCsv className="size-4 mr-1.5" />
                  Export CSV
                </Button>
                <Button size="sm" onClick={() => triggerToast("Use the form below to add a student record!")}>
                  <Plus className="size-4 mr-1" />
                  Add Student
                </Button>
              </div>
            </div>

            {/* Table Rendering */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Name</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Course</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Fee Status</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Enrollment Date</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 bg-white">
                  {students.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                            {student.id}
                          </div>
                          <span className="font-semibold text-slate-900">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-slate-600 text-xs">{student.course}</TableCell>
                      <TableCell className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${
                          student.status === "Paid" 
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10" 
                            : student.status === "Pending"
                            ? "bg-amber-50 text-amber-700 ring-amber-600/10"
                            : "bg-rose-50 text-rose-700 ring-rose-600/10"
                        }`}>
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-slate-500 text-xs">{student.date}</TableCell>
                      <TableCell className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => triggerToast(`Edit: ${student.name}`)} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                            <PencilSimple className="size-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteStudent(student.id, student.name)} className="p-1.5 text-slate-400 hover:text-error transition-colors">
                            <Trash className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Inline Form to demonstrate interactive table */}
          <div className="mt-6 card-outline max-w-xl bg-white">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Add Student Record Sandbox</h4>
            <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row gap-3">
              <Input 
                variant="ghost" 
                placeholder="Student Name" 
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
              <Input 
                variant="ghost" 
                placeholder="Course Name" 
                value={newStudentCourse}
                onChange={(e) => setNewStudentCourse(e.target.value)}
              />
              <Button type="submit">Add student</Button>
            </form>
          </div>
        </section>

        {/* Spacing Section */}
        <section className="section-container border-t border-slate-100" id="spacing">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Spacing &amp; Grid</h2>
            <p className="text-slate-500">We utilize an 8pt grid system for consistent layouts.</p>
          </div>

          <div className="card-outline bg-white">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Spacing Increments</h3>
            <div className="flex items-end gap-12 overflow-x-auto pb-4">
              <div className="text-center">
                <div className="bg-primary/10 border border-primary/20 h-1 w-1 mx-auto mb-4" title="4px" />
                <span className="text-[10px] font-mono text-slate-400">4px</span>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 border border-primary/20 h-2 w-2 mx-auto mb-4" title="8px" />
                <span className="text-[10px] font-mono text-slate-400">8px</span>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 border border-primary/20 h-4 w-4 mx-auto mb-4" title="16px" />
                <span className="text-[10px] font-mono text-slate-400">16px</span>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 border border-primary/20 h-8 w-8 mx-auto mb-4" title="32px" />
                <span className="text-[10px] font-mono text-slate-400">32px</span>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 border border-primary/20 h-16 w-16 mx-auto mb-4" title="64px" />
                <span className="text-[10px] font-mono text-slate-400">64px</span>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 border border-primary/20 h-24 w-24 mx-auto mb-4" title="96px" />
                <span className="text-[10px] font-mono text-slate-400">96px</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">© 2023 EduManage Design Team. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-slate-400">
            <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => triggerToast("Showcasing components in App.tsx")}>Showcase Playground</span>
            <span>·</span>
            <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => triggerToast("Design System Version 1.0.0")}>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <SocketPlaceHolder />,
      },
      {
        path: "/:token",
        element: <SocketPlaceHolder />,
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}