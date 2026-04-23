import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import useInactivityLogout from '../hooks/useInactivityLogout'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loggingOutRef = useRef(false)

  const fetchMe = useCallback(async () => {
    if (!authApi.isAuthenticated()) { setLoading(false); return }
    try {
      const me = await authApi.me()
      setUser(me)
    } catch {
      await authApi.logout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const logout = useCallback(async () => {
    if (loggingOutRef.current) return
    loggingOutRef.current = true
    await authApi.logout()
    queryClient.clear()
    setUser(null)
    loggingOutRef.current = false
    navigate('/login')
  }, [navigate, queryClient])

  useEffect(() => {
    const onExpired = () => logout()
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [logout])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    setUser(data.user)
    return data
  }

  const register = async (formData) => {
    const newUser = await authApi.register(formData)
    return newUser
  }

  const isAdmin = user?.role === 'admin' || (user?.permissions?.includes('view_dashboard') ?? false)

  useInactivityLogout(logout, !!user)

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
