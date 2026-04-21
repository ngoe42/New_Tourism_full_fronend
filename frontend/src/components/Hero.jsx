import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDown, Play } from 'lucide-react'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { resolveImageUrl } from '../utils/imageUrl'

const SLIDE_DURATION = 7000

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function Hero() {
  const { heroVideoUrl: _rawVideoUrl, heroMode, heroImages: rawHeroImages } = useSiteSettings()
  const heroVideoUrl = resolveImageUrl(_rawVideoUrl)
  const heroImages = (rawHeroImages ?? []).filter(Boolean)

  const [videoFailed, setVideoFailed] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)

  // Reset failure flag whenever the video URL changes (e.g. after new upload)
  useEffect(() => {
    setVideoFailed(false)
  }, [heroVideoUrl])

  const wantVideo  = heroMode === 'video' || heroMode === 'both'
  const wantImages = heroMode === 'images' || heroMode === 'both'

  const shouldUseVideo     = wantVideo && !!heroVideoUrl && !videoFailed
  const shouldUseSlideshow = !shouldUseVideo && wantImages && heroImages.length > 0

  const videoSrc  = heroVideoUrl || '/videos/hero.mp4'

  useEffect(() => {
    if (!shouldUseSlideshow || heroImages.length <= 1) return
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % heroImages.length), SLIDE_DURATION)
    return () => clearInterval(t)
  }, [shouldUseSlideshow, heroImages.length])

  useEffect(() => {
    if (slideIndex >= heroImages.length) setSlideIndex(0)
  }, [slideIndex, heroImages.length])

  const activeSlideSrc = shouldUseSlideshow ? resolveImageUrl(heroImages[slideIndex]) : null

  return (
    <section className="relative h-screen min-h-[600px] sm:min-h-[700px] overflow-hidden flex items-center">
      {/* Video background */}
      <div className="absolute inset-0 overflow-hidden">
        {shouldUseSlideshow ? (
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence mode="sync">
              <motion.img
                key={activeSlideSrc}
                src={activeSlideSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover will-change-transform"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1.15 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 1.4, ease: 'easeInOut' },
                  scale: { duration: 8, ease: 'linear' },
                }}
              />
            </AnimatePresence>
          </div>
        ) : (
          <video
            key={videoSrc}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-bg.jpg"
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{ transform: 'translateZ(0)' }}
            onError={() => setVideoFailed(true)}
          />
        )}
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#0f3d2e]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

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
            <Link to="/tours" className="btn-outline inline-flex items-center gap-2">
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
