import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { bookingsApi } from '../api/bookings'
import PaymentModal from '../components/PaymentModal'

export default function PaymentResume() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

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
        if (res.payment_status?.toUpperCase() !== 'COMPLETED') {
          setModalOpen(true)
        }
      })
      .catch(() => {
        setError('Payment link not found or has expired. Please contact us for assistance.')
        setLoading(false)
      })
  }, [bookingId])

  const alreadyPaid = data?.payment_status?.toUpperCase() === 'COMPLETED'

  return (
    <div className="min-h-screen bg-[#faf8f3] flex flex-col items-center justify-center px-4 py-16">
      {/* Branding */}
      <Link to="/" className="mb-10">
        <span className="font-serif text-2xl font-bold text-green-950 tracking-tight">
          Nelson Tours &amp; Safari
        </span>
      </Link>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 text-gray-500"
        >
          <Loader2 size={36} className="animate-spin text-[#c9a96e]" />
          <p className="font-sans text-sm">Loading your payment details…</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center gap-4"
        >
          <AlertCircle size={40} className="text-red-400" />
          <p className="font-sans text-sm text-gray-600">{error}</p>
          <Link
            to="/contact"
            className="font-sans text-sm font-medium text-[#c9a96e] hover:underline"
          >
            Contact us for help →
          </Link>
        </motion.div>
      )}

      {!loading && !error && alreadyPaid && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle size={36} className="text-green-600" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-green-950">Payment Already Confirmed</h2>
          <p className="font-sans text-sm text-gray-500">
            Your booking #{bookingId} has already been paid and confirmed. Check your email for the confirmation details.
          </p>
          <Link
            to="/"
            className="font-sans text-sm font-medium text-green-900 hover:text-[#c9a96e] transition-colors"
          >
            ← Back to home
          </Link>
        </motion.div>
      )}

      {!loading && !error && !alreadyPaid && data && (
        <>
          {/* Backdrop card shown behind the modal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm w-full bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center gap-3"
          >
            <Loader2 size={28} className="animate-spin text-[#c9a96e]" />
            <p className="font-sans text-sm text-gray-500">Opening your secure payment window…</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 font-sans text-sm font-semibold text-white bg-[#c9a96e] hover:bg-amber-700 transition-colors px-6 py-3 rounded-xl"
            >
              Open Payment Window
            </button>
          </motion.div>

          <PaymentModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            redirectUrl={data.redirect_url}
            bookingId={bookingId}
            tourTitle={data.tour_title}
            amount={data.total_price}
            currency="USD"
          />
        </>
      )}
    </div>
  )
}
