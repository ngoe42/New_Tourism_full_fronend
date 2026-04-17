import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Plus, Search, Edit2, Trash2, X, Shield, Check,
  ChevronDown, UserCheck, UserX, Eye, EyeOff
} from 'lucide-react'
import { userManagementApi } from '../../api/userManagement'

export default function AdminUsers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['manage-users'],
    queryFn: () => userManagementApi.listUsers({ limit: 200 }),
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['manage-roles'],
    queryFn: userManagementApi.listRoles,
  })

  const createMut = useMutation({
    mutationFn: userManagementApi.createUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manage-users'] }); setShowModal(false) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => userManagementApi.updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manage-users'] }); setEditUser(null) },
  })

  const deleteMut = useMutation({
    mutationFn: userManagementApi.deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['manage-users'] }),
  })

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.role_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-green-700" /> User Management
          </h2>
          <p className="font-sans text-sm text-gray-500 mt-1">{users.length} total users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-xl font-sans text-sm font-semibold hover:bg-green-800 transition-colors shadow-md"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or role…"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl font-sans text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="text-center px-5 py-3 font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center font-sans text-sm text-gray-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center font-sans text-sm text-gray-400">No users found</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-sans text-sm font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                          <p className="font-sans text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-sans text-xs font-semibold ${
                        u.role_name === 'Admin' ? 'bg-red-50 text-red-700' :
                        u.role_name === 'Manager' ? 'bg-blue-50 text-blue-700' :
                        u.role_name === 'Editor' ? 'bg-purple-50 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Shield size={11} />
                        {u.role_name || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(u.permissions || []).slice(0, 3).map((p) => (
                          <span key={p} className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-sans font-medium text-gray-600">
                            {p.replace('manage_', '').replace('view_', '')}
                          </span>
                        ))}
                        {(u.permissions || []).length > 3 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-sans font-medium text-gray-500">
                            +{u.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-sans text-xs font-semibold">
                          <UserCheck size={11} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-sans text-xs font-semibold">
                          <UserX size={11} /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditUser(u)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green-700 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Deactivate ${u.name}?`)) deleteMut.mutate(u.id) }}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <UserFormModal
            title="Create New User"
            roles={roles}
            error={createMut.error?.response?.data?.detail}
            isLoading={createMut.isPending}
            onClose={() => { setShowModal(false); createMut.reset() }}
            onSubmit={(data) => createMut.mutate(data)}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editUser && (
          <UserFormModal
            title={`Edit ${editUser.name}`}
            roles={roles}
            initialData={editUser}
            error={updateMut.error?.response?.data?.detail}
            isLoading={updateMut.isPending}
            onClose={() => { setEditUser(null); updateMut.reset() }}
            onSubmit={(data) => updateMut.mutate({ id: editUser.id, data })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Reusable form modal ─────────────────────────────────────────────── */
function UserFormModal({ title, roles, initialData, error, isLoading, onClose, onSubmit }) {
  const isEdit = !!initialData
  const [form, setForm] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    role_id: initialData?.role_id || '',
    is_active: initialData?.is_active ?? true,
  })
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form, role_id: form.role_id ? Number(form.role_id) : null }
    if (isEdit) {
      delete payload.password
      if (!payload.name) delete payload.name
      if (!payload.email) delete payload.email
    }
    onSubmit(payload)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-serif text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl font-sans text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required={!isEdit}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-sans text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required={!isEdit}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-sans text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
              />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-600 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl font-sans text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-600 mb-1">Role</label>
              <div className="relative">
                <select
                  value={form.role_id}
                  onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                  className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-xl font-sans text-sm bg-white focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
                >
                  <option value="">Select role…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="font-sans text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl font-sans text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-xl font-sans text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 shadow-md"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={15} />
              )}
              {isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
