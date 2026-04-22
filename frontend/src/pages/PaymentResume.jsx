import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, CheckCircle, XCircle, Shield, ArrowLeft, RefreshCw } from 'lucide-react'
import { bookingsApi } from '../api/bookings'

const MAX_POLLS = 30          // 30 × 60s = 30 minutes total polling window
const POLL_INTERVAL_MS = 60000  // poll every 60s
const POLL_START_DELAY = 300000 // wait 5 min before first poll (give user time to pay)
// Pesapal returns 'INVALID' for brand-new orders that haven't been attempted yet.
// Never treat INVALID as a failure during an active payment session.
const TERMINAL_FAILURES = ['FAILED', 'REVERSED']

export default function PaymentResume() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [iframeReady, setIframeReady] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const pollTimer = useRef(null)
  const iframeTimeout = useRef(null)
  const failCount = useRef(0)  // consecutive FAILED polls — only finalize after 2

  const startPolling = (count = 0) => {
    if (count >= MAX_POLLS) return
    pollTimer.current = setTimeout(async () => {
      try {
        const res = await bookingsApi.pollPaymentStatus(bookingId)
        const s = res.payment_status?.toUpperCase()
        if (s === 'COMPLETED') {
          setPaymentStatus('COMPLETED')
        } else if (TERMINAL_FAILURES.includes(s)) {
          // Require 2 consecutive FAILED polls before showing failure
          // (avoids false positives from transient Pesapal errors)
          failCount.current += 1
          if (failCount.current >= 2) {
            setPaymentStatus(s)
          } else {
            startPolling(count + 1)
          }
        } else {
          // PENDING, INVALID, UNKNOWN, NOT_INITIATED — all mean "not done yet"
          failCount.current = 0
          startPolling(count + 1)
        }
      } catch {
        startPolling(count + 1)
      }
    }, POLL_INTERVAL_MS)
  }

  const armIframeTimeout = () => {
    clearTimeout(iframeTimeout.current)
    iframeTimeout.current = setTimeout(() => {
      setIframeError(true)
    }, 15000)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setIframeError(false)
    setIframeReady(false)
    try {
      const res = await bookingsApi.refreshPaymentLink(bookingId)
      setData((prev) => ({ ...prev, redirect_url: res.redirect_url }))
      armIframeTimeout()
    } catch {
      setIframeError(true)
    } finally {
      setRefreshing(false)
    }
  }

  // Listen for postMessage from PaymentCallback page loaded inside the iframe.
  // When Pesapal finishes, it redirects the iframe to our callback URL which
  // sends window.parent.postMessage — this gives us instant status without polling.
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'pesapal_payment_status') {
        const s = event.data.status?.toUpperCase()
        if (s) setPaymentStatus(s)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided.')
      setLoading(false)
      return
    }
    bookingsApi.getPaymentLink(bookingId)
      .then((res) => {
        setData(res)
        setLoading(false)
        if (res.payment_status?.toUpperCase() === 'COMPLETED') {
          setPaymentStatus('COMPLETED')
        } else {
          // Give user at least 3 minutes to complete payment before first poll.
          // postMessage from the iframe callback will handle fast completions.
          setTimeout(() => startPolling(0), POLL_START_DELAY)
          armIframeTimeout()
        }
      })
      .catch(() => {
        setError('Payment link not found or has expired. Please contact us for assistance.')
        setLoading(false)
      })
    return () => { clearTimeout(pollTimer.current); clearTimeout(iframeTimeout.current) }
  }, [bookingId])

  const isSuccess = paymentStatus === 'COMPLETED'
  const isFailed = paymentStatus && paymentStatus !== 'COMPLETED'

  /* ── Loading state ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="animate-spin text-[#c9a96e]" />
          <p className="font-sans text-sm text-gray-400">Loading your payment details…</p>
        </div>
      </div>
    )
  }

  /* ── Error state ───────────────────────────────────────── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center gap-4">
          <AlertCircle size={40} className="text-red-400" />
          <p className="font-sans text-sm text-gray-600">{error}</p>
          <Link to="/contact" className="font-sans text-sm font-medium text-[#c9a96e] hover:underline">
            Contact us for help →
          </Link>
        </div>
      </div>
    )
  }

  /* ── Full payment page ─────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#faf8f3] flex flex-col">

      {/* ── Top bar ── */}
      <header className="bg-green-950 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 text-green-200 hover:text-white transition-colors text-sm font-sans">
          <ArrowLeft size={15} />
          Back to site
        </Link>
        <span className="font-serif text-base font-semibold tracking-wide">Nelson Tours &amp; Safari</span>
        <div className="flex items-center gap-1.5 text-green-300 text-xs font-sans">
          <Shield size={13} />
          Secure Payment
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">

        {/* ── Left: booking summary ── */}
        <aside className="lg:w-72 xl:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 flex-shrink-0 px-6 py-8 flex flex-col gap-6">
          <div>
            <p className="font-sans text-xs text-gray-400 uppercase tracking-widest mb-1">Booking for</p>
            <h1 className="font-serif text-xl font-semibold text-green-950 leading-tight">
              {data?.tour_title || 'Your Safari'}
            </h1>
            <p className="font-sans text-2xl font-bold text-[#c9a96e] mt-2">
              USD {Number(data?.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="font-sans text-xs text-gray-400 mt-1">Booking #{bookingId}</p>
          </div>

          <div className="space-y-2">
            <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-widest">Accepted payments</p>
            {['M-Pesa', 'Airtel Money', 'Visa', 'Mastercard'].map((m) => (
              <div key={m} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
                <span className="font-sans text-sm text-gray-600">{m}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-green-700">
              <Shield size={14} />
              <span className="font-sans text-xs text-gray-500">256-bit SSL · PCI DSS Compliant</span>
            </div>
            <p className="font-sans text-xs text-gray-400 mt-1">Powered by Pesapal</p>
          </div>
        </aside>

        {/* ── Right: iframe or result ── */}
        <main className="flex-1 relative bg-white" style={{ minHeight: '500px' }}>

          {/* Success */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center bg-white"
              >
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle size={44} className="text-green-600" />
                </div>
                <h2 className="font-serif text-2xl font-semibold text-green-950">Payment Successful!</h2>
                <p className="font-sans text-sm text-gray-500 max-w-xs leading-relaxed">
                  Your booking is confirmed. A confirmation email has been sent to your inbox with all the details.
                </p>
                <Link
                  to="/"
                  className="mt-2 font-sans text-sm font-semibold text-white bg-green-900 hover:bg-[#c9a96e] transition-colors px-8 py-3 rounded-xl"
                >
                  Back to Home
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Failed / Reversed */}
          <AnimatePresence>
            {isFailed && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center bg-white"
              >
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle size={44} className="text-red-500" />
                </div>
                <h2 className="font-serif text-2xl font-semibold text-green-950">Payment Failed</h2>
                <p className="font-sans text-sm text-gray-500 max-w-xs leading-relaxed">
                  Your payment could not be completed. Please try again or contact us for assistance.
                </p>
                <Link
                  to="/contact"
                  className="mt-2 font-sans text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 transition-colors px-8 py-3 rounded-xl"
                >
                  Contact Us
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading shimmer while iframe loads */}
          {!iframeReady && !paymentStatus && !iframeError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
              <Loader2 size={28} className="animate-spin text-[#c9a96e]" />
              <p className="font-sans text-sm text-gray-400">Loading secure payment form…</p>
            </div>
          )}

          {/* Iframe load failure / expired link */}
          <AnimatePresence>
            {iframeError && !paymentStatus && (
              <motion.div
                key="iframe-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center bg-white z-10"
              >
                <AlertCircle size={40} className="text-amber-500" />
                <h3 className="font-serif text-lg font-semibold text-green-950">Payment Form Unavailable</h3>
                <p className="font-sans text-sm text-gray-500 max-w-xs leading-relaxed">
                  The payment session may have expired or failed to load. Click below to get a fresh payment link.
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 font-sans text-sm font-semibold text-white bg-green-900 hover:bg-[#c9a96e] transition-colors px-6 py-3 rounded-xl disabled:opacity-60"
                >
                  {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                  {refreshing ? 'Getting fresh link…' : 'Refresh Payment Link'}
                </button>
                <Link to="/contact" className="font-sans text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Need help? Contact us
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pesapal iframe */}
          {data?.redirect_url && !paymentStatus && (
            <iframe
              src={data.redirect_url}
              title="Secure Payment"
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 60px)', display: iframeError ? 'none' : 'block' }}
              onLoad={() => { setIframeReady(true); clearTimeout(iframeTimeout.current) }}
              onError={() => setIframeError(true)}
              allow="payment"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            />
          )}

          {/* Refresh button always visible once iframe is loaded */}
          {iframeReady && !paymentStatus && !iframeError && (
            <div className="absolute bottom-3 right-3 z-10">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 font-sans text-xs text-gray-400 hover:text-gray-600 bg-white/80 border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm transition-colors disabled:opacity-50"
                title="Refresh payment link if expired"
              >
                <RefreshCw size={11} />
                Refresh link
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
