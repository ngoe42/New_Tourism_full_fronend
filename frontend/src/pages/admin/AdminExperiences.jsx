import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Upload, X, Save, Loader2,
  Image as ImageIcon, Eye, EyeOff, Sparkles,
} from 'lucide-react'
import { experiencesApi } from '../../api/experiences'
import apiClient from '../../api/client'
import { resolveImageUrl } from '../../utils/imageUrl'

const EMPTY_FORM = { title: '', subtitle: '', description: '', image_url: '', order: 0, is_active: true }

/* ── Shared helpers (mirrors AdminRoutes) ──────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div>
      <label className="block font-sans text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}
function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition ${className}`}
      {...props}
    />
  )
}
function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition resize-none ${className}`}
      {...props}
    />
  )
}

/* ── Image upload panel ────────────────────────────────────────────────────── */
function ImageUploader({ imageUrl, onUploaded }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await apiClient.post('/media/upload', fd)
      onUploaded(res.data.url)
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => fileRef.current?.click()}
        className={`relative w-full h-56 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors
          ${imageUrl ? 'border-transparent' : 'border-gray-200 hover:border-green-600 hover:bg-green-50/20'}`}
      >
        {imageUrl ? (
          <>
            <img src={resolveImageUrl(imageUrl)} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="font-sans text-sm text-white font-semibold bg-black/50 px-4 py-2 rounded-lg">Change photo</span>
            </div>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <Loader2 size={28} className="animate-spin" />
            <span className="font-sans text-sm">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Upload size={28} />
            <span className="font-sans text-sm font-medium">Click to upload image</span>
            <span className="font-sans text-xs">JPG, PNG, WEBP · max 10 MB</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
      {error && <p className="font-sans text-xs text-red-500">{error}</p>}
      {imageUrl && (
        <div className="flex gap-2">
          <Input value={imageUrl} readOnly className="flex-1 text-gray-400 text-xs bg-gray-50 cursor-default" />
          <button type="button" onClick={() => onUploaded('')}
            className="p-2 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg hover:border-red-300 transition flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Experience modal (tabbed — mirrors RouteModal) ────────────────────────── */
function ExperienceModal({ experience, onClose, onSaved }) {
  const isEdit = !!experience
  const [form, setForm] = useState(experience ? { ...experience } : { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState('details')
  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await experiencesApi.update(experience.id, form)
      } else {
        await experiencesApi.create(form)
      }
      onSaved()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail ?? err.message))
    } finally {
      setSaving(false)
    }
  }

  const SECTIONS = [
    { id: 'details', label: 'Details' },
    { id: 'image',   label: 'Image'   },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900">
            {isEdit ? `Edit: ${experience.title}` : 'New Experience'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 px-7 pt-4">
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" onClick={() => setSection(s.id)}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium whitespace-nowrap transition ${
                section === s.id ? 'bg-green-950 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-7 py-6 space-y-5">

            {/* ── DETAILS ──────────────────────────────────────────── */}
            {section === 'details' && (
              <>
                <Field label="Title *">
                  <Input required value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. Kilimanjaro Summit Trek" />
                </Field>
                <Field label="Subtitle">
                  <Input value={form.subtitle ?? ''}
                    onChange={(e) => set('subtitle', e.target.value)}
                    placeholder="e.g. Stand on the Roof of Africa at 5,895 m" />
                </Field>
                <Field label="Description">
                  <Textarea rows={4} value={form.description ?? ''}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Short description shown on the experience slide…" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Display Order">
                    <Input type="number" min={0} value={form.order}
                      onChange={(e) => set('order', parseInt(e.target.value) || 0)} />
                  </Field>
                  <div>
                    <label className="block font-sans text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Visibility</label>
                    <button type="button" onClick={() => set('is_active', !form.is_active)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm font-medium transition border ${
                        form.is_active
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}>
                      {form.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                      {form.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── IMAGE ────────────────────────────────────────────── */}
            {section === 'image' && (
              <ImageUploader
                imageUrl={form.image_url}
                onUploaded={(url) => set('image_url', url)}
              />
            )}

          </div>

          {/* Footer */}
          <div className="px-7 py-5 border-t border-gray-100 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-xl font-sans text-sm text-gray-600 hover:bg-gray-100 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.title}
              className="flex items-center gap-2 px-6 py-2 bg-green-950 text-white rounded-xl font-sans text-sm font-medium hover:bg-green-800 transition disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {isEdit ? 'Save Changes' : 'Create Experience'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/* ── Main AdminExperiences page ────────────────────────────────────────────── */
export default function AdminExperiences() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | 'new' | experience object

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['admin-experiences'],
    queryFn: experiencesApi.listAll,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-experiences'] })
    qc.invalidateQueries({ queryKey: ['experiences'] })
  }

  const onSaved = () => { invalidate(); setModal(null) }

  const deleteExperience = async (exp) => {
    if (!confirm(`Delete "${exp.title}"? This cannot be undone.`)) return
    try {
      await experiencesApi.remove(exp.id)
      invalidate()
    } catch (e) {
      alert('Delete failed: ' + (e.response?.data?.detail ?? e.message))
    }
  }

  const toggleActive = async (exp) => {
    try {
      await experiencesApi.update(exp.id, { ...exp, is_active: !exp.is_active })
      invalidate()
    } catch {
      alert('Update failed')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Experiences</h1>
          <p className="font-sans text-sm text-gray-400 mt-0.5">
            {experiences.length} experience{experiences.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-950 text-white rounded-xl font-sans text-sm font-medium hover:bg-green-800 transition shadow-sm">
          <Plus size={16} /> New Experience
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-green-600" />
        </div>
      ) : experiences.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Sparkles size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="font-serif text-lg text-gray-500 mb-2">No experiences yet</p>
          <p className="font-sans text-sm text-gray-400 mb-6">Add the first experience slide for the homepage.</p>
          <button onClick={() => setModal('new')}
            className="px-5 py-2.5 bg-green-950 text-white rounded-xl font-sans text-sm font-medium hover:bg-green-800 transition">
            Create First Experience
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider">Experience</th>
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Subtitle</th>
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Order</th>
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {experiences.map((exp) => (
                <tr key={exp.id} className={`hover:bg-gray-50/50 transition-colors ${!exp.is_active ? 'opacity-55' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0">
                        {exp.image_url ? (
                          <img src={resolveImageUrl(exp.image_url)} alt={exp.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={16} className="text-amber-300" />
                          </div>
                        )}
                      </div>
                      <p className="font-sans text-sm font-semibold text-gray-900">{exp.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="font-sans text-sm text-gray-500 line-clamp-1">{exp.subtitle ?? '—'}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="font-sans text-sm text-gray-500">#{exp.order}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-sans text-xs font-semibold ${
                      exp.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {exp.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                      {exp.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActive(exp)}
                        title={exp.is_active ? 'Hide' : 'Show'}
                        className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition">
                        {exp.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => setModal(exp)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteExperience(exp)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal !== null && (
          <ExperienceModal
            key={modal === 'new' ? 'new' : modal.id}
            experience={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={onSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
