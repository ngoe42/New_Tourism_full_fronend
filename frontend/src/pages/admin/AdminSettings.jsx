import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DollarSign, Eye, EyeOff, Settings } from 'lucide-react'
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

  const showPrices = settings?.show_prices ?? false

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

      </div>

      {toggleMutation.isSuccess && (
        <p className="font-sans text-xs text-green-600 flex items-center gap-1.5">
          <Settings size={12} /> Settings saved successfully
        </p>
      )}
    </div>
  )
}
