import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Loader2, Shield, AlertCircle } from 'lucide-react'
import { bookingsApi } from '../api/bookings'

const MAX_POLLS = 24        // poll for up to 2 minutes
const POLL_INTERVAL_MS = 5000

export default function PaymentModal({ isOpen, onClose, redirectUrl, bookingId, tourTitle, amount, currency = 'USD' }) {
  const [iframeReady, setIframeReady] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null) // null | COMPLETED | FAILED | INVALID | REVERSED
  const [pollCount, setPollCount] = useState(0)
  const pollTimer = useRef(null)
  const iframeRef = useRef(null)

  const startPolling = (count = 0) => {
    if (count >= MAX_POLLS) return
    pollTimer.current = setTimeout(async () => {
      try {
        const data = await bookingsApi.pollPaymentStatus(bookingId)
        const s = data.payment_status?.toUpperCase()
        if (s && s !== 'PENDING') {
          setPaymentStatus(s)
          clearTimeout(pollTimer.current)
        } else {
          setPollCount(count + 1)
          startPolling(count + 1)
        }
      } catch {
        startPolling(count + 1)
      }
    }, POLL_INTERVAL_MS)
  }

  useEffect(() => {
    if (!isOpen || !bookingId) return
    setIframeReady(false)
    setPaymentStatus(null)
    setPollCount(0)
    const delay = setTimeout(() => startPolling(0), 8000)
    return () => { clearTimeout(delay); clearTimeout(pollTimer.current) }
  }, [isOpen, bookingId])

  useEffect(() => {
    if (!isOpen) {
      clearTimeout(pollTimer.current)
      setPaymentStatus(null)
      setIframeReady(false)
      setPollCount(0)
    }
  }, [isOpen])

  const handleClose = () => {
    clearTimeout(pollTimer.current)
    onClose()
  }

  const isDone = paymentStatus && paymentStatus !== 'PENDING'
  const isSuccess = paymentStatus === 'COMPLETED'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={!isDone ? undefined : handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: '90vh' }}>

              {/* ── Header ── */}
              <div className="bg-green-950 px-6 py-4 flex items-start justify-between flex-shrink-0">
                <div>
                  <p className="font-sans text-green-200 text-xs uppercase tracking-widest mb-0.5">Secure Payment</p>
                  <h2 className="font-serif text-white text-lg font-semibold leading-tight">{tourTitle}</h2>
                  <p className="font-sans text-gold text-sm font-medium mt-0.5">
                    {currency} {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="ml-4 mt-0.5 text-green-300 hover:text-white transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* ── Accepted methods strip ── */}
              <div className="bg-green-950/5 border-b border-gray-100 px-6 py-2.5 flex items-center gap-3 flex-shrink-0">
                <Shield size={13} className="text-green-700 flex-shrink-0" />
                <p className="font-sans text-xs text-gray-500">Accepted:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {['M-Pesa', 'Airtel', 'Visa', 'Mastercard'].map((m) => (
                    <span key={m} className="font-sans text-[10px] font-semibold text-gray-600 bg-gray-100 rounded px-2 py-0.5">
                      {m}
                    </span>
                  ))}
                </div>
                <span className="ml-auto font-sans text-[10px] text-green-700 font-medium">256-bit SSL</span>
              </div>

              {/* ── Body ── */}
              <div className="flex-1 relative overflow-hidden" style={{ minHeight: '400px' }}>

                {/* Success / Failure overlay */}
                <AnimatePresence>
                  {isDone && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center px-8 text-center"
                    >
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
                        {isSuccess
                          ? <CheckCircle size={40} className="text-green-600" />
                          : paymentStatus === 'FAILED'
                            ? <XCircle size={40} className="text-red-500" />
                            : <AlertCircle size={40} className="text-amber-500" />
                        }
                      </div>
                      <h3 className="font-serif text-2xl font-semibold text-green-950 mb-2">
                        {isSuccess ? 'Payment Successful!' : paymentStatus === 'FAILED' ? 'Payment Failed' : 'Payment Issue'}
                      </h3>
                      <p className="font-sans text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
                        {isSuccess
                          ? 'Your booking is confirmed. A confirmation email has been sent to your inbox.'
                          : 'Your payment could not be completed. Please try again or use a different payment method.'
                        }
                      </p>
                      <button
                        onClick={handleClose}
                        className={`font-sans text-sm font-medium px-8 py-3 rounded-xl text-white transition-colors ${isSuccess ? 'bg-green-900 hover:bg-gold' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        {isSuccess ? 'Done' : 'Close'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading shimmer while iframe initialises */}
                {!iframeReady && !isDone && (
                  <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-3">
                    <Loader2 size={28} className="animate-spin text-gold" />
                    <p className="font-sans text-sm text-gray-400">Loading secure payment…</p>
                  </div>
                )}

                {/* Pesapal iframe */}
                {redirectUrl && !isDone && (
                  <iframe
                    ref={iframeRef}
                    src={redirectUrl}
                    title="Secure Payment"
                    className="w-full h-full border-0"
                    style={{ minHeight: '460px' }}
                    onLoad={() => setIframeReady(true)}
                    allow="payment"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                  />
                )}
              </div>

              {/* ── Footer ── */}
              <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0 bg-gray-50">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-gray-400" />
                  <span className="font-sans text-[10px] text-gray-400">Powered by Pesapal · PCI DSS Compliant</span>
                </div>
                {!isDone && pollCount > 0 && (
                  <span className="font-sans text-[10px] text-gray-400 flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" />
                    Watching for payment…
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
