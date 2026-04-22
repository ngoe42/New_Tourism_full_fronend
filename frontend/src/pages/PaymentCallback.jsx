import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, AlertCircle, ArrowRight, RefreshCw, Mail } from 'lucide-react'
import { bookingsApi } from '../api/bookings'
import apiClient from '../api/client'

const STATUS_MAP = {
  COMPLETED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    title: 'Payment Successful!',
    message: 'Your booking is confirmed. A confirmation email has been sent to your inbox.',
    cta: 'View My Bookings',
    ctaTo: '/my-bookings',
    ctaStyle: 'bg-green-900 hover:bg-gold',
  },
  FAILED: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    title: 'Payment Failed',
    message: 'Your payment could not be processed. Please try again or contact our team.',
    cta: 'Try Again',
    ctaTo: '/tours',
    ctaStyle: 'bg-red-600 hover:bg-red-700',
  },
  INVALID: {
    icon: AlertCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    title: 'Payment Invalid',
    message: 'There was an issue with your payment. Please contact our support team.',
    cta: 'Contact Us',
    ctaTo: '/contact',
    ctaStyle: 'bg-amber-600 hover:bg-amber-700',
  },
  REVERSED: {
    icon: AlertCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    title: 'Payment Reversed',
    message: 'Your payment was reversed. Please contact us for assistance.',
    cta: 'Contact Us',
    ctaTo: '/contact',
    ctaStyle: 'bg-amber-600 hover:bg-amber-700',
  },
}

const MAX_POLLS = 8
const POLL_INTERVAL_MS = 5000

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState(null)
  const [pollCount, setPollCount] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [resendEmail, setResendEmail] = useState('')
  const [resendRef, setResendRef] = useState('')
  const [resendSent, setResendSent] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const pollTimer = useRef(null)
  const countdownTimer = useRef(null)

  const orderTrackingId = searchParams.get('OrderTrackingId') || searchParams.get('orderTrackingId')
  const merchantReference = searchParams.get('OrderMerchantReference') || searchParams.get('orderMerchantReference')

  const extractBookingId = (ref) => {
    if (!ref) return null
    const match = ref.match(/^NTS-(\d+)-/)
    return match ? parseInt(match[1]) : null
  }

  const pollStatus = async (id) => {
    try {
      const data = await bookingsApi.pollPaymentStatus(id)
      const s = data.payment_status?.toUpperCase() || 'PENDING'
      setPaymentStatus(s)
      return s
    } catch {
      return 'PENDING'
    }
  }

  const startCountdown = (seconds) => {
    setCountdown(seconds)
    clearInterval(countdownTimer.current)
    countdownTimer.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(countdownTimer.current); return 0 }
        return c - 1
      })
    }, 1000)
  }

  useEffect(() => {
    const storedId = sessionStorage.getItem('lastBookingId')
    const storedEmail = sessionStorage.getItem('lastBookingEmail')

    const id = extractBookingId(merchantReference) || (storedId ? parseInt(storedId) : null)
    if (id) {
      setBookingId(id)
      setResendRef(`NTS-${id}`)
    }
    if (storedEmail && !resendEmail) setResendEmail(storedEmail)

    async function initialCheck() {
      if (!merchantReference && !orderTrackingId && !id) {
        setLoading(false)
        setPaymentStatus('UNKNOWN')
        return
      }
      if (!id) { setLoading(false); return }

      await new Promise((r) => setTimeout(r, 1500))
      const s = await pollStatus(id)
      setLoading(false)
      if (s === 'PENDING') schedulePoll(id, 1)
    }

    initialCheck()
    return () => { clearTimeout(pollTimer.current); clearInterval(countdownTimer.current) }
  }, [])

  const schedulePoll = (id, count) => {
    if (count > MAX_POLLS) return
    setPollCount(count)
    startCountdown(POLL_INTERVAL_MS / 1000)
    pollTimer.current = setTimeout(async () => {
      const s = await pollStatus(id)
      if (s === 'PENDING') schedulePoll(id, count + 1)
    }, POLL_INTERVAL_MS)
  }

  const handleManualRetry = async () => {
    if (!bookingId) return
    clearTimeout(pollTimer.current)
    clearInterval(countdownTimer.current)
    setLoading(true)
    const s = await pollStatus(bookingId)
    setLoading(false)
    if (s === 'PENDING') schedulePoll(bookingId, pollCount + 1)
  }

  const handleResend = async (e) => {
    e.preventDefault()
    if (!resendEmail || !resendRef) return
    setResendLoading(true)
    try {
      await apiClient.post('/payments/resend-link', { email: resendEmail, booking_ref: resendRef })
      setResendSent(true)
    } catch {
      setResendSent(true)
    } finally {
      setResendLoading(false)
    }
  }

  const config = STATUS_MAP[paymentStatus]
  const isPending = !config
  const gaveUp = isPending && pollCount >= MAX_POLLS

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center px-4">
        <Loader2 size={40} className="animate-spin text-gold mb-4" />
        <p className="font-sans text-gray-500 text-sm">Confirming your payment…</p>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full"
        >
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            {gaveUp
              ? <AlertCircle size={32} className="text-amber-500" />
              : <Loader2 size={32} className="animate-spin text-amber-500" />
            }
          </div>
          <h2 className="font-serif text-2xl font-semibold text-green-950 mb-2">
            {gaveUp ? 'Still Processing…' : 'Confirming Payment'}
          </h2>
          {bookingId && (
            <p className="font-sans text-xs text-gray-400 mb-3">
              Booking Reference: <span className="font-semibold text-gray-600">#{bookingId}</span>
            </p>
          )}
          <p className="font-sans text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
            {gaveUp
              ? 'Your payment may still be processing. If you completed payment, check your email for a confirmation — it can take a few minutes.'
              : `Checking payment status… ${countdown > 0 ? `(retrying in ${countdown}s)` : ''}`
            }
          </p>

          {!gaveUp && (
            <button
              onClick={handleManualRetry}
              className="flex items-center gap-2 mx-auto mb-6 font-sans text-sm text-green-900 border border-green-900 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors"
            >
              <RefreshCw size={14} /> Check Now
            </button>
          )}

          <div className="border-t border-gray-100 pt-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={15} className="text-gold" />
              <p className="font-sans text-sm font-semibold text-gray-700">Didn't get a confirmation email?</p>
            </div>
            <p className="font-sans text-xs text-gray-400 mb-4">
              Enter your email and booking reference below to resend the payment link.
            </p>
            <AnimatePresence>
              {resendSent ? (
                <motion.p
                  key="sent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-sans text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3"
                >
                  ✓ If a matching booking was found, we've sent the link to your email.
                </motion.p>
              ) : (
                <motion.form key="form" onSubmit={handleResend} className="flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="font-sans text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-900"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Booking ref (e.g. NTS-6 or 6)"
                    value={resendRef}
                    onChange={(e) => setResendRef(e.target.value)}
                    className="font-sans text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-900"
                  />
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="bg-green-900 text-white font-sans text-sm font-medium py-2.5 rounded-xl hover:bg-gold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {resendLoading ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                    Resend Payment Link
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <Link to="/" className="block mt-6 font-sans text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Return to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  const Icon = config.icon

  return (
    <div className="min-h-screen bg-beige flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
      >
        <div className={`w-20 h-20 rounded-full ${config.bg} flex items-center justify-center mx-auto mb-6`}>
          <Icon size={40} className={config.color} />
        </div>

        <h1 className="font-serif text-2xl font-semibold text-green-950 mb-3">{config.title}</h1>
        <p className="font-sans text-gray-500 text-sm leading-relaxed mb-6">{config.message}</p>

        {bookingId && (
          <p className="font-sans text-xs text-gray-400 mb-6">
            Booking Reference: <span className="font-semibold text-gray-600">#{bookingId}</span>
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            to={config.ctaTo}
            className={`${config.ctaStyle} text-white font-sans font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm`}
          >
            {config.cta} <ArrowRight size={15} />
          </Link>
          <Link
            to="/"
            className="font-sans text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
