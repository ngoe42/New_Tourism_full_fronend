import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, X, Save, Loader2, ImageOff } from 'lucide-react'
import { experiencesApi } from '../../api/experiences'

const EMPTY_FORM = { title: '', subtitle: '', description: '', image_url: '', order: 0, is_active: true }

function ExperienceModal({ initial, onClose, onSave, loading }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const isEdit = !!initial?.id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Experience' : 'Add Experience'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Image preview */}
          <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center relative">
            {form.image_url ? (
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-300">
                <ImageOff size={32} />
                <span className="font-sans text-xs">Paste an image URL below</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Image URL *</label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Kilimanjaro Summit Trek"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Subtitle</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => set('subtitle', e.target.value)}
              placeholder="e.g. Stand on the Roof of Africa"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Short description shown on the slide..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-sans text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Order</label>
              <input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => set('order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => set('is_active', !form.is_active)}
                  className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="font-sans text-sm text-gray-600">Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl font-sans text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !form.title || !form.image_url}
            className="flex-1 py-2.5 bg-green-950 text-white rounded-xl font-sans text-sm font-medium hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEdit ? 'Save Changes' : 'Add Experience'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminExperiences() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | 'add' | experience object
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['admin-experiences'],
    queryFn: experiencesApi.listAll,
  })

  const createMutation = useMutation({
    mutationFn: experiencesApi.create,
    onSuccess: () => { qc.invalidateQueries(['admin-experiences']); qc.invalidateQueries(['experiences']); setModal(null) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => experiencesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-experiences']); qc.invalidateQueries(['experiences']); setModal(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: experiencesApi.remove,
    onSuccess: () => { qc.invalidateQueries(['admin-experiences']); qc.invalidateQueries(['experiences']); setDeleteTarget(null) },
  })

  const toggleActive = (exp) => {
    updateMutation.mutate({ id: exp.id, is_active: !exp.is_active })
  }

  const handleSave = (form) => {
    if (modal?.id) {
      updateMutation.mutate({ id: modal.id, ...form })
    } else {
      createMutation.mutate(form)
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Experiences</h1>
          <p className="font-sans text-sm text-gray-500 mt-0.5">Manage the homepage experience slider</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-green-950 text-white font-sans text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-amber-500 transition-colors"
        >
          <Plus size={15} /> Add Experience
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="font-sans text-sm">No experiences yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border ${exp.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}
            >
              <GripVertical size={16} className="text-gray-300 flex-shrink-0 cursor-grab" />

              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {exp.image_url ? (
                  <img src={exp.image_url} alt={exp.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff size={16} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-wider">#{exp.order}</span>
                  {!exp.is_active && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded font-sans text-[10px] font-semibold">Hidden</span>
                  )}
                </div>
                <p className="font-sans text-sm font-semibold text-gray-900 truncate">{exp.title}</p>
                {exp.subtitle && <p className="font-sans text-xs text-gray-500 truncate">{exp.subtitle}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(exp)}
                  title={exp.is_active ? 'Hide' : 'Show'}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {exp.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => setModal(exp)}
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(exp)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <ExperienceModal
            initial={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
            loading={saving}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            >
              <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">Delete Experience</h3>
              <p className="font-sans text-sm text-gray-500 mb-5">
                Remove <span className="font-semibold text-gray-700">"{deleteTarget.title}"</span> from the slider? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-sans text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-sans text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
