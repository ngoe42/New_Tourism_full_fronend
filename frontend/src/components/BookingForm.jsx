import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Mail, Phone, MessageSquare, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { bookingsApi } from '../api/bookings'
import { inquiriesApi } from '../api/inquiries'
import { useAuth } from '../context/AuthContext'
import { useSiteSettings } from '../hooks/useSiteSettings'

export default function BookingForm({ tourId = null, routeId = null, tourTitle = '', tourPrice = 0, compact = false }) {
  const { user } = useAuth()
  const { showPrices } = useSiteSettings()
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    date: '',
    guests: '2',
    message: '',
  })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const [paymentUrl, setPaymentUrl] = useState(null)
  const [bookingRef, setBookingRef] = useState(null)
  const submitting = useRef(false)

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [user])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setStatus('loading')
    setErrorMsg('')
    try {
      if (tourId) {
        const booking = await bookingsApi.create({
          tour_id: tourId,
          travel_date: form.date,
          guests: parseInt(form.guests),
          special_requests: form.message || undefined,
          contact_name: form.name,
          contact_email: form.email,
          contact_phone: form.phone || undefined,
        })

        setBookingRef(booking.id)
        sessionStorage.setItem('lastBookingId', booking.id)
        sessionStorage.setItem('lastBookingEmail', form.email)
        setPaymentUrl(booking.payment_redirect_url || null)
        setStatus('success')
      } else {
        const inquiryPayload = {
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          message: form.message || `Booking inquiry for ${tourTitle || 'a route'}.`,
          tour_interest: tourTitle || undefined,
        }
        if (routeId) {
          inquiryPayload.route_id = routeId
          inquiryPayload.travel_date = form.date || undefined
          inquiryPayload.guests = parseInt(form.guests)
        }
        await inquiriesApi.create(inquiryPayload)
        setStatus('success')
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg(
        err?.response?.data?.detail ?? 'Something went wrong. Please try again or contact us directly.'
      )
    } finally {
      submitting.current = false
    }
  }

  const total = tourPrice > 0 ? tourPrice * parseInt(form.guests || '1') : null

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${compact ? '' : 'bg-white rounded-3xl p-8'} flex flex-col items-center text-center py-8`}
      >
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-green-950 mb-2">
          {bookingRef ? 'Booking Request Sent Successfully!' : 'Request Received!'}
        </h3>
        <p className="font-sans text-gray-500 text-sm leading-relaxed max-w-xs mb-1">
          {bookingRef
            ? `A confirmation email has been sent to ${form.email} with your booking details and payment link.`
            : 'Our safari specialists will contact you within 24 hours to finalize your dream journey.'}
        </p>
        {bookingRef && (
          <p className="font-sans text-xs text-gray-400 mb-5">Booking Reference: #{bookingRef}</p>
        )}
        {bookingRef && (
          <button
            onClick={() => navigate(`/payment/resume?id=${bookingRef}`)}
            className="mt-3 mb-2 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-white font-sans text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors shadow-md"
          >
            Complete Payment Now
          </button>
        )}
        {bookingRef && (
          <p className="font-sans text-[11px] text-gray-400 mb-2">Visa · Mastercard · M-Pesa · Airtel Money · Secured by Pesapal</p>
        )}
        {bookingRef && (
          <button
            onClick={() => navigate(`/booking/${bookingRef}`)}
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 text-gray-600 hover:border-green-900 hover:text-green-900 font-sans text-sm font-medium rounded-xl transition-colors"
          >
            View My Booking
          </button>
        )}
        <button
          onClick={() => { setStatus('idle'); setPaymentUrl(null); setBookingRef(null) }}
          className="mt-4 text-sm font-sans text-[#c9a96e] hover:underline transition-colors"
        >
          Submit another request
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {tourTitle && (
        <div className="bg-beige rounded-2xl px-4 py-3 mb-2">
          <p className="font-sans text-xs text-gray-500 mb-0.5">Booking for</p>
          <p className="font-serif text-base font-semibold text-green-950">{tourTitle}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block font-sans text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Full Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Your full name"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors bg-white placeholder-gray-300"
        />
      </div>

      {/* Email + Phone */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div>
          <label className="block font-sans text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors bg-white placeholder-gray-300"
            />
          </div>
        </div>
        <div>
          <label className="block font-sans text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Phone</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 234 567 890"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors bg-white placeholder-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Date + Guests */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-sans text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Preferred Date</label>
          <div className="relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors bg-white"
            />
          </div>
        </div>
        <div>
          <label className="block font-sans text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Guests</label>
          <div className="relative">
            <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <select
              name="guests"
              value={form.guests}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors bg-white appearance-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block font-sans text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Special Requests</label>
        <div className="relative">
          <MessageSquare size={15} className="absolute left-3.5 top-3.5 text-gray-300" />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={compact ? 2 : 3}
            placeholder="Dietary requirements, photography interests, accessibility needs..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none bg-white placeholder-gray-300"
          />
        </div>
      </div>

      {/* Price estimate */}
      {showPrices && total && (
        <div className="bg-beige rounded-2xl px-4 py-3 flex justify-between items-center">
          <span className="font-sans text-xs text-gray-500">Estimated Total ({form.guests} guests)</span>
          <span className="font-serif text-lg font-semibold text-green-950">${total.toLocaleString()}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || status === 'redirecting'}
        className="w-full bg-green-950 text-white font-sans font-medium py-4 rounded-xl hover:bg-gold transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed tracking-wide text-sm uppercase"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </>
        ) : (
          tourId ? 'Book & Proceed to Payment' : 'Send Booking Request'
        )}
      </button>

      {status === 'error' && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="font-sans text-xs text-red-600">{errorMsg}</p>
        </div>
      )}

      <p className="font-sans text-[11px] text-gray-400 text-center leading-relaxed">
        No payment required now · Free cancellation within 48 hours · Response within 24 hours
      </p>
    </form>
  )
}
