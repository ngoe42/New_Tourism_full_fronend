import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, ChevronDown, Mail } from 'lucide-react'
import { bookingsApi } from '../../api/bookings'
import EmailReplyModal from '../../components/EmailReplyModal'

const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-500',
  completed: 'bg-blue-100 text-blue-700',
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed']

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full font-sans text-[11px] font-semibold capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

function StatusDropdown({ bookingId, current }) {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ id, status }) => bookingsApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(['admin-bookings']); setOpen(false) },
  })

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-gray-500 hover:text-green-950 transition-colors"
      >
        <StatusBadge status={current} />
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 left-0 bg-white border border-gray-100 rounded-xl shadow-xl py-1 w-36">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => mutation.mutate({ id: bookingId, status: s })}
              className="w-full text-left px-4 py-2 font-sans text-xs hover:bg-gray-50 flex items-center gap-2 capitalize"
            >
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminBookings() {
  const [page, setPage] = useState(1)
  const [replyTarget, setReplyTarget] = useState(null)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page],
    queryFn: () => bookingsApi.all({ page, per_page: 20 }),
  })

  const bookings = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.pages ?? 1

  return (
    <div className="space-y-4">
      <p className="font-sans text-sm text-gray-400">{total} total bookings</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    {['#', 'Guest', 'Tour', 'Date', 'Guests', 'Total', 'Status', 'Booked', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 font-sans text-sm text-gray-400">No bookings yet</td></tr>
                  ) : bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-sans text-xs text-gray-400">#{b.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-sans text-sm font-semibold text-gray-900">{b.contact_name}</div>
                        <div className="font-sans text-xs text-gray-400">{b.contact_email}</div>
                      </td>
                      <td className="px-4 py-3 font-sans text-sm text-gray-700 max-w-[160px] truncate">{b.tour?.title ?? `Tour #${b.tour_id}`}</td>
                      <td className="px-4 py-3 font-sans text-sm text-gray-600 whitespace-nowrap">{b.travel_date}</td>
                      <td className="px-4 py-3 font-sans text-sm text-gray-600">{b.guests}</td>
                      <td className="px-4 py-3 font-sans text-sm font-semibold text-gray-900">${(b.total_price ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <StatusDropdown bookingId={b.id} current={b.status} />
                      </td>
                      <td className="px-4 py-3 font-sans text-xs text-gray-400 whitespace-nowrap">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setReplyTarget(b)}
                          title="Reply via email"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-sans text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Mail size={12} /> Reply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <span className="font-sans text-xs text-gray-400">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 font-sans text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    Prev
                  </button>
                  <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 font-sans text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {replyTarget && (
        <EmailReplyModal
          recipient={{ name: replyTarget.contact_name, email: replyTarget.contact_email }}
          subject={`Re: Your Nelson Tours & Safari Booking${replyTarget.tour?.title ? ` — ${replyTarget.tour.title}` : ''}`}
          bookingId={replyTarget.id}
          itemName={replyTarget.tour?.title ?? undefined}
          price={replyTarget.total_price ?? undefined}
          invalidateKey="admin-bookings"
          onClose={() => setReplyTarget(null)}
        />
      )}
    </div>
  )
}
