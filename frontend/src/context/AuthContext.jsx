import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    if (!authApi.isAuthenticated()) { setLoading(false); return }
    try {
      const me = await authApi.me()
      setUser(me)
    } catch {
      authApi.logout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    setUser(data.user)
    return data
  }

  const register = async (formData) => {
    const newUser = await authApi.register(formData)
    return newUser
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  const isAdmin = user?.role === 'admin' || (user?.permissions?.includes('view_dashboard') ?? false)

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
