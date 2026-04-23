import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireSuperAdmin({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !user.is_superadmin) {
    return <Navigate to="/login/admin" replace />
  }

  return children
}
