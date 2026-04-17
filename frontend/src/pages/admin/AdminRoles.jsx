import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Plus, Edit2, Trash2, X, Check, Users, Lock
} from 'lucide-react'
import { userManagementApi } from '../../api/userManagement'

const MODULE_COLORS = {
  dashboard: 'bg-blue-50 text-blue-700 border-blue-200',
  users: 'bg-red-50 text-red-700 border-red-200',
  tours: 'bg-green-50 text-green-700 border-green-200',
  bookings: 'bg-amber-50 text-amber-700 border-amber-200',
  inquiries: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  testimonials: 'bg-pink-50 text-pink-700 border-pink-200',
  experiences: 'bg-violet-50 text-violet-700 border-violet-200',
  routes: 'bg-teal-50 text-teal-700 border-teal-200',
  settings: 'bg-gray-100 text-gray-700 border-gray-200',
  blog: 'bg-orange-50 text-orange-700 border-orange-200',
  communications: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  general: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function AdminRoles() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editRole, setEditRole] = useState(null)

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['manage-roles'],
    queryFn: userManagementApi.listRoles,
  })

  const { data: permissions = [] } = useQuery({
    queryKey: ['manage-permissions'],
    queryFn: userManagementApi.listPermissions,
  })

  const createMut = useMutation({
    mutationFn: userManagementApi.createRole,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manage-roles'] }); setShowModal(false) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => userManagementApi.updateRole(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['manage-roles'] }); setEditRole(null) },
  })

  const deleteMut = useMutation({
    mutationFn: userManagementApi.deleteRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['manage-roles'] }),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={22} className="text-green-700" /> Roles & Permissions
          </h2>
          <p className="font-sans text-sm text-gray-500 mt-1">Define what each role can access</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-xl font-sans text-sm font-semibold hover:bg-green-800 transition-colors shadow-md"
        >
          <Plus size={16} /> New Role
        </button>
      </div>

      {/* Role Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    role.name === 'Admin' ? 'bg-red-100 text-red-600' :
                    role.name === 'Manager' ? 'bg-blue-100 text-blue-600' :
                    role.name === 'Editor' ? 'bg-purple-100 text-purple-600' :
                    role.name === 'Customer' ? 'bg-gray-100 text-gray-500' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      {role.name}
                      {role.is_system && <Lock size={11} className="text-gray-400" title="System role" />}
                    </h3>
                    <p className="font-sans text-xs text-gray-500">{role.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditRole(role)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-700 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  {!role.is_system && (
                    <button
                      onClick={() => { if (confirm(`Delete "${role.name}" role?`)) deleteMut.mutate(role.id) }}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Permissions</span>
                  <span className="font-sans text-[11px] font-semibold text-gray-500">
                    {role.permissions.length} of {permissions.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.length === 0 ? (
                    <span className="font-sans text-xs text-gray-400 italic">No permissions</span>
                  ) : (
                    role.permissions.map((p) => (
                      <span
                        key={p.id}
                        className={`px-2 py-0.5 rounded-md border font-sans text-[10px] font-semibold ${
                          MODULE_COLORS[p.module] || MODULE_COLORS.general
                        }`}
                      >
                        {p.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5">
                <Users size={12} className="text-gray-400" />
                <span className="font-sans text-xs text-gray-500">
                  {role.user_count} user{role.user_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <RoleFormModal
            title="Create New Role"
            permissions={permissions}
            error={createMut.error?.response?.data?.detail}
            isLoading={createMut.isPending}
            onClose={() => { setShowModal(false); createMut.reset() }}
            onSubmit={(data) => createMut.mutate(data)}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editRole && (
          <RoleFormModal
            title={`Edit ${editRole.name}`}
            permissions={permissions}
            initialData={editRole}
            error={updateMut.error?.response?.data?.detail}
            isLoading={updateMut.isPending}
            onClose={() => { setEditRole(null); updateMut.reset() }}
            onSubmit={(data) => updateMut.mutate({ id: editRole.id, data })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}


/* ── Role Form Modal ──────────────────────────────────────────────────── */
function RoleFormModal({ title, permissions, initialData, error, isLoading, onClose, onSubmit }) {
  const isEdit = !!initialData
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [selectedIds, setSelectedIds] = useState(
    () => new Set((initialData?.permissions || []).map((p) => p.id))
  )

  const togglePerm = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === permissions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(permissions.map((p) => p.id)))
    }
  }

  const grouped = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = []
    acc[p.module].push(p)
    return acc
  }, {})

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name, description, permission_ids: [...selectedIds] })
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-serif text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl font-sans text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-gray-600 mb-1">Role Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-sans text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-gray-600 mb-1">Description</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-sans text-sm focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-sans text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Permissions ({selectedIds.size}/{permissions.length})
                </label>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="font-sans text-xs font-semibold text-green-700 hover:text-green-800"
                >
                  {selectedIds.size === permissions.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(grouped).map(([module, perms]) => (
                  <div key={module}>
                    <p className="font-sans text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 capitalize">{module}</p>
                    <div className="space-y-1">
                      {perms.map((p) => (
                        <label
                          key={p.id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            selectedIds.has(p.id) ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => togglePerm(p.id)}
                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-sans text-sm font-medium text-gray-800">{p.name}</span>
                            {p.description && <p className="font-sans text-xs text-gray-500">{p.description}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl font-sans text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors">
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
              {isEdit ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
