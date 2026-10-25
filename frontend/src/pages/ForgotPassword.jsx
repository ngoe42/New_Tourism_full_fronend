import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { authApi } from '../api/auth'
import extractError from '../utils/extractError'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(extractError(err, 'Something went wrong'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="bg-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
              <img src="/images/logo/logo.png" alt="Nelson Tours & Safari" className="h-14 w-auto object-contain" />
            </div>
          </div>
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-green-950 border border-green-800 mb-3">
            <Mail size={18} className="text-amber-400" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-1">Reset Password</h1>
          <p className="font-sans text-sm text-gray-500">We'll send a reset link to your email</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <p className="font-sans text-sm text-gray-300">
                If that email is registered, a reset link has been sent. Check your inbox.
              </p>
              <p className="font-sans text-xs text-gray-500">The link expires in 1 hour.</p>
              <Link
                to="/login/admin"
                className="inline-flex items-center gap-1.5 font-sans text-sm text-green-400 hover:text-green-300 transition"
              >
                <ArrowLeft size={14} /> Back to login
              </Link>
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
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl font-sans text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600/40 focus:border-green-700 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-sans text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-1">
                <Link
                  to="/login/admin"
                  className="inline-flex items-center gap-1.5 font-sans text-xs text-gray-500 hover:text-green-400 transition"
                >
                  <ArrowLeft size={12} /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
