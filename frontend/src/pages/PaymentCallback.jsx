import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { bookingsApi } from '../api/bookings'

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

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [paymentStatus, setPaymentStatus] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState(null)

  const orderTrackingId = searchParams.get('OrderTrackingId') || searchParams.get('orderTrackingId')
  const merchantReference = searchParams.get('OrderMerchantReference') || searchParams.get('orderMerchantReference')

  useEffect(() => {
    async function checkStatus() {
      if (!orderTrackingId && !merchantReference) {
        setLoading(false)
        setPaymentStatus('UNKNOWN')
        return
      }

      if (merchantReference) {
        const match = merchantReference.match(/^NTS-(\d+)-/)
        if (match) setBookingId(parseInt(match[1]))
      }

      try {
        if (merchantReference) {
          const match = merchantReference.match(/^NTS-(\d+)-/)
          if (match) {
            const id = parseInt(match[1])
            setBookingId(id)
            await new Promise((r) => setTimeout(r, 1500))
            const data = await bookingsApi.pollPaymentStatus(id)
            setPaymentStatus(data.payment_status?.toUpperCase() || 'PENDING')
          }
        }
      } catch {
        setPaymentStatus('PENDING')
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [orderTrackingId, merchantReference])

  const config = STATUS_MAP[paymentStatus]

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center px-4">
        <Loader2 size={40} className="animate-spin text-gold mb-4" />
        <p className="font-sans text-gray-500 text-sm">Confirming your payment…</p>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-5">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-green-950 mb-2">Processing Payment</h2>
        <p className="font-sans text-gray-500 text-sm max-w-sm mb-6">
          Your payment is being processed. You will receive a confirmation email shortly.
        </p>
        <Link
          to="/"
          className="font-sans text-sm text-gold underline underline-offset-2"
        >
          Return to Home
        </Link>
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
