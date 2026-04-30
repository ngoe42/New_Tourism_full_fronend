import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle, Clock, XCircle, AlertCircle, Loader2,
  Calendar, Users, DollarSign, MapPin, Timer,
  Mail, Phone, ArrowRight, CreditCard, FileText,
} from 'lucide-react'
import { bookingsApi } from '../api/bookings'

const STATUS_CONFIG = {
  pending:   { label: 'Pending Confirmation', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed',             color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
  completed: { label: 'Completed',             color: 'text-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-200',  icon: CheckCircle },
  cancelled: { label: 'Cancelled',             color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200',   icon: XCircle },
}

const PAYMENT_CONFIG = {
  COMPLETED: { label: 'Payment Received',  color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
  PENDING:   { label: 'Payment Pending',   color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  FAILED:    { label: 'Payment Failed',    color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200',   icon: XCircle },
  REVERSED:  { label: 'Payment Reversed',  color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200',   icon: AlertCircle },
  INVALID:   { label: 'Payment Invalid',   color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200',   icon: AlertCircle },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function BookingConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const bookingId = parseInt(id, 10)

  useEffect(() => {
    const stored = sessionStorage.getItem('lastBookingEmail')
    if (stored) {
      setEmail(stored)
      fetchBooking(bookingId, stored)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  async function fetchBooking(bid, em) {
    setLoading(true)
    setError('')
    try {
      const data = await bookingsApi.lookupPublic(bid, em)
      setBooking(data)
    } catch {
      setError('No booking found matching that ID and email address.')
    } finally {
      setLoading(false)
    }
  }

  function handleEmailSubmit(e) {
    e.preventDefault()
    const trimmed = emailInput.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    setEmailError('')
    setSubmitting(true)
    setEmail(trimmed)
    fetchBooking(bookingId, trimmed).finally(() => setSubmitting(false))
  }

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="animate-spin text-[#c9a96e]" />
          <p className="font-sans text-sm text-gray-400">Loading your booking…</p>
        </div>
      </div>
    )
  }

  /* ── Email gate (no stored email, or wrong email after failed attempt) ── */
  if (!booking && !loading) {
    return (
      <div className="min-h-[70vh] bg-[#faf8f3] flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full"
        >
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <FileText size={28} className="text-green-700" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-green-950 text-center mb-1">
            View My Booking
          </h1>
          <p className="font-sans text-sm text-gray-400 text-center mb-6">
            Booking Reference: <span className="font-semibold text-gray-600">#{bookingId}</span>
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 font-sans text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            <label className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Confirm your email address
            </label>
            <input
              type="email"
              required
              placeholder="Email used when booking"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setEmailError('') }}
              className="font-sans text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-800 transition-colors"
            />
            {emailError && (
              <p className="font-sans text-xs text-red-500">{emailError}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-green-900 hover:bg-[#c9a96e] text-white font-sans text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
              View Booking
            </button>
          </form>

          <Link to="/contact" className="block mt-4 text-center font-sans text-xs text-gray-400 hover:text-[#c9a96e] transition-colors">
            Need help? Contact us →
          </Link>
        </motion.div>
      </div>
    )
  }

  /* ── Booking detail view ─────────────────────────────────── */
  const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
  const paymentCfg = booking.payment_status
    ? (PAYMENT_CONFIG[booking.payment_status.toUpperCase()] || PAYMENT_CONFIG.PENDING)
    : null
  const StatusIcon = statusCfg.icon
  const PayIcon = paymentCfg?.icon

  const needsPayment = booking.payment_status?.toUpperCase() === 'PENDING'
  const isPaid = booking.payment_status?.toUpperCase() === 'COMPLETED' || booking.status === 'confirmed' || booking.status === 'completed'

  return (
    <div className="min-h-screen bg-[#faf8f3] py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-md overflow-hidden mb-4"
        >
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-green-900 via-[#c9a96e] to-green-700" />

          <div className="px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-sans text-xs text-gray-400 uppercase tracking-widest mb-0.5">
                Booking Reference
              </p>
              <p className="font-serif text-3xl font-bold text-green-950">
                #{booking.id}
              </p>
              <p className="font-sans text-xs text-gray-400 mt-1">
                Placed {formatDateTime(booking.created_at)}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-start sm:items-end">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold font-sans px-3 py-1.5 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                <StatusIcon size={12} />
                {statusCfg.label}
              </span>
              {paymentCfg && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold font-sans px-3 py-1.5 rounded-full border ${paymentCfg.bg} ${paymentCfg.color} ${paymentCfg.border}`}>
                  <PayIcon size={12} />
                  {paymentCfg.label}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Tour summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl shadow-md px-8 py-7 mb-4"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Tour Details
          </p>

          <h2 className="font-serif text-2xl font-semibold text-green-950 mb-5 leading-snug">
            {booking.tour?.title || `Tour #${booking.tour_id}`}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#c9a96e]">
                <Calendar size={14} />
                <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400">Travel Date</span>
              </div>
              <p className="font-sans text-sm font-semibold text-gray-800">
                {formatDate(booking.travel_date)}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#c9a96e]">
                <Users size={14} />
                <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400">Guests</span>
              </div>
              <p className="font-sans text-sm font-semibold text-gray-800">
                {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#c9a96e]">
                <DollarSign size={14} />
                <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400">Total Price</span>
              </div>
              <p className="font-sans text-sm font-semibold text-gray-800">
                USD {Number(booking.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            {booking.tour?.duration && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[#c9a96e]">
                  <Timer size={14} />
                  <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400">Duration</span>
                </div>
                <p className="font-sans text-sm font-semibold text-gray-800">
                  {booking.tour.duration}
                </p>
              </div>
            )}
          </div>

          {booking.tour?.location && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <MapPin size={14} className="text-[#c9a96e] flex-shrink-0" />
              <span className="font-sans text-sm text-gray-600">{booking.tour.location}</span>
            </div>
          )}
        </motion.div>

        {/* ── Contact details ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-md px-8 py-7 mb-4"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Your Details
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <Users size={14} className="text-green-700" />
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400">Full Name</p>
                <p className="font-sans text-sm font-semibold text-gray-800">{booking.contact_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <Mail size={14} className="text-green-700" />
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400">Email</p>
                <p className="font-sans text-sm font-semibold text-gray-800 break-all">{booking.contact_email}</p>
              </div>
            </div>
            {booking.contact_phone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-green-700" />
                </div>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400">Phone</p>
                  <p className="font-sans text-sm font-semibold text-gray-800">{booking.contact_phone}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Special requests ── */}
        {booking.special_requests && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="bg-white rounded-3xl shadow-md px-8 py-7 mb-4"
          >
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Special Requests
            </p>
            <p className="font-sans text-sm text-gray-600 leading-relaxed">
              {booking.special_requests}
            </p>
          </motion.div>
        )}

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="flex flex-col gap-3"
        >
          {needsPayment && (
            <button
              onClick={() => navigate(`/payment/resume?id=${booking.id}`)}
              className="w-full flex items-center justify-center gap-2 bg-[#c9a96e] hover:bg-amber-700 text-white font-sans text-sm font-semibold py-3.5 rounded-xl transition-colors shadow-md"
            >
              <CreditCard size={16} /> Complete Payment Now
            </button>
          )}

          {isPaid && (
            <div className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 font-sans text-sm font-semibold py-3.5 rounded-xl">
              <CheckCircle size={16} /> Payment Confirmed — Thank You!
            </div>
          )}

          <div className="flex gap-3">
            <Link
              to="/tours"
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-green-900 text-gray-600 hover:text-green-900 font-sans text-sm font-medium py-3 rounded-xl transition-colors"
            >
              Explore More Tours
            </Link>
            <Link
              to="/contact"
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-green-900 text-gray-600 hover:text-green-900 font-sans text-sm font-medium py-3 rounded-xl transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>

        {/* ── Footer note ── */}
        <p className="font-sans text-xs text-gray-400 text-center mt-6">
          A confirmation email was sent to <span className="font-semibold">{booking.contact_email}</span>.
          Questions? Call us at <a href="tel:+255750005973" className="text-[#c9a96e] hover:underline">+255 750 005 973</a>
        </p>

      </div>
    </div>
  )
}
