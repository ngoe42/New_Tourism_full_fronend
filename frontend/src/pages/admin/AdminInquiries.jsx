import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, Phone, Calendar, ChevronDown, ChevronUp, Search, X, Trash2, Loader2 } from 'lucide-react'
import { inquiriesApi } from '../../api/inquiries'
import EmailReplyModal from '../../components/EmailReplyModal'

const STATUS_TABS = [
  { key: null,       label: 'All' },
  { key: 'new',     label: 'New' },
  { key: 'replied', label: 'Replied' },
]

function InquiryRow({ inquiry, onReply, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const queryClient = useQueryClient()

  const markRead = useMutation({
    mutationFn: () => inquiriesApi.update(inquiry.id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => inquiriesApi.delete(inquiry.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] }),
  })

  const handleExpand = () => {
    if (!expanded && !inquiry.is_read) markRead.mutate()
    setExpanded((e) => !e)
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-sans text-sm font-bold text-green-700 flex-shrink-0">
            {inquiry.name?.[0]?.toUpperCase() ?? 'G'}
          </div>
          <div className="min-w-0">
            <div className="font-sans text-sm font-semibold text-gray-900 truncate">{inquiry.name}</div>
            <div className="font-sans text-xs text-gray-400 truncate">{inquiry.email}</div>
          </div>
          {inquiry.tour_interest && (
            <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full font-sans text-[11px] font-medium truncate max-w-[160px]">
              {inquiry.tour_interest}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className={`px-2.5 py-0.5 rounded-full font-sans text-[11px] font-semibold ${
            inquiry.is_replied ? 'bg-green-100 text-green-700' :
            inquiry.is_read ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {inquiry.is_replied ? 'Replied' : inquiry.is_read ? 'Read' : 'New'}
          </span>
          <span className="font-sans text-xs text-gray-400 hidden sm:block">
            {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString() : ''}
          </span>
          {expanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <div className="flex flex-wrap gap-3 mt-4 mb-4">
            {inquiry.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={13} className="text-gray-400" />
                {inquiry.phone}
              </div>
            )}
            {inquiry.tour_interest && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={13} className="text-gray-400" />
                Interested in: {inquiry.tour_interest}
              </div>
            )}
          </div>
          {inquiry.message && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-sans text-sm text-gray-600 leading-relaxed">{inquiry.message}</p>
            </div>
          )}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => onReply(inquiry)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-sans text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Mail size={13} /> Reply via Email
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 font-sans text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs text-gray-500">Sure?</span>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white font-sans text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {deleteMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : null}
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 border border-gray-200 font-sans text-xs text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminInquiries() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(null)
  const [replyTarget, setReplyTarget] = useState(null)

  const handleSearch = useCallback((val) => { setSearch(val); setPage(1) }, [])
  const handleStatus = useCallback((key) => { setStatus(key); setPage(1) }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inquiries', page, search, status],
    queryFn: () => inquiriesApi.all({ page, per_page: 20, search: search || undefined, status: status || undefined }),
  })

  const inquiries = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.pages ?? 1

  return (
    <div className="space-y-4">
      {/* Search + Filter toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-8 pr-8 py-2 font-sans text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition"
          />
          {search && (
            <button onClick={() => handleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-shrink-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleStatus(tab.key)}
              className={`px-3 py-1.5 rounded-md font-sans text-xs font-medium transition-all ${
                status === tab.key
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <p className="font-sans text-sm text-gray-400">{total} {status ? status : 'total'} inquiries{search ? ` matching "${search}"` : ''}</p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Mail size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="font-sans text-sm text-gray-400">No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => <InquiryRow key={inq.id} inquiry={inq} onReply={setReplyTarget} onDelete={() => {}} />)}
        </div>
      )}

      {replyTarget && (
        <EmailReplyModal
          recipient={{ name: replyTarget.name, email: replyTarget.email }}
          subject={`Re: Your Nelson Tours & Safari Inquiry${replyTarget.tour_interest ? ` — ${replyTarget.tour_interest}` : ''}`}
          inquiryId={replyTarget.id}
          invalidateKey="admin-inquiries"
          onClose={() => setReplyTarget(null)}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
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
    </div>
  )
}
