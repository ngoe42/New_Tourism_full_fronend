import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Mail, Pencil, Trash2, X, Save, Loader2 } from 'lucide-react'
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
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-gray-500 hover:text-green-950 transition-colors">
        <StatusBadge status={current} /><ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 left-0 bg-white border border-gray-100 rounded-xl shadow-xl py-1 w-36">
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => mutation.mutate({ id: bookingId, status: s })}
              className="w-full text-left px-4 py-2 font-sans text-xs hover:bg-gray-50 flex items-center gap-2 capitalize">
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function EditBookingModal({ booking, onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    travel_date: booking.travel_date ?? '',
    guests: booking.guests ?? 1,
    total_price: booking.total_price ?? 0,
    notes: booking.notes ?? '',
    special_requests: booking.special_requests ?? '',
  })

  const mutation = useMutation({
    mutationFn: (data) => bookingsApi.update(booking.id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-bookings']); onClose() },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      travel_date: form.travel_date || undefined,
      guests: parseInt(form.guests),
      total_price: parseFloat(form.total_price),
      notes: form.notes || undefined,
      special_requests: form.special_requests || undefined,
    }
    mutation.mutate(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-lg font-semibold text-green-950">Edit Booking #{booking.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="font-sans text-xs text-gray-400 mb-4">{booking.contact_name} · {booking.tour?.title ?? `Tour #${booking.tour_id}`}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-sans text-xs font-medium text-gray-600 block mb-1">Travel Date</label>
              <input type="date" value={form.travel_date} onChange={(e) => setForm(f => ({ ...f, travel_date: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30" />
            </div>
            <div>
              <label className="font-sans text-xs font-medium text-gray-600 block mb-1">Guests</label>
              <input type="number" min="1" max="50" value={form.guests} onChange={(e) => setForm(f => ({ ...f, guests: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30" />
            </div>
          </div>
          <div>
            <label className="font-sans text-xs font-medium text-gray-600 block mb-1">Total Price (USD)</label>
            <input type="number" min="0" step="0.01" value={form.total_price} onChange={(e) => setForm(f => ({ ...f, total_price: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30" />
          </div>
          <div>
            <label className="font-sans text-xs font-medium text-gray-600 block mb-1">Admin Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Internal notes (not shown to customer)…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none" />
          </div>
          <div>
            <label className="font-sans text-xs font-medium text-gray-600 block mb-1">Special Requests</label>
            <textarea rows={2} value={form.special_requests} onChange={(e) => setForm(f => ({ ...f, special_requests: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none" />
          </div>
          {mutation.isError && <p className="font-sans text-xs text-red-500">Failed to update. Please try again.</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 bg-green-900 hover:bg-green-800 text-white rounded-xl py-2.5 font-sans text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({ label, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="font-serif text-lg font-semibold text-green-950 mb-2">Delete {label}?</h3>
        <p className="font-sans text-sm text-gray-500 mb-6">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 border border-gray-200 rounded-xl py-2.5 font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 font-sans text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBookings() {
  const [page, setPage] = useState(1)
  const [replyTarget, setReplyTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page],
    queryFn: () => bookingsApi.all({ page, per_page: 20 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => bookingsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-bookings']); setDeleteTarget(null) },
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
                    {['#', 'Guest', 'Tour', 'Date', 'Guests', 'Total', 'Status', 'Booked', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-12 font-sans text-sm text-gray-400">No bookings yet</td></tr>
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
                      <td className="px-4 py-3"><StatusDropdown bookingId={b.id} current={b.status} /></td>
                      <td className="px-4 py-3 font-sans text-xs text-gray-400 whitespace-nowrap">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setReplyTarget(b)} title="Reply via email"
                            className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors">
                            <Mail size={13} />
                          </button>
                          <button onClick={() => setEditTarget(b)} title="Edit booking"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(b)} title="Delete booking"
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <span className="font-sans text-xs text-gray-400">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 font-sans text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
                  <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 font-sans text-xs disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
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

      {editTarget && <EditBookingModal booking={editTarget} onClose={() => setEditTarget(null)} />}

      {deleteTarget && (
        <DeleteConfirm
          label={`Booking #${deleteTarget.id}`}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
