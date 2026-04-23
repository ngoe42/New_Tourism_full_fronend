import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import extractError from '../utils/extractError'

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await authApi.superLogin(form.username, form.password)
      if (setUser) setUser(data.user)
      navigate('/superadmin')
    } catch (err) {
      setError(extractError(err, 'Invalid credentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-950 border border-green-800 mb-4">
            <Lock size={22} className="text-gold" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-1">System Access</h1>
          <p className="font-sans text-sm text-gray-500">Nelson Tours &amp; Safari · Admin</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl"
        >
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl font-sans text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block font-sans text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoComplete="username"
                placeholder="Enter username"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl font-sans text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600/40 focus:border-green-700 transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="w-full pl-9 pr-11 py-2.5 bg-gray-800 border border-gray-700 rounded-xl font-sans text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600/40 focus:border-green-700 transition"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.username || !form.password}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-sans text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="text-center pt-1">
            <Link
              to="/login/admin/forgot"
              className="font-sans text-xs text-gray-500 hover:text-green-400 transition"
            >
              Forgot password?
            </Link>
          </div>
        </form>

      </div>
    </div>
  )
}
