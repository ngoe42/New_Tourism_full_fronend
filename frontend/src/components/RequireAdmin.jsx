import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const hasAccess = user && (
    user.role === 'admin' ||
    (user.permissions && user.permissions.includes('view_dashboard'))
  )

  if (!hasAccess) {
    return <Navigate to="/" replace />
  }

  return children
}
