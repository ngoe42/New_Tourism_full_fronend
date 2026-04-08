import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'

/**
 * EmailReplyModal
 * Props:
 *   recipient  — { name, email }
 *   subject    — pre-filled subject string
 *   inquiryId  — optional, marks inquiry as replied on send
 *   bookingId  — optional, marks booking as replied on send
 *   invalidateKey — react-query key to invalidate after success
 *   onClose    — called to dismiss
 */
export default function EmailReplyModal({ recipient, subject: defaultSubject, inquiryId, bookingId, invalidateKey, onClose }) {
  const qc = useQueryClient()
  const [subject, setSubject] = useState(defaultSubject ?? '')
  const [body, setBody] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.sendEmail({
        to: recipient.email,
        subject,
        body,
        inquiry_id: inquiryId ?? null,
        booking_id: bookingId ?? null,
      }),
    onSuccess: () => {
      if (invalidateKey) qc.invalidateQueries([invalidateKey])
    },
  })

  const handleSend = (e) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) return
    mutation.mutate()
  }

  const sent = mutation.isSuccess

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.22 }}
          className="relative w-full sm:w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header — chat style */}
          <div className="bg-green-950 px-5 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-sans text-sm font-bold text-white flex-shrink-0">
              {recipient.name?.[0]?.toUpperCase() ?? 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-semibold text-white truncate">{recipient.name}</p>
              <p className="font-sans text-xs text-white/60 truncate">{recipient.email}</p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Chat bubble area */}
          <div className="flex-1 overflow-y-auto bg-[#f5f5f0] px-5 py-4 min-h-[80px]">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-end gap-1"
              >
                <div className="bg-green-700 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-xs shadow-sm">
                  <p className="font-sans text-sm whitespace-pre-wrap leading-relaxed">{body}</p>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={12} />
                  <span className="font-sans text-[11px]">Sent successfully</span>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <Mail size={14} />
                <span className="font-sans text-xs">Your reply will appear here after sending</span>
              </div>
            )}
          </div>

          {/* Compose area */}
          {!sent ? (
            <form onSubmit={handleSend} className="flex-shrink-0 border-t border-gray-100 bg-white">
              {/* Subject */}
              <div className="px-4 pt-3 pb-1">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full font-sans text-xs font-semibold text-gray-500 placeholder-gray-300 border-b border-gray-100 pb-2 focus:outline-none focus:border-green-300 bg-transparent"
                />
              </div>

              {/* Body */}
              <div className="px-4 pt-1 pb-2">
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  placeholder={`Hi ${recipient.name?.split(' ')[0] ?? 'there'},\n\nThank you for your interest in Nelson Tours & Safari…`}
                  className="w-full font-sans text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none bg-transparent leading-relaxed"
                />
              </div>

              {/* Error */}
              {mutation.isError && (
                <div className="mx-4 mb-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-red-600 leading-snug">
                    {mutation.error?.response?.data?.detail
                      || mutation.error?.response?.data?.message
                      || mutation.error?.message
                      || 'Failed to send email. Check SMTP settings.'}
                  </p>
                </div>
              )}

              {/* Footer toolbar */}
              <div className="flex items-center justify-between px-4 pb-4 pt-1">
                <span className="font-sans text-[11px] text-gray-300">To: {recipient.email}</span>
                <button
                  type="submit"
                  disabled={mutation.isPending || !subject.trim() || !body.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans text-xs font-semibold rounded-full transition-colors shadow-sm"
                >
                  {mutation.isPending ? (
                    <><Loader2 size={13} className="animate-spin" /> Sending…</>
                  ) : (
                    <><Send size={13} /> Send Email</>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-green-700 text-white font-sans text-xs font-semibold rounded-full hover:bg-green-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
