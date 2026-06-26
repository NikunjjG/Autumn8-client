import { Navigate, Outlet } from 'react-router-dom'
import Topbar from '@/components/layout/Topbar'

export default function ProtectedRoute() {
  const token = localStorage.getItem('authToken')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden min-h-0">
      <Topbar />
      <Outlet />
    </div>
  )
}
