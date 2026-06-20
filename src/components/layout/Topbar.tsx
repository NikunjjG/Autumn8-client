import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCircle, CaretDown, SignOut, Atom } from '@phosphor-icons/react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { logout, setCredits } from '@/store/slices/authSlice'
import { axiosInstance } from '@/utils/axiosInstance'

export default function Topbar() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const credits = useAppSelector((state) => state.auth.credits)

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await axiosInstance.get('/credits')
        dispatch(setCredits(response.data.credits))
      } catch (err) {
        // 401 is handled by the interceptor
        console.log(err)
      }
    }
    fetchCredits()
  }, [dispatch])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/25">
            <span className="text-white font-extrabold text-sm">A</span>
          </div>
          <span className="text-lg font-bold text-slate-900">Autumn8</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
            <Atom className="size-4 text-primary" weight="bold" />
            <span className="text-sm font-semibold text-slate-700">{credits ?? '—'}</span>
            <span className="text-xs text-slate-400">credits</span>
          </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors"
          >
            <UserCircle className="size-7 text-slate-500" weight="fill" />
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">
              {user?.username ?? 'User'}
            </span>
            <CaretDown
              className={`size-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/50 py-1">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
              >
                <SignOut className="size-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  )
}
