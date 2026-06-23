import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import WorkflowEditor from '@/pages/WorkflowEditor'
import ProtectedRoute from '@/components/guards/ProtectedRoute'
import PublicRoute from '@/components/guards/PublicRoute'

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/workflow/:id',
        element: <WorkflowEditor />,
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/signup',
        element: <Signup />,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
