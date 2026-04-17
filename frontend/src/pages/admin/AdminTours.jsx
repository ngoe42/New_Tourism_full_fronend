import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, ImageIcon, X, CheckCircle, AlertCircle, Star, CheckSquare, XSquare, Sparkles } from 'lucide-react'
import { toursApi } from '../../api/tours'
import { categories } from '../../data/tours'
import { resolveImageUrl } from '../../utils/imageUrl'

const TOUR_CATEGORIES = categories.filter((c) => c !== 'All')

const EMPTY_FORM = {
  title: '', slug: '', subtitle: '', description: '', category: 'Luxury Safaris',
  location: '', duration: '', group_size: '', price: '',
  highlights: [], included: [], excluded: [],
  is_featured: false, is_published: true,
}

function ListEditor({ label, value = [], onChange, addPlaceholder, icon: Icon, iconColor }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    if (!draft.trim()) return
    onChange([...value, draft.trim()])
    setDraft('')
  }
  return (
    <div>
      <label className="flex items-center gap-1.5 font-sans text-xs font-semibold text-gray-600 mb-2">
        {Icon && <Icon size={13} className={iconColor} />}
        {label}
      </label>
      {value.length > 0 && (
        <ul className="space-y-1.5 mb-2">
          {value.map((item, i) => (
            <li key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
              <span className="flex-1 font-sans text-sm text-gray-700">{item}</span>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500 transition">
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={addPlaceholder ?? 'Add item…'}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <button type="button" onClick={add}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-sans text-xs font-semibold transition">
          Add
        </button>
      </div>
    </div>
  )
}

function extractError(err, fallback = 'Something went wrong') {
  const detail = err?.response?.data?.detail
  if (!detail) return err?.message || fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => {
      const field = d.loc?.slice(-1)[0]
      return field ? `${field}: ${d.msg}` : d.msg
    }).join('; ')
  }
  return fallback
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function TourForm({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    initial?.id ? initial : { ...EMPTY_FORM, category: initial?.category ?? EMPTY_FORM.category }
  )
  const [imageFiles, setImageFiles] = useState([])
  const [existingImages, setExistingImages] = useState(initial?.images ?? [])
  const [deletingImageId, setDeletingImageId] = useState(null)
  const fileRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleDeleteImage = async (imageId) => {
    if (!initial?.id) return
    setDeletingImageId(imageId)
    try {
      await toursApi.deleteImage(initial.id, imageId)
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (e) {
      alert(extractError(e, 'Failed to delete image'))
    } finally {
      setDeletingImageId(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = { ...form, price: parseFloat(form.price) || 0 }
    delete formData.rating
    delete formData.review_count
    delete formData.images
    delete formData.created_at
    delete formData.updated_at
    delete formData.id
    delete formData._isNew
    if (!formData.slug) formData.slug = slugify(formData.title)
    onSave({ formData, imageFiles })
  }

  return (
    <div ref={wrapperRef} className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="font-sans text-base font-bold text-gray-800">
          {initial?.id ? 'Edit Tour' : `Add ${form.category || 'Tour'}`}
        </h2>
        <button onClick={onClose} className="font-sans text-sm text-gray-500 hover:text-gray-800 transition-colors">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Title */}
          <div className="sm:col-span-2">
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={(e) => {
              const title = e.target.value
              set('title', title)
              set('slug', slugify(title))
            }} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            {form.slug && (
              <p className="mt-1.5 font-sans text-xs text-gray-400">
                URL: <span className="font-mono text-gray-500">/tours/<strong>{form.slug}</strong></span>
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
              {TOUR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Subtitle</label>
            <input type="text" value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          {/* Duration */}
          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Duration (e.g. 7 Days)</label>
            <input type="text" value={form.duration} onChange={(e) => set('duration', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          {/* Group Size */}
          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Group Size</label>
            <input type="text" value={form.group_size} onChange={(e) => set('group_size', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          {/* Price */}
          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Price (USD)</label>
            <input type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          {/* Location */}
          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Location *</label>
            <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>

          {/* Highlights */}
          <div className="sm:col-span-2">
            <ListEditor
              label="Highlights"
              icon={Sparkles}
              iconColor="text-amber-500"
              value={form.highlights ?? []}
              onChange={(v) => set('highlights', v)}
              addPlaceholder="e.g. Big 5 sightings, Sunset bush walks…"
            />
          </div>

          {/* Included */}
          <div className="sm:col-span-2">
            <ListEditor
              label="What's Included"
              icon={CheckSquare}
              iconColor="text-green-600"
              value={form.included ?? []}
              onChange={(v) => set('included', v)}
              addPlaceholder="e.g. All meals, Park fees, Airport transfers…"
            />
          </div>

          {/* Not Included */}
          <div className="sm:col-span-2">
            <ListEditor
              label="Not Included"
              icon={XSquare}
              iconColor="text-red-400"
              value={form.excluded ?? []}
              onChange={(v) => set('excluded', v)}
              addPlaceholder="e.g. International flights, Travel insurance…"
            />
          </div>

          {/* Flags */}
          <div className="sm:col-span-2 flex flex-wrap gap-6">
            {[['is_featured', 'Featured'], ['is_published', 'Published']].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked)}
                  className="w-4 h-4 accent-green-600" />
                <span className="font-sans text-sm text-gray-700">{l}</span>
              </label>
            ))}
          </div>

          {/* Existing Images (edit mode) */}
          {initial?.id && existingImages.length > 0 && (
            <div className="sm:col-span-2">
              <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">
                Current Images ({existingImages.length})
              </label>
              <div className="flex gap-2 flex-wrap">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={resolveImageUrl(img.url)}
                      alt=""
                      className="w-24 h-18 object-cover rounded-lg border border-gray-200"
                      style={{ height: '72px', width: '96px' }}
                    />
                    {img.is_cover && (
                      <span className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-amber-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                        <Star size={8} fill="currentColor" /> Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      disabled={deletingImageId === img.id}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow disabled:opacity-60"
                    >
                      {deletingImageId === img.id
                        ? <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                        : <X size={10} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Images */}
          <div className="sm:col-span-2">
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Add Images</label>
            <div className="flex items-center gap-3 flex-wrap">
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => setImageFiles(Array.from(e.target.files))} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <ImageIcon size={15} />
                Choose Files
              </button>
              <span className="font-sans text-sm text-gray-400 flex-1 truncate">
                {imageFiles.length > 0 ? imageFiles.map((f) => f.name).join(', ') : 'No file chosen'}
              </span>
              {imageFiles.length > 0 && (
                <button type="button" onClick={() => setImageFiles([])} className="text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              )}
            </div>
            {imageFiles.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {imageFiles.map((f, i) => (
                  <img key={i} src={URL.createObjectURL(f)} alt={f.name}
                    className="w-24 object-cover rounded-lg border border-gray-200" style={{ height: '72px' }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-200 font-sans text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-sans text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {initial ? 'Save Changes' : 'Create Tour'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  const isSuccess = type === 'success'
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-sans font-medium text-white transition-all ${
      isSuccess ? 'bg-green-600' : 'bg-red-500'
    }`}>
      {isSuccess ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  )
}

export default function AdminTours() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeForm, setActiveForm] = useState(null)
  const [fetchingId, setFetchingId] = useState(null)
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => setToast({ message, type })

  const handleEditTour = async (tour) => {
    setFetchingId(tour.id)
    try {
      const full = await toursApi.getById(tour.id)
      setActiveForm(full)
    } catch {
      setActiveForm(tour)
    } finally {
      setFetchingId(null)
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tours', search],
    queryFn: () => toursApi.list({ q: search, per_page: 100, admin: true }),
  })

  const tours = data?.items ?? []
  const filtered = activeCategory === 'All' ? tours : tours.filter((t) => t.category === activeCategory)

  const createMutation = useMutation({
    mutationFn: async ({ formData, imageFiles }) => {
      const tour = await toursApi.create(formData)
      if (imageFiles?.length) {
        await Promise.all(imageFiles.map((file) => toursApi.uploadImage(tour.id, file)))
      }
      return tour
    },
    onSuccess: () => { qc.invalidateQueries(['admin-tours']); setActiveForm(null); showToast('Tour created successfully!') },
    onError: (e) => showToast(extractError(e, 'Failed to create tour'), 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData, imageFiles }) => {
      const tour = await toursApi.update(id, formData)
      if (imageFiles?.length) {
        await Promise.all(imageFiles.map((file) => toursApi.uploadImage(id, file)))
      }
      return tour
    },
    onSuccess: () => { qc.invalidateQueries(['admin-tours']); setActiveForm(null); showToast('Tour updated successfully!') },
    onError: (e) => showToast(extractError(e, 'Failed to update tour'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: toursApi.delete,
    onSuccess: () => { qc.invalidateQueries(['admin-tours']); showToast('Tour deleted') },
    onError: (e) => showToast(extractError(e, 'Failed to delete tour'), 'error'),
  })

  const handleAddTour = () => {
    setActiveForm({
      _isNew: true,
      category: activeCategory !== 'All' ? activeCategory : 'Luxury Safaris',
    })
  }

  const handleSave = ({ formData, imageFiles }) => {
    if (activeForm?.id) {
      updateMutation.mutate({ id: activeForm.id, formData, imageFiles })
    } else {
      createMutation.mutate({ formData, imageFiles })
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="font-sans text-sm text-gray-400">
          {filtered.length} {activeCategory !== 'All' ? activeCategory : 'total tours'}
        </p>
        {!activeForm && (
          <button onClick={handleAddTour}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-sans text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            <Plus size={15} />
            Add {activeCategory !== 'All' ? activeCategory.replace(' Safaris', '') + ' Safari' : 'Tour'}
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      {!activeForm && (
        <div className="flex gap-2 flex-wrap">
          {['All', ...TOUR_CATEGORIES].map((cat) => {
            const count = cat === 'All' ? tours.length : tours.filter((t) => t.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 flex-shrink-0 font-sans text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
                  activeCategory === cat
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
                }`}
              >
                {cat}
                <span className={`text-[10px] font-bold ${
                  activeCategory === cat ? 'text-white/70' : 'text-gray-400'
                }`}>{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Inline form — shown instead of modal */}
      {activeForm && (
        <TourForm
          key={activeForm?.id ?? 'new'}
          initial={activeForm}
          onClose={() => setActiveForm(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Search tours…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                {['Tour', 'Category', 'Location', 'Price', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 font-sans text-sm text-gray-400">No {activeCategory !== 'All' ? activeCategory : ''} tours found</td></tr>
              ) : filtered.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const cover = tour.images?.find((i) => i.is_cover) ?? tour.images?.[0]
                        return cover ? (
                          <img src={resolveImageUrl(cover.url)} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <ImageIcon size={14} className="text-gray-300" />
                          </div>
                        )
                      })()}
                      <div>
                        <div className="font-sans text-sm font-semibold text-gray-900">{tour.title}</div>
                        <div className="font-sans text-xs text-gray-400">{tour.duration} · {tour.images?.length ?? 0} img</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-gray-600">{tour.category}</td>
                  <td className="px-4 py-3 font-sans text-sm text-gray-600">{tour.location}</td>
                  <td className="px-4 py-3 font-sans text-sm font-semibold text-gray-900">${(tour.price ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans text-sm text-gray-600">{tour.rating ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {tour.is_published ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">Published</span> : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-semibold">Draft</span>}
                      {tour.is_featured && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold">Featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => handleEditTour(tour)}
                        disabled={fetchingId === tour.id}
                        className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors disabled:opacity-60">
                        {fetchingId === tour.id
                          ? <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          : <Pencil size={14} />}
                      </button>
                      <button onClick={() => { if (confirm(`Delete "${tour.title}"? This cannot be undone.`)) deleteMutation.mutate(tour.id) }}
                        className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}
