import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDown, Play } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { experiencesApi } from '../api/experiences'
import { resolveImageUrl } from '../utils/imageUrl'

const STATIC_IMAGES = [
  { id: 1, image_url: '/images/hero-bg.jpg',                                                          title: 'Tanzania Safari' },
  { id: 2, image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600',          title: 'Kilimanjaro Summit' },
  { id: 3, image_url: 'https://images.unsplash.com/photo-1551244072-5d12893278bc?w=1600',             title: 'Ngorongoro Crater' },
  { id: 4, image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600',          title: 'Serengeti Migration' },
  { id: 5, image_url: 'https://images.unsplash.com/photo-1502920514313-52581002a659?w=1600',          title: 'Balloon Safari' },
  { id: 6, image_url: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1600',          title: 'Zanzibar Escape' },
]

const SLIDE_INTERVAL = 6000

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function Hero() {
  const heroRef = useRef(null)
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  const { data: apiData } = useQuery({
    queryKey: ['experiences'],
    queryFn: experiencesApi.list,
    staleTime: 1000 * 60 * 5,
  })

  const slides = Array.isArray(apiData) && apiData.length > 0 ? apiData : STATIC_IMAGES
  const total = slides.length

  const advance = useCallback(() => setCurrent((c) => (c + 1) % total), [total])

  useEffect(() => {
    timerRef.current = setInterval(advance, SLIDE_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [advance])

  return (
    <section ref={heroRef} className="relative h-screen min-h-[600px] sm:min-h-[700px] overflow-hidden flex items-center">
      {/* Animated background slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <motion.img
            src={resolveImageUrl(slides[current]?.image_url || '/images/hero-bg.jpg')}
            alt={slides[current]?.title || 'Tanzania Safari'}
            className="w-full h-full object-cover will-change-transform"
            loading="eager"
            animate={{ scale: [1.08, 1.02] }}
            transition={{ duration: SLIDE_INTERVAL / 1000 + 1.4, ease: 'linear' }}
          />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#0f3d2e]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Slide dots */}
      <div className="absolute bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); clearInterval(timerRef.current); timerRef.current = setInterval(advance, SLIDE_INTERVAL) }}
            className={`transition-all duration-300 rounded-full ${i === current ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>

      {/* Floating stat badges */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.7 }}
        className="absolute left-8 bottom-32 hidden lg:flex flex-col gap-3"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-white">
          <div className="font-serif text-2xl font-semibold">4.97★</div>
          <div className="font-sans text-xs tracking-wider text-white/70 mt-0.5">Average Rating</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-white">
          <div className="font-serif text-2xl font-semibold">12,000+</div>
          <div className="font-sans text-xs tracking-wider text-white/70 mt-0.5">Happy Travelers</div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-gold" />
            <span className="font-sans text-gold text-sm font-medium tracking-[0.25em] uppercase">
              New · Arusha, Tanzania
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] text-shadow mb-5 sm:mb-6"
          >
            Explore Tanzania
            <br />
            <span className="text-gold italic">Like Never</span>
            <br />
            Before
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-sans text-sm sm:text-base md:text-lg text-white/85 leading-relaxed mb-8 sm:mb-10 max-w-xl text-shadow-sm"
          >
            Crafted by local experts for unforgettable safari experiences. From the Serengeti's endless plains to Kilimanjaro's icy summit.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-4"
          >
            <Link to="/tours" className="btn-primary inline-flex items-center gap-2">
              Explore Tours
              <ArrowDown size={16} />
            </Link>
            <Link to="/contact" className="btn-outline inline-flex items-center gap-2">
              <Play size={14} fill="white" />
              Plan Your Trip
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hidden sm:flex"
      >
        <span className="font-sans text-xs tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 40C1200 80 960 10 720 30C480 50 240 0 0 40L0 80Z" fill="#faf8f3" />
        </svg>
      </div>
    </section>
  )
}
