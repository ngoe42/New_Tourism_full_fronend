import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireSuperAdmin({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user || !user.is_superadmin) {
    return <Navigate to="/admin" replace />
  }

  return children
}
