import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Upload, X, Save, Loader2, Image as ImageIcon,
  ChevronDown, ChevronUp, Mountain, Eye, EyeOff
} from 'lucide-react'
import { routesApi } from '../../api/routes'

const EMPTY_FORM = {
  name: '', slug: '', nickname: '', nickname_explanation: '',
  short_description: '', full_description: '',
  duration: '', difficulty: '', success_rate: '', max_altitude: '',
  distance: '', group_size: '', best_season: '', requirements: '',
  price: 0, package_details: '',
  highlights: [], itinerary: [], included: [], excluded: [], packing_list: [],
  is_published: true,
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/* ── small helpers ────────────────────────────────────────────────────────── */

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

/* ── JSON list editor (highlights, included, excluded, packing_list) ───────── */
function ListEditor({ label, value = [], onChange }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    if (!draft.trim()) return
    onChange([...value, draft.trim()])
    setDraft('')
  }
  return (
    <div>
      <label className="block font-sans text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Add item and press Enter"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition"
        />
        <button type="button" onClick={add}
          className="px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition">
          <Plus size={15} />
        </button>
      </div>
      {Array.isArray(value) && value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((item, i) => (
            <li key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
              <span className="flex-1 font-sans text-sm text-gray-700">{item}</span>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500 transition"><X size={13} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── Itinerary editor ──────────────────────────────────────────────────────── */
function ItineraryEditor({ value = [], onChange }) {
  const addDay = () => onChange([...value, { day: value.length + 1, title: '', description: '', distance: '' }])
  const updateDay = (i, field, v) => {
    const updated = [...value]
    updated[i] = { ...updated[i], [field]: v }
    onChange(updated)
  }
  const removeDay = (i) => onChange(value.filter((_, j) => j !== i))

  return (
    <div>
      <label className="block font-sans text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Itinerary</label>
      <div className="space-y-3">
        {Array.isArray(value) && value.map((day, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans text-xs font-bold text-green-800 uppercase tracking-wide">Day {day.day ?? i + 1}</span>
              <button type="button" onClick={() => removeDay(i)} className="text-gray-400 hover:text-red-500 transition"><X size={14} /></button>
            </div>
            <Input placeholder="Day title (e.g. Machame Gate to Machame Camp)"
              value={day.title} onChange={(e) => updateDay(i, 'title', e.target.value)} />
            <Textarea rows={2} placeholder="Description…"
              value={day.description} onChange={(e) => updateDay(i, 'description', e.target.value)} />
            <Input placeholder="Distance (e.g. 11 km)" value={day.distance}
              onChange={(e) => updateDay(i, 'distance', e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={addDay}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 font-sans text-sm text-gray-400 hover:border-green-600 hover:text-green-700 transition flex items-center justify-center gap-2">
          <Plus size={15} /> Add Day
        </button>
      </div>
    </div>
  )
}

/* ── Image gallery section ─────────────────────────────────────────────────── */
function RouteImages({ route, onRefresh }) {
  const qc = useQueryClient()
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')

  const upload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      await routesApi.uploadImage(route.id, file, caption, false)
      setCaption('')
      onRefresh()
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.detail ?? e.message))
    } finally {
      setUploading(false)
    }
  }

  const deleteImg = async (imageId) => {
    if (!confirm('Delete this image?')) return
    try {
      await routesApi.deleteImage(route.id, imageId)
      onRefresh()
    } catch (e) {
      alert('Delete failed')
    }
  }

  return (
    <div>
      <p className="font-sans text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Images ({route.images?.length ?? 0})</p>
      {/* Upload area */}
      <div className="flex gap-2 mb-4">
        <Input placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} className="flex-1" />
        <button type="button" onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-sans text-sm disabled:opacity-50">
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => upload(e.target.files?.[0])} />
      </div>
      {/* Thumbnails */}
      {route.images?.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {route.images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
              <img src={img.url} alt={img.caption || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button onClick={() => deleteImg(img.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 text-white rounded-lg transition hover:bg-red-600">
                  <Trash2 size={13} />
                </button>
              </div>
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="font-sans text-[10px] text-white truncate">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400">
          <ImageIcon size={24} />
          <p className="font-sans text-sm">No images yet. Upload the first one.</p>
        </div>
      )}
    </div>
  )
}

/* ── Route form modal ──────────────────────────────────────────────────────── */
function RouteModal({ route, onClose, onSaved }) {
  const [createdRoute, setCreatedRoute] = useState(null)
  const isEdit = !!(route || createdRoute)
  const editTarget = createdRoute ?? route
  const [form, setForm] = useState(route ? { ...route } : { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState('basic')

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await routesApi.update(editTarget.id, form)
        onSaved()
      } else {
        const created = await routesApi.create(form)
        setCreatedRoute(created)
        setForm({ ...created })
        setSection('images')
        onSaved(false)
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail ?? err.message))
    } finally {
      setSaving(false)
    }
  }

  const SECTIONS = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'stats', label: 'Stats & Meta' },
    { id: 'content', label: 'Content' },
    { id: 'json', label: 'Details & Lists' },
    { id: 'images', label: 'Images' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">
              {isEdit ? `Edit: ${editTarget?.name ?? route?.name ?? 'Route'}` : 'New Kilimanjaro Route'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 px-7 pt-4 overflow-x-auto">
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

            {/* ── BASIC ─────────────────────────────────────────────── */}
            {section === 'basic' && (
              <>
                <Field label="Route Name *">
                  <Input required value={form.name}
                    onChange={(e) => {
                      const name = e.target.value
                      set('name', name)
                      if (!isEdit || form.slug === slugify(form.name)) set('slug', slugify(name))
                    }} />
                  {form.slug && (
                    <p className="mt-1 font-sans text-xs text-gray-400">URL: <span className="text-gray-500">/routes/<strong>{form.slug}</strong></span></p>
                  )}
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nickname">
                    <Input value={form.nickname ?? ''} onChange={(e) => set('nickname', e.target.value)} placeholder='e.g. "Whiskey Route"' />
                  </Field>
                  <Field label="Price (USD)">
                    <Input type="number" min={0} step={1} value={form.price} onChange={(e) => set('price', parseFloat(e.target.value) || 0)} />
                  </Field>
                </div>
                <Field label="Short Description">
                  <Textarea rows={2} value={form.short_description ?? ''} onChange={(e) => set('short_description', e.target.value)} />
                </Field>
                <Field label="Nickname Explanation">
                  <Textarea rows={2} value={form.nickname_explanation ?? ''} onChange={(e) => set('nickname_explanation', e.target.value)} />
                </Field>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => set('is_published', !form.is_published)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm font-medium transition border ${
                      form.is_published ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}>
                    {form.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                    {form.is_published ? 'Published' : 'Draft'}
                  </button>
                  <span className="font-sans text-xs text-gray-400">Toggle route visibility on public site</span>
                </div>
              </>
            )}

            {/* ── STATS ─────────────────────────────────────────────── */}
            {section === 'stats' && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Duration *">
                  <Input required value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="e.g. 6-7 Days" />
                </Field>
                <Field label="Difficulty">
                  <select value={form.difficulty ?? ''} onChange={(e) => set('difficulty', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600">
                    <option value="">Select difficulty</option>
                    {['Easy', 'Moderate', 'Challenging', 'Very Challenging'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Success Rate">
                  <Input value={form.success_rate ?? ''} onChange={(e) => set('success_rate', e.target.value)} placeholder="e.g. 85%" />
                </Field>
                <Field label="Max Altitude">
                  <Input value={form.max_altitude ?? ''} onChange={(e) => set('max_altitude', e.target.value)} placeholder="e.g. 5,895m" />
                </Field>
                <Field label="Distance">
                  <Input value={form.distance ?? ''} onChange={(e) => set('distance', e.target.value)} placeholder="e.g. ~62 km" />
                </Field>
                <Field label="Group Size">
                  <Input value={form.group_size ?? ''} onChange={(e) => set('group_size', e.target.value)} placeholder="e.g. 2-12 people" />
                </Field>
                <Field label="Best Season" className="col-span-2">
                  <Input value={form.best_season ?? ''} onChange={(e) => set('best_season', e.target.value)} placeholder="e.g. Jan–Mar & Jun–Oct" className="col-span-2" />
                </Field>
              </div>
            )}

            {/* ── CONTENT ───────────────────────────────────────────── */}
            {section === 'content' && (
              <>
                <Field label="Full Description">
                  <Textarea rows={6} value={form.full_description ?? ''} onChange={(e) => set('full_description', e.target.value)}
                    placeholder="Detailed route description (use new lines for paragraphs)" />
                </Field>
                <Field label="Requirements">
                  <Textarea rows={3} value={form.requirements ?? ''} onChange={(e) => set('requirements', e.target.value)}
                    placeholder="Physical fitness requirements, experience needed, etc." />
                </Field>
                <Field label="Package Details / What's Included (text)">
                  <Textarea rows={3} value={form.package_details ?? ''} onChange={(e) => set('package_details', e.target.value)} />
                </Field>
              </>
            )}

            {/* ── DETAILS & LISTS ───────────────────────────────────── */}
            {section === 'json' && (
              <>
                <ListEditor label="Highlights" value={form.highlights ?? []}
                  onChange={(v) => set('highlights', v)} />
                <ListEditor label="Included" value={form.included ?? []}
                  onChange={(v) => set('included', v)} />
                <ListEditor label="Excluded (Not Included)" value={form.excluded ?? []}
                  onChange={(v) => set('excluded', v)} />
                <ListEditor label="Packing List" value={form.packing_list ?? []}
                  onChange={(v) => set('packing_list', v)} />
                <ItineraryEditor value={form.itinerary ?? []}
                  onChange={(v) => set('itinerary', v)} />
              </>
            )}

            {/* ── IMAGES ────────────────────────────────────────────── */}
            {section === 'images' && (
              editTarget ? (
                <RouteImages route={{ ...editTarget, images: form.images ?? [] }} onRefresh={async () => {
                  const updated = await routesApi.getById(editTarget.id)
                  setForm(updated)
                }} />
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                  <p className="font-sans text-sm text-amber-700 font-medium">Save the route details first, then you can upload images.</p>
                </div>
              )
            )}

          </div>

          {/* Footer */}
          {section !== 'images' && (
            <div className="px-7 py-5 border-t border-gray-100 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose}
                className="px-5 py-2 rounded-xl font-sans text-sm text-gray-600 hover:bg-gray-100 transition">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-950 text-white rounded-xl font-sans text-sm font-medium hover:bg-green-800 transition disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {isEdit ? 'Save Changes' : 'Create Route'}
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}

/* ── Main AdminRoutes page ─────────────────────────────────────────────────── */
export default function AdminRoutes() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)  // null | 'new' | route-object

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['admin-routes'],
    queryFn: () => routesApi.listAll(),
  })

  const deleteRoute = async (route) => {
    if (!confirm(`Delete "${route.name}"? This cannot be undone.`)) return
    try {
      await routesApi.delete(route.id)
      qc.invalidateQueries({ queryKey: ['admin-routes'] })
      qc.invalidateQueries({ queryKey: ['nav-routes'] })
    } catch (e) {
      alert('Delete failed: ' + (e.response?.data?.detail ?? e.message))
    }
  }

  const onSaved = (closeModal = true) => {
    qc.invalidateQueries({ queryKey: ['admin-routes'] })
    qc.invalidateQueries({ queryKey: ['nav-routes'] })
    if (closeModal) setModal(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">Kilimanjaro Routes</h1>
          <p className="font-sans text-sm text-gray-400 mt-0.5">{routes.length} route{routes.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-950 text-white rounded-xl font-sans text-sm font-medium hover:bg-green-800 transition shadow-sm">
          <Plus size={16} /> New Route
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-green-600" />
        </div>
      ) : routes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Mountain size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="font-serif text-lg text-gray-500 mb-2">No routes yet</p>
          <p className="font-sans text-sm text-gray-400 mb-6">Create the first Kilimanjaro route for the website.</p>
          <button onClick={() => setModal('new')}
            className="px-5 py-2.5 bg-green-950 text-white rounded-xl font-sans text-sm font-medium hover:bg-green-800 transition">
            Create First Route
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider">Route</th>
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Duration</th>
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Difficulty</th>
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Images</th>
                <th className="text-left px-5 py-3 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-green-50 flex-shrink-0">
                        {route.images?.[0] ? (
                          <img src={route.images[0].url} alt={route.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Mountain size={16} className="text-green-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-sans text-sm font-semibold text-gray-900">{route.name}</p>
                        {route.nickname && (
                          <p className="font-sans text-xs text-gray-400 italic">"{route.nickname}"</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="font-sans text-sm text-gray-600">{route.duration}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-sans text-xs font-medium ${
                      route.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      route.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                      route.difficulty === 'Challenging' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {route.difficulty ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="font-sans text-sm text-gray-500">{route.images?.length ?? 0} photo{(route.images?.length ?? 0) !== 1 ? 's' : ''}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-sans text-xs font-semibold ${
                      route.is_published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {route.is_published ? <Eye size={11} /> : <EyeOff size={11} />}
                      {route.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setModal(route)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteRoute(route)}
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
          <RouteModal
            route={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={onSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
