import { Navigate, Outlet } from 'react-router-dom'

export default function PublicRoute() {
  const token = localStorage.getItem('authToken')

  if (token) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
