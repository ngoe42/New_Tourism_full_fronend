import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDown, Play } from 'lucide-react'
import { gsap } from 'gsap'

const HERO_IMAGE = '/images/hero-bg.jpg'

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function Hero() {
  const imgRef = useRef(null)
  const heroRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (imgRef.current) {
        const scrollY = window.scrollY
        imgRef.current.style.transform = `translateY(${scrollY * 0.4}px) scale(1.1)`
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    gsap.fromTo(
      imgRef.current,
      { scale: 1.15 },
      { scale: 1.1, duration: 1.8, ease: 'power2.out' }
    )
  }, [])

  return (
    <section ref={heroRef} className="relative h-screen min-h-[700px] overflow-hidden flex items-center">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imgRef}
          src={HERO_IMAGE}
          alt="Tanzania Safari — wildebeest migration at golden hour"
          className="w-full h-full object-cover will-change-transform"
          loading="eager"
          fetchpriority="high"
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#0f3d2e]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
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
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold text-white leading-[1.05] text-shadow mb-6"
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
            className="font-sans text-lg md:text-xl text-white/85 leading-relaxed mb-10 max-w-xl text-shadow-sm"
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
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60"
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
