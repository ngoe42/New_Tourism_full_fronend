import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import { Star, Quote } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { testimonialsApi } from '../api/testimonials'
import { testimonials as staticTestimonials } from '../data/tours'
import 'swiper/css'
import 'swiper/css/pagination'

export default function Testimonials() {
  const { data } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => testimonialsApi.list({ per_page: 12 }),
  })

  const items = Array.isArray(data?.items) && data.items.length > 0
    ? data.items.map((t) => ({
        id: t.id,
        rating: t.rating,
        text: t.message,
        tour: t.tour_id ? `Tour #${t.tour_id}` : 'Safari Experience',
        avatar: t.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=1a3a2a&color=c9a96e`,
        name: t.name,
        location: t.location ?? '',
      }))
    : staticTestimonials

  return (
    <section className="py-14 sm:py-24 lg:py-32 bg-green-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-gold font-sans text-sm font-medium tracking-[0.2em] uppercase block mb-3"
          >
            Traveler Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="section-title-white max-w-2xl mx-auto"
          >
            What Our Guests Say
          </motion.h2>
        </div>

        {/* Swiper */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={24}
            loop={items.length > 2}
            autoplay={{ delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
            className="!pb-12"
          >
            {items.map((t) => (
              <SwiperSlide key={t.id}>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 h-full flex flex-col hover:bg-white/10 transition-colors duration-400">
                  <Quote size={32} className="text-gold mb-6 flex-shrink-0" fill="#c9a96e" fillOpacity={0.3} />

                  <div className="flex gap-1 mb-5">
                    {[...Array(Math.min(t.rating, 5))].map((_, i) => (
                      <Star key={i} size={14} className="text-gold fill-gold" />
                    ))}
                  </div>

                  <p className="font-sans text-white/80 leading-relaxed text-sm flex-1 mb-8 italic">
                    "{t.text}"
                  </p>

                  <div className="mb-5">
                    <span className="bg-gold/20 text-gold font-sans text-xs px-3 py-1.5 rounded-full">
                      {t.tour}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/30"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-sans text-sm font-semibold text-white">{t.name}</p>
                      <p className="font-sans text-xs text-white/50">{t.location}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Trust numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-12 mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-white/10"
        >
          {[
            { val: '4.97/5', label: 'Average Rating on TripAdvisor' },
            { val: '214', label: 'Verified 5-star Reviews' },
            { val: '98%', label: 'Would Recommend Us' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="font-serif text-4xl font-semibold text-gold mb-1">{item.val}</div>
              <div className="font-sans text-xs text-white/50 tracking-wide">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
