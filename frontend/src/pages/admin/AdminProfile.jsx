import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usersApi } from '../../api/users'
import extractError from '../../utils/extractError'

export default function AdminProfile() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [showCurrent, setShowCurrent]   = useState(false)
  const [showNew, setShowNew]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [success, setSuccess]           = useState(false)
  const [error, setError]               = useState(null)

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }))
    setError(null)
    setSuccess(false)
  }

  const mutation = useMutation({
    mutationFn: () => usersApi.changePassword(form.current_password, form.new_password),
    onSuccess: () => {
      setSuccess(true)
      setError(null)
      setForm({ current_password: '', new_password: '', confirm_password: '' })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (err) => {
      setError(extractError(err, 'Failed to change password'))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match')
      return
    }
    if (form.new_password.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    mutation.mutate()
  }

  const PasswordInput = ({ id, value, show, onToggle, placeholder, onChange }) => (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Account info card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-sans text-sm font-semibold text-gray-800">Account Information</h2>
        </div>
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
            <span className="font-sans text-xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase() ?? <User size={22} />}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-sans text-base font-semibold text-gray-900 truncate">{user?.name ?? '—'}</p>
            <p className="font-sans text-sm text-gray-500 truncate">{user?.email ?? '—'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-green-100 text-green-700 rounded font-sans text-[11px] font-bold uppercase tracking-wide">
              {user?.role ?? 'admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <KeyRound size={15} className="text-green-700" />
          </div>
          <div>
            <h2 className="font-sans text-sm font-semibold text-gray-800">Change Password</h2>
            <p className="font-sans text-xs text-gray-400">Use a strong password of at least 8 characters</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label htmlFor="current_password" className="block font-sans text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Current Password
            </label>
            <PasswordInput
              id="current_password"
              value={form.current_password}
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
              placeholder="Enter your current password"
              onChange={(e) => set('current_password', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="new_password" className="block font-sans text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              New Password
            </label>
            <PasswordInput
              id="new_password"
              value={form.new_password}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
              placeholder="At least 8 characters"
              onChange={(e) => set('new_password', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirm_password" className="block font-sans text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Confirm New Password
            </label>
            <PasswordInput
              id="confirm_password"
              value={form.confirm_password}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              placeholder="Re-enter new password"
              onChange={(e) => set('confirm_password', e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="font-sans text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
              <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
              <p className="font-sans text-sm text-green-700">Password changed successfully.</p>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={mutation.isPending || !form.current_password || !form.new_password || !form.confirm_password}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-950 text-white rounded-xl font-sans text-sm font-medium hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
              {mutation.isPending ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
