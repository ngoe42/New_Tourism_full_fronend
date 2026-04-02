import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, ImageIcon, X } from 'lucide-react'
import { toursApi } from '../../api/tours'

const EMPTY_FORM = {
  title: '', slug: '', subtitle: '', description: '', category: 'Safari',
  location: '', duration: '', group_size: '', price: '',
  is_featured: false, is_published: true,
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function TourForm({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM)
  const [imageFiles, setImageFiles] = useState([])
  const fileRef = useRef(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = { ...form, price: parseFloat(form.price) || 0 }
    delete formData.rating
    delete formData.review_count
    delete formData.images
    delete formData.created_at
    delete formData.updated_at
    delete formData.id
    if (!formData.slug) formData.slug = slugify(formData.title)
    onSave({ formData, imageFiles })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="font-sans text-base font-bold text-gray-800">
          {initial ? 'Edit Tour' : 'Add Tour'}
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
              if (!initial || form.slug === slugify(form.title)) set('slug', slugify(title))
            }} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          {/* Title → auto slug */}
          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Slug (URL)</label>
            <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)}
              placeholder="Auto-generated from title"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>

          {/* Category */}
          <div>
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Category</label>
            <input type="text" value={form.category} onChange={(e) => set('category', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
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

          {/* Image Browse */}
          <div className="sm:col-span-2">
            <label className="block font-sans text-xs font-semibold text-gray-600 mb-1.5">Browse Images</label>
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
                    className="w-20 h-16 object-cover rounded-lg border border-gray-200" />
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

export default function AdminTours() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeForm, setActiveForm] = useState(null) // null | 'create' | tour object

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tours', search],
    queryFn: () => toursApi.list({ q: search, per_page: 50, admin: true }),
  })

  const tours = data?.items ?? []

  const createMutation = useMutation({
    mutationFn: async ({ formData, imageFiles }) => {
      const tour = await toursApi.create(formData)
      if (imageFiles?.length) {
        await Promise.all(imageFiles.map((file) => toursApi.uploadImage(tour.id, file)))
      }
      return tour
    },
    onSuccess: () => { qc.invalidateQueries(['admin-tours']); setActiveForm(null) },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData, imageFiles }) => {
      const tour = await toursApi.update(id, formData)
      if (imageFiles?.length) {
        await Promise.all(imageFiles.map((file) => toursApi.uploadImage(id, file)))
      }
      return tour
    },
    onSuccess: () => { qc.invalidateQueries(['admin-tours']); setActiveForm(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: toursApi.delete,
    onSuccess: () => qc.invalidateQueries(['admin-tours']),
  })

  const handleSave = ({ formData, imageFiles }) => {
    if (activeForm && activeForm !== 'create') {
      updateMutation.mutate({ id: activeForm.id, formData, imageFiles })
    } else {
      createMutation.mutate({ formData, imageFiles })
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="font-sans text-sm text-gray-400">{data?.total ?? 0} tours total</p>
        {!activeForm && (
          <button onClick={() => setActiveForm('create')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-sans text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            <Plus size={15} /> Add Tour
          </button>
        )}
      </div>

      {/* Inline form — shown instead of modal */}
      {activeForm && (
        <TourForm
          initial={activeForm !== 'create' ? activeForm : null}
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
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                {['Tour', 'Category', 'Location', 'Price', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tours.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 font-sans text-sm text-gray-400">No tours found</td></tr>
              ) : tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-sans text-sm font-semibold text-gray-900">{tour.title}</div>
                    <div className="font-sans text-xs text-gray-400">{tour.duration}</div>
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
                      <button onClick={() => setActiveForm(tour)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors">
                        <Pencil size={14} />
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
        )}
      </div>
    </div>
  )
}
