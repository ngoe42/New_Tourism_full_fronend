import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs } from 'swiper/modules'
import {
  ArrowLeft, Star, Clock, Users, MapPin, CheckCircle, XCircle,
  ChevronDown, Share2, Heart, Calendar, Loader2
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toursApi } from '../api/tours'
import BookingForm from '../components/BookingForm'
import TourCard from '../components/TourCard'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

export default function TourDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: tour, isLoading, isError } = useQuery({
    queryKey: ['tour', id],
    queryFn: () => toursApi.getBySlug(id),
    enabled: !!id,
  })

  const { data: relatedData } = useQuery({
    queryKey: ['tours-related', tour?.category],
    queryFn: () => toursApi.list({ category: tour?.category, per_page: 4 }),
    enabled: !!tour?.category,
    select: (d) => d.items.filter((t) => t.id !== tour?.id).slice(0, 3),
  })

  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [activeDay, setActiveDay] = useState(null)
  const [stickyVisible, setStickyVisible] = useState(false)
  const [wishlist, setWishlist] = useState(false)
  const bookingRef = useRef(null)

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  useEffect(() => {
    const handleScroll = () => {
      if (bookingRef.current) {
        const rect = bookingRef.current.getBoundingClientRect()
        setStickyVisible(rect.top < -200)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige">
        <Loader2 size={48} className="animate-spin text-gold" />
      </div>
    )
  }

  if (isError || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige">
        <div className="text-center">
          <div className="text-6xl mb-4">🦁</div>
          <h2 className="font-serif text-3xl text-green-950 mb-4">Tour not found</h2>
          <Link to="/tours" className="btn-outline-dark">Browse All Tours</Link>
        </div>
      </div>
    )
  }

  const coverImage = tour.images?.find((i) => i.is_cover)?.url ?? tour.images?.[0]?.url ?? '/images/hero-bg.jpg'
  const galleryImages = tour.images?.length ? tour.images.map((i) => i.url) : [coverImage]
  const related = relatedData ?? []

  return (
    <main className="min-h-screen bg-beige">
      {/* Sticky Booking Bar */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed top-20 left-0 right-0 z-40 bg-white shadow-md border-b border-gray-100"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img src={coverImage} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-serif text-sm font-semibold text-green-950 truncate">{tour.title}</p>
                  <div className="flex items-center gap-1.5">
                    <Star size={11} className="text-gold fill-gold" />
                    <span className="font-sans text-xs text-gray-500">{tour.rating} · {tour.review_count} reviews</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="font-sans text-xs text-gray-400">From</p>
                  <p className="font-serif text-xl font-semibold text-green-950">${(tour.price ?? 0).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-green-950 text-white font-sans text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gold transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="pt-24 pb-0 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-green-950 transition-colors font-sans text-sm">
            <ArrowLeft size={14} />
            Back
          </button>
          <span className="text-gray-300">/</span>
          <Link to="/tours" className="font-sans text-sm text-gray-500 hover:text-green-950 transition-colors">Tours</Link>
          <span className="text-gray-300">/</span>
          <span className="font-sans text-sm text-green-950 font-medium truncate">{tour.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Title block */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="bg-gold text-white font-sans text-xs font-semibold px-3 py-1.5 rounded-full mb-3 inline-block">
                    {tour.category}
                  </span>
                  <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-semibold text-green-950 leading-tight">{tour.title}</h1>
                </div>
                <div className="flex gap-2 flex-shrink-0 mt-1">
                  <button
                    onClick={() => setWishlist(!wishlist)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${wishlist ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'}`}
                  >
                    <Heart size={16} fill={wishlist ? 'currentColor' : 'none'} />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-green-950 hover:text-green-950 transition-all duration-300">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gold" />
                  <span className="font-sans text-sm text-gray-500">{tour.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-gold fill-gold" />
                  <span className="font-sans text-sm font-semibold text-green-950">{tour.rating}</span>
                  <span className="font-sans text-sm text-gray-400">({tour.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  <span className="font-sans text-sm text-gray-500">{tour.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-gray-400" />
                  <span className="font-sans text-sm text-gray-500">{tour.group_size}</span>
                </div>
              </div>
            </div>

            {/* Mobile price + book strip */}
            <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-4 lg:hidden shadow-sm border border-gray-100">
              <div>
                <p className="font-sans text-xs text-gray-400 uppercase tracking-wider">From</p>
                <p className="font-serif text-2xl font-semibold text-green-950">${(tour.price ?? 0).toLocaleString()}</p>
                <p className="font-sans text-[11px] text-gray-400">per person</p>
              </div>
              <button
                onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-green-950 text-white font-sans text-sm font-medium px-6 py-3 rounded-xl hover:bg-gold transition-colors"
              >
                Book Now
              </button>
            </div>

            {/* Gallery */}
            <div className="space-y-3">
              <Swiper
                modules={[Navigation, Thumbs]}
                navigation
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                className="rounded-3xl overflow-hidden aspect-[16/9] shadow-xl"
              >
                {galleryImages.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img src={img} alt={`${tour.title} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </SwiperSlide>
                ))}
              </Swiper>
              <Swiper
                onSwiper={setThumbsSwiper}
                modules={[Thumbs]}
                slidesPerView={3}
                breakpoints={{ 480: { slidesPerView: 4 }, 768: { slidesPerView: 5 } }}
                spaceBetween={8}
                watchSlidesProgress
                className="!h-20"
              >
                {galleryImages.map((img, i) => (
                  <SwiperSlide key={i}>
                    <div className="rounded-xl overflow-hidden h-full cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-8"
            >
              <h2 className="font-serif text-2xl font-semibold text-green-950 mb-6">Tour Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(tour.highlights ?? []).map((h) => (
                  <div key={h} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-gold flex-shrink-0 mt-0.5" />
                    <span className="font-sans text-sm text-gray-700">{h}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-8"
            >
              <h2 className="font-serif text-2xl font-semibold text-green-950 mb-4">About This Tour</h2>
              <p className="font-sans text-gray-600 leading-relaxed text-base">{tour.description}</p>
            </motion.div>

            {/* Itinerary */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-8"
            >
              <h2 className="font-serif text-2xl font-semibold text-green-950 mb-6">Day-by-Day Itinerary</h2>
              <div className="space-y-3">
                {(tour.itinerary ?? []).map((day) => (
                  <div
                    key={day.day}
                    className="border border-gray-100 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setActiveDay(activeDay === day.day ? null : day.day)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-beige transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-green-950 text-white flex items-center justify-center font-sans text-xs font-semibold flex-shrink-0">
                          {day.day}
                        </span>
                        <span className="font-sans text-sm font-semibold text-green-950">{day.title}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${activeDay === day.day ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeDay === day.day && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="px-6 pb-4 font-sans text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">
                            {day.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Included / Excluded */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-8"
            >
              <h2 className="font-serif text-2xl font-semibold text-green-950 mb-6">What's Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-sans text-sm font-semibold text-green-950 uppercase tracking-wider mb-4">Included</h3>
                  <ul className="space-y-2.5">
                    {(tour.included ?? []).map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                        <span className="font-sans text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Not Included</h3>
                  <ul className="space-y-2.5">
                    {(tour.excluded ?? []).map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <XCircle size={15} className="text-gray-300 flex-shrink-0" />
                        <span className="font-sans text-sm text-gray-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div ref={bookingRef} className="lg:sticky lg:top-28 space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-black/5 border border-gray-100">
                {/* Price header */}
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="font-sans text-xs text-gray-400 uppercase tracking-wider">Starting from</p>
                    <p className="font-serif text-4xl font-semibold text-green-950">${(tour.price ?? 0).toLocaleString()}</p>
                    <p className="font-sans text-xs text-gray-400">per person</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star size={14} className="text-gold fill-gold" />
                      <span className="font-sans text-sm font-semibold text-green-950">{tour.rating}</span>
                    </div>
                    <p className="font-sans text-xs text-gray-400">{tour.review_count} reviews</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-5 bg-green-50 rounded-xl px-3 py-2">
                  <Calendar size={14} className="text-green-700" />
                  <span className="font-sans text-xs text-green-700 font-medium">Free cancellation up to 30 days before</span>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <BookingForm tourId={tour.id} tourTitle={tour.title} tourPrice={tour.price} compact={true} />
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-beige rounded-2xl p-5">
                <div className="space-y-3">
                  {[
                    'Instant confirmation',
                    'No payment required now',
                    'Local Tanzania experts',
                    'Private & small groups only',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <CheckCircle size={14} className="text-gold flex-shrink-0" />
                      <span className="font-sans text-xs text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tours */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="mb-8">
              <span className="section-label block mb-2">You May Also Like</span>
              <h2 className="font-serif text-3xl text-green-950 font-semibold">Similar Experiences</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((t, i) => (
                <TourCard key={t.id} tour={t} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
