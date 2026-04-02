import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Trash2, Star } from 'lucide-react'
import { testimonialsApi } from '../../api/testimonials'

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )
}

export default function AdminTestimonials() {
  const qc = useQueryClient()

  const { data: allData, isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: () => testimonialsApi.listAll({ per_page: 100 }),
  })

  const allItems = allData?.items ?? []
  const pendingList = allItems.filter((t) => !t.is_approved)
  const approvedList = allItems.filter((t) => t.is_approved)

  const approveMutation = useMutation({
    mutationFn: testimonialsApi.approve,
    onSuccess: () => qc.invalidateQueries(['admin-testimonials']),
  })

  const deleteMutation = useMutation({
    mutationFn: testimonialsApi.delete,
    onSuccess: () => qc.invalidateQueries(['admin-testimonials']),
  })

  const TestimonialCard = ({ t, showApprove }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center font-sans text-sm font-bold text-green-700">
            {t.name?.[0]?.toUpperCase() ?? 'G'}
          </div>
          <div>
            <div className="font-sans text-sm font-semibold text-gray-900">{t.name}</div>
            <div className="font-sans text-xs text-gray-400">{t.location}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={t.rating} />
          <span className="font-sans text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <p className="font-sans text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">"{t.message}"</p>
      {t.tour_id && (
        <div className="font-sans text-xs text-gray-600 mb-3">Tour #{t.tour_id}</div>
      )}
      <div className="flex gap-2">
        {showApprove && (
          <button
            onClick={() => approveMutation.mutate(t.id)}
            disabled={approveMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg font-sans text-xs font-semibold transition-colors"
          >
            <CheckCircle size={13} /> Approve
          </button>
        )}
        <button
          onClick={() => deleteMutation.mutate(t.id)}
          disabled={deleteMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg font-sans text-xs font-semibold transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <p className="font-sans text-sm text-gray-400">Moderate guest reviews</p>

      {/* Pending */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-sans text-sm font-bold text-gray-700 uppercase tracking-wider">Pending Approval</h2>
          {pendingList.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-sans text-xs font-bold">{pendingList.length}</span>
          )}
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pendingList.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
            <p className="font-sans text-sm text-gray-400">No pending reviews — all caught up!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingList.map((t) => <TestimonialCard key={t.id} t={t} showApprove />)}
          </div>
        )}
      </div>

      {/* Approved */}
      <div>
        <h2 className="font-sans text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Approved ({approvedList.length})</h2>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {approvedList.map((t) => <TestimonialCard key={t.id} t={t} showApprove={false} />)}
          </div>
        )}
      </div>
    </div>
  )
}
