import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DollarSign, Eye, EyeOff, Settings, Video, Upload,
  CheckCircle, AlertCircle, Trash2, Image as ImageIcon,
} from 'lucide-react'
import { settingsApi } from '../../api/settings'
import apiClient from '../../api/client'
import { resolveImageUrl } from '../../utils/imageUrl'

/* ── Reusable image-upload card ──────────────────────────────────────────── */
function ImageCard({ icon: Icon, iconBg, iconColor, title, description, field, currentUrl, onSaved }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [confirm, setConfirm] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await apiClient.post('/media/upload', fd)
      await settingsApi.setImage(field, res.data.url)
      onSaved()
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemove = async () => {
    try {
      await settingsApi.clearImage(field)
      onSaved()
      setConfirm(false)
    } catch {
      setError('Remove failed')
    }
  }

  return (
    <div className="flex items-start gap-4 p-6">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-sans text-sm font-semibold text-gray-900">{title}</h3>
        <p className="font-sans text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>

        {/* Preview */}
        {currentUrl && (
          <div className="mt-3 relative w-full max-w-xs h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={resolveImageUrl(currentUrl)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
          </div>
        )}

        {error && (
          <div className="mt-2 flex items-center gap-1.5">
            <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
            <span className="font-sans text-[11px] text-red-500">{error}</span>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex flex-col gap-2 items-end">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-950 hover:bg-green-800 disabled:opacity-60 text-white font-sans text-xs font-semibold rounded-lg transition-colors"
        >
          <Upload size={13} />
          {uploading ? 'Uploading…' : currentUrl ? 'Replace' : 'Upload'}
        </button>

        {currentUrl && !confirm && (
          <button
            onClick={() => setConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:text-red-700 font-sans text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} /> Remove
          </button>
        )}

        {currentUrl && confirm && (
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs text-gray-500">Sure?</span>
            <button
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-semibold rounded-lg transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="px-3 py-1.5 border border-gray-200 text-gray-600 font-sans text-xs rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function AdminSettings() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['site-settings'] })

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: settingsApi.get,
  })

  const toggleMutation = useMutation({
    mutationFn: (show_prices) => settingsApi.update({ show_prices }),
    onSuccess: invalidate,
  })

  const fileRef = useRef(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const videoMutation = useMutation({
    mutationFn: (file) => settingsApi.uploadHeroVideo(file),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: () => settingsApi.deleteHeroVideo(),
    onSuccess: () => { invalidate(); setConfirmDelete(false) },
  })

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    videoMutation.mutate(file)
    e.target.value = ''
  }

  const showPrices  = settings?.show_prices     ?? false
  const currentVideo = settings?.hero_video_url ?? null

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="font-sans text-sm text-gray-400 mt-1">Control every image and global setting on the public website</p>
      </div>

      {/* ── General ──────────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">General</h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm">

          {/* Price Toggle */}
          <div className="flex items-start justify-between gap-6 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <DollarSign size={18} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-semibold text-gray-900">Show Prices Publicly</h3>
                <p className="font-sans text-xs text-gray-400 mt-0.5 leading-relaxed">
                  When disabled, visitors see <span className="font-medium text-gray-600">"Request a Quote"</span> instead of prices.
                </p>
                <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full font-sans text-[11px] font-semibold ${
                  showPrices ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {showPrices ? <Eye size={11} /> : <EyeOff size={11} />}
                  {showPrices ? 'Visible to public' : 'Hidden from public'}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleMutation.mutate(!showPrices)}
              disabled={isLoading || toggleMutation.isPending}
              className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
                showPrices ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                showPrices ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

        </div>
      </section>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Hero Section</h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm">

          {/* Hero Video */}
          <div className="flex items-start justify-between gap-6 p-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Video size={18} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-sans text-sm font-semibold text-gray-900">Hero Video</h3>
                <p className="font-sans text-xs text-gray-400 mt-0.5 leading-relaxed">
                  Fullscreen background video. Overrides the image slideshow. MP4 / WebM, max 150 MB.
                </p>
                {currentVideo && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                    <span className="font-sans text-[11px] text-gray-500 truncate max-w-xs">{currentVideo.split('/').pop()}</span>
                  </div>
                )}
                {videoMutation.isError && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <AlertCircle size={12} className="text-red-500" />
                    <span className="font-sans text-[11px] text-red-500">{videoMutation.error?.response?.data?.detail || 'Upload failed'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col gap-2 items-end">
              <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoChange} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={videoMutation.isPending || deleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-950 hover:bg-green-800 disabled:opacity-60 text-white font-sans text-xs font-semibold rounded-lg transition-colors"
              >
                <Upload size={13} />
                {videoMutation.isPending ? 'Uploading…' : currentVideo ? 'Replace Video' : 'Upload Video'}
              </button>
              {currentVideo && !confirmDelete && (
                <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:text-red-700 font-sans text-xs font-medium rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={12} /> Remove
                </button>
              )}
              {currentVideo && confirmDelete && (
                <div className="flex items-center gap-2">
                  <span className="font-sans text-xs text-gray-500">Sure?</span>
                  <button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-sans text-xs font-semibold rounded-lg">
                    {deleteMutation.isPending ? 'Deleting…' : 'Yes'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 border border-gray-200 text-gray-600 font-sans text-xs rounded-lg hover:bg-gray-50">Cancel</button>
                </div>
              )}
            </div>
          </div>

          {/* Hero slideshow note */}
          <div className="px-6 py-4 bg-gray-50/50">
            <p className="font-sans text-xs text-gray-400">
              <span className="font-semibold text-gray-600">Hero slideshow images</span> are automatically collected from published tours, routes, and active experiences. Manage them in their respective sections.
            </p>
          </div>

        </div>
      </section>

      {/* ── Our Story Section ────────────────────────────────────────────── */}
      <section>
        <h2 className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Our Story Section</h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
          <ImageCard
            icon={ImageIcon}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            title="Story Image — Our Story"
            description='Left image in the "Born from a Deep Love of the African Wild" block. Recommended: 800×600 px.'
            field="story_image_1"
            currentUrl={settings?.story_image_1 ?? null}
            onSaved={invalidate}
          />
          <ImageCard
            icon={ImageIcon}
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
            title="Story Image — The Experience"
            description='Right image in the "Where Luxury Meets the Untamed Wild" block. Recommended: 800×600 px.'
            field="story_image_2"
            currentUrl={settings?.story_image_2 ?? null}
            onSaved={invalidate}
          />
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">CTA Section</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <ImageCard
            icon={ImageIcon}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            title="CTA Background Image"
            description='"Your Dream Safari Awaits" section at the bottom of the home page. Recommended: 1920×1080 px.'
            field="cta_bg_image"
            currentUrl={settings?.cta_bg_image ?? null}
            onSaved={invalidate}
          />
        </div>
      </section>

      {toggleMutation.isSuccess && (
        <p className="font-sans text-xs text-green-600 flex items-center gap-1.5">
          <Settings size={12} /> Settings saved
        </p>
      )}
    </div>
  )
}
