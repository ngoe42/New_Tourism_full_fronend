import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle, AlertCircle } from 'lucide-react'
import { authApi } from '../api/auth'
import extractError from '../utils/extractError'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [form, setForm] = useState({ new_password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await authApi.resetPassword(token, form.new_password)
      setDone(true)
    } catch (err) {
      setError(extractError(err, 'Reset failed. The link may have expired.'))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <AlertCircle size={40} className="text-red-400 mx-auto" />
          <p className="font-sans text-sm text-gray-400">Invalid or missing reset token.</p>
          <Link to="/login/admin" className="font-sans text-sm text-green-400 hover:text-green-300 transition">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-950 border border-green-800 mb-4">
            <KeyRound size={22} className="text-amber-400" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-1">New Password</h1>
          <p className="font-sans text-sm text-gray-500">Set your new admin password</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {done ? (
            <div className="text-center space-y-4">
              <CheckCircle size={40} className="text-green-500 mx-auto" />
              <p className="font-sans text-sm text-gray-300">
                Password updated successfully!
              </p>
              <button
                onClick={() => navigate('/login/admin')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-sans text-sm font-semibold transition"
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl font-sans text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-sans text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.new_password}
                    onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-2.5 pr-11 bg-gray-800 border border-gray-700 rounded-xl font-sans text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600/40 focus:border-green-700 transition"
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

              <div>
                <label className="block font-sans text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-2.5 pr-11 bg-gray-800 border border-gray-700 rounded-xl font-sans text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600/40 focus:border-green-700 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !form.new_password || !form.confirm}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-sans text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
                {loading ? 'Saving…' : 'Set New Password'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
