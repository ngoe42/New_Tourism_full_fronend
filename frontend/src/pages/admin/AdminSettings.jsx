import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DollarSign, Eye, EyeOff, Settings, Video, Upload, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { settingsApi } from '../../api/settings'

export default function AdminSettings() {
  const qc = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: settingsApi.get,
  })

  const toggleMutation = useMutation({
    mutationFn: (show_prices) => settingsApi.update({ show_prices }),
    onSuccess: () => qc.invalidateQueries(['site-settings']),
  })

  const fileRef = useRef(null)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const videoMutation = useMutation({
    mutationFn: (file) => settingsApi.uploadHeroVideo(file),
    onSuccess: () => { qc.invalidateQueries(['site-settings']); setUploadProgress(null) },
    onError: () => setUploadProgress(null),
  })

  const deleteMutation = useMutation({
    mutationFn: () => settingsApi.deleteHeroVideo(),
    onSuccess: () => { qc.invalidateQueries(['site-settings']); setConfirmDelete(false) },
  })

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadProgress('uploading')
    videoMutation.mutate(file)
    e.target.value = ''
  }

  const showPrices = settings?.show_prices ?? false
  const currentVideo = settings?.hero_video_url

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-sans text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="font-sans text-sm text-gray-400 mt-1">Global configuration for the public website</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm">

        {/* Price Visibility */}
        <div className="flex items-start justify-between gap-6 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <DollarSign size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-semibold text-gray-900">Show Prices Publicly</h3>
              <p className="font-sans text-xs text-gray-400 mt-0.5 leading-relaxed">
                When enabled, prices are displayed on tour cards, tour detail pages, route pages, and booking forms.
                When disabled, visitors see <span className="font-medium text-gray-600">"Request a Quote"</span> instead.
              </p>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full font-sans text-[11px] font-semibold ${
                showPrices ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {showPrices ? <Eye size={11} /> : <EyeOff size={11} />}
                {showPrices ? 'Prices visible to public' : 'Prices hidden from public'}
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleMutation.mutate(!showPrices)}
            disabled={isLoading || toggleMutation.isPending}
            className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
              showPrices ? 'bg-green-600' : 'bg-gray-300'
            }`}
            title={showPrices ? 'Click to hide prices' : 'Click to show prices'}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                showPrices ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Hero Video */}
        <div className="flex items-start justify-between gap-6 p-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Video size={18} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-sans text-sm font-semibold text-gray-900">Hero Video</h3>
              <p className="font-sans text-xs text-gray-400 mt-0.5 leading-relaxed">
                Fullscreen background video on the home page hero. MP4 or WebM, max 150 MB.
              </p>

              {currentVideo && (
                <div className="mt-2 flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                  <span className="font-sans text-[11px] text-gray-500 truncate max-w-xs">{currentVideo.split('/').pop()}</span>
                </div>
              )}

              {videoMutation.isError && (
                <div className="mt-2 flex items-center gap-1.5">
                  <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                  <span className="font-sans text-[11px] text-red-500">
                    {videoMutation.error?.response?.data?.detail || 'Upload failed'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-2 items-end">
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleVideoChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={videoMutation.isPending || deleteMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-sans text-xs font-semibold rounded-lg transition-colors"
            >
              <Upload size={13} />
              {videoMutation.isPending ? 'Uploading…' : currentVideo ? 'Replace Video' : 'Upload Video'}
            </button>

            {currentVideo && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:text-red-700 font-sans text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={12} /> Remove Video
              </button>
            )}

            {currentVideo && confirmDelete && (
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs text-gray-500">Sure?</span>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-sans text-xs font-semibold rounded-lg transition-colors"
                >
                  {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 font-sans text-xs rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {toggleMutation.isSuccess && (
        <p className="font-sans text-xs text-green-600 flex items-center gap-1.5">
          <Settings size={12} /> Settings saved successfully
        </p>
      )}
    </div>
  )
}
