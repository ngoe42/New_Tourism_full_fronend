import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css/effect-fade'
import {
  ArrowLeft, Star, Clock, Users, MapPin, CheckCircle, XCircle,
  ChevronDown, Share2, Heart, Calendar, Loader2, MessageCircle
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toursApi } from '../api/tours'
import { useSiteSettings } from '../hooks/useSiteSettings'
import BookingForm from '../components/BookingForm'
import TourCard from '../components/TourCard'
import 'swiper/css'

export default function TourDetail() {
  const { id } = useParams()
  const { showPrices } = useSiteSettings()
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
                {showPrices && (
                  <div className="text-right hidden sm:block">
                    <p className="font-sans text-xs text-gray-400">From</p>
                    <p className="font-serif text-xl font-semibold text-green-950">${(tour.price ?? 0).toLocaleString()}</p>
                  </div>
                )}
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

      {/* ── Hero Image ───────────────────────────────────────────── */}
      <section className="relative min-h-[60vh] sm:min-h-[75vh] flex flex-col justify-end bg-green-950 overflow-hidden">
        {/* Autoplay slideshow background */}
        <div className="absolute inset-0">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            loop={galleryImages.length > 1}
            className="w-full h-full"
          >
            {galleryImages.map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img} alt={`${tour.title} ${i + 1}`} className="w-full h-full object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-950/55 to-green-950/20" />
        </div>

        {/* Content — left aligned, bottom anchored */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-14">
          <div className="max-w-3xl">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight"
            >
              {tour.title}
            </motion.h1>

            {/* Location */}
            {tour.location && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-sans text-base text-white/70 flex items-center gap-1.5 mb-4"
              >
                <MapPin size={14} className="text-gold flex-shrink-0" /> {tour.location}
              </motion.p>
            )}

            {/* Short description if available */}
            {tour.short_description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="font-sans text-sm text-white/65 leading-relaxed mb-6 max-w-2xl"
              >
                {tour.short_description}
              </motion.p>
            )}

            {/* Stat chips */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap gap-3"
            >
              {tour.rating > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2.5 rounded-xl border border-white/10">
                  <Star size={14} className="text-gold fill-gold flex-shrink-0" />
                  <div>
                    <p className="font-sans text-[10px] text-white/50 uppercase tracking-wider leading-none">Rating</p>
                    <p className="font-sans text-sm font-semibold text-white leading-tight">{tour.rating} · {tour.review_count} reviews</p>
                  </div>
                </div>
              )}
              {tour.duration && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2.5 rounded-xl border border-white/10">
                  <Clock size={14} className="text-gold flex-shrink-0" />
                  <div>
                    <p className="font-sans text-[10px] text-white/50 uppercase tracking-wider leading-none">Duration</p>
                    <p className="font-sans text-sm font-semibold text-white leading-tight">{tour.duration}</p>
                  </div>
                </div>
              )}
              {tour.group_size && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2.5 rounded-xl border border-white/10">
                  <Users size={14} className="text-gold flex-shrink-0" />
                  <div>
                    <p className="font-sans text-[10px] text-white/50 uppercase tracking-wider leading-none">Group Size</p>
                    <p className="font-sans text-sm font-semibold text-white leading-tight">{tour.group_size}</p>
                  </div>
                </div>
              )}
              {tour.difficulty && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2.5 rounded-xl border border-white/10">
                  <div>
                    <p className="font-sans text-[10px] text-white/50 uppercase tracking-wider leading-none">Difficulty</p>
                    <p className="font-sans text-sm font-semibold text-white leading-tight">{tour.difficulty}</p>
                  </div>
                </div>
              )}
              {tour.best_season && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2.5 rounded-xl border border-white/10">
                  <Calendar size={14} className="text-gold flex-shrink-0" />
                  <div>
                    <p className="font-sans text-[10px] text-white/50 uppercase tracking-wider leading-none">Best Season</p>
                    <p className="font-sans text-sm font-semibold text-white leading-tight">{tour.best_season}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Wish / Share — top right */}
        <div className="absolute top-24 right-6 lg:right-12 flex gap-2 z-20">
          <button
            onClick={() => setWishlist(!wishlist)}
            className={`w-9 h-9 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all duration-300 ${wishlist ? 'bg-red-500/80 border-red-400 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
          >
            <Heart size={15} fill={wishlist ? 'currentColor' : 'none'} />
          </button>
          <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Share2 size={15} />
          </button>
        </div>
      </section>

      {/* ── Price Action Bar ─────────────────────────────────────────── */}
      <div className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Price */}
          <div>
            {showPrices ? (
              <>
                <p className="font-sans text-xs text-gray-400">Price from</p>
                <p className="font-serif text-2xl font-bold text-green-950">${(tour.price ?? 0).toLocaleString()}</p>
              </>
            ) : (
              <p className="font-serif text-lg font-semibold text-green-950">Request a Quote</p>
            )}
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className={i < Math.round(tour.rating) ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="font-sans text-xs text-gray-400">{tour.review_count} reviews</span>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/255750005973"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-green-600 text-green-700 font-sans text-sm font-semibold rounded-xl hover:bg-green-50 transition-colors"
            >
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
            <button
              onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-sans text-sm font-semibold rounded-xl transition-colors"
            >
              Help Me Plan My Trip
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl p-8"
            >
              <h2 className="font-serif text-2xl font-semibold text-green-950 mb-6">{tour.title} Highlights</h2>
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
              <h2 className="font-serif text-2xl font-semibold text-green-950 mb-4">About {tour.title}</h2>
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
              <h2 className="font-serif text-2xl font-semibold text-green-950 mb-6">{tour.title} — Day-by-Day Itinerary</h2>
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
              <h2 className="font-serif text-2xl font-semibold text-green-950 mb-6">What's Included in {tour.title}</h2>
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
                    {showPrices ? (
                      <>
                        <p className="font-sans text-xs text-gray-400 uppercase tracking-wider">Starting from</p>
                        <p className="font-serif text-4xl font-semibold text-green-950">${(tour.price ?? 0).toLocaleString()}</p>
                        <p className="font-sans text-xs text-gray-400">per person</p>
                      </>
                    ) : (
                      <p className="font-serif text-xl font-semibold text-green-950">Request a Quote</p>
                    )}
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
