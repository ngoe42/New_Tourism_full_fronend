import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, CheckCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { testimonialsApi } from '../api/testimonials'

export default function TestimonialFormModal({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', location: '', rating: 5, message: '' })
  const [hover, setHover] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: () => testimonialsApi.create(form),
    onSuccess: () => {
      setSubmitted(true)
      qc.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const canSubmit = form.name.trim().length >= 2 && form.message.trim().length >= 10

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-green-950 px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-white font-semibold">Share Your Experience</h2>
              <p className="font-sans text-xs text-white/60 mt-0.5">Your review will appear after approval</p>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {submitted ? (
            <div className="px-8 py-14 text-center">
              <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
              <p className="font-sans text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                Your review has been submitted and is awaiting approval. We appreciate your feedback!
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-green-700 text-white font-sans text-sm font-semibold rounded-xl hover:bg-green-800 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (canSubmit) mutation.mutate() }}
              className="px-8 py-7 space-y-5"
            >
              {/* Star rating */}
              <div>
                <label className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Your Rating *
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setForm((f) => ({ ...f, rating: n }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          n <= (hover || form.rating) ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-2.5 font-sans text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                />
              </div>

              {/* Location */}
              <div>
                <label className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Location <span className="text-gray-400 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={set('location')}
                  placeholder="e.g. London, UK"
                  className="w-full px-4 py-2.5 font-sans text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                />
              </div>

              {/* Message */}
              <div>
                <label className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Your Review *
                </label>
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  rows={4}
                  placeholder="Tell us about your safari experience…"
                  required
                  className="w-full px-4 py-2.5 font-sans text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition resize-none"
                />
                <p className={`font-sans text-xs mt-1 ${form.message.length < 10 && form.message.length > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {form.message.length < 10 ? `${10 - form.message.length} more characters needed` : `${form.message.length} characters`}
                </p>
              </div>

              {mutation.isError && (
                <p className="font-sans text-xs text-red-500">
                  {mutation.error?.response?.data?.detail || 'Something went wrong. Please try again.'}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-sans text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || mutation.isPending}
                  className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans text-sm font-semibold rounded-xl transition-colors"
                >
                  {mutation.isPending ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
