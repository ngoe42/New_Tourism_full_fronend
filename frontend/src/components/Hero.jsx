import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDown, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSiteSettings } from '../hooks/useSiteSettings'
import apiClient from '../api/client'
import { resolveImageUrl } from '../utils/imageUrl'

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function Hero() {
  const { heroVideoUrl } = useSiteSettings()
  const [videoFailed, setVideoFailed] = useState(false)
  const hasUploadedVideo = !!heroVideoUrl
  const shouldUseVideo = hasUploadedVideo && !videoFailed

  const { data: heroImagesData = [] } = useQuery({
    queryKey: ['hero-images'],
    queryFn: () => apiClient.get('/media/hero-images', { params: { limit: 40 } }).then((r) => r.data),
    enabled: !shouldUseVideo,
    staleTime: 1000 * 60,
    retry: 1,
  })

  const heroImages = useMemo(
    () => (Array.isArray(heroImagesData) ? heroImagesData.filter(Boolean) : []),
    [heroImagesData]
  )

  const shouldUseSlideshow = !shouldUseVideo && heroImages.length > 0
  const videoSrc = shouldUseVideo ? heroVideoUrl : '/videos/hero.mp4'
  const ext = (videoSrc.split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase()
  const videoType = ext === 'webm' ? 'video/webm' : ext === 'mov' ? 'video/quicktime' : 'video/mp4'

  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    if (!shouldUseSlideshow) return
    if (heroImages.length <= 1) return
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % heroImages.length)
    }, 7000)
    return () => clearInterval(t)
  }, [shouldUseSlideshow, heroImages.length])

  useEffect(() => {
    if (slideIndex >= heroImages.length) setSlideIndex(0)
  }, [slideIndex, heroImages.length])

  const nextSlide = useCallback(() => {
    if (!heroImages.length) return
    setSlideIndex((i) => (i + 1) % heroImages.length)
  }, [heroImages.length])

  const prevSlide = useCallback(() => {
    if (!heroImages.length) return
    setSlideIndex((i) => (i - 1 + heroImages.length) % heroImages.length)
  }, [heroImages.length])

  const activeSlideSrc = shouldUseSlideshow ? resolveImageUrl(heroImages[slideIndex]) : null

  return (
    <section className="relative h-screen min-h-[600px] sm:min-h-[700px] overflow-hidden flex items-center">
      {/* Video background */}
      <div className="absolute inset-0">
        {shouldUseSlideshow ? (
          <div className="absolute inset-0">
            <AnimatePresence mode="sync">
              <motion.img
                key={activeSlideSrc}
                src={activeSlideSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: [1.02, 1.08] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeInOut' }}
              />
            </AnimatePresence>

            {heroImages.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 flex items-center px-3 z-20">
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 z-20">
                  <button
                    type="button"
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {heroImages.slice(0, 10).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlideIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${i === slideIndex ? 'w-6 bg-white/90' : 'w-2.5 bg-white/40 hover:bg-white/60'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <video
            key={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-bg.jpg"
            className="w-full h-full object-cover"
            onError={() => setVideoFailed(true)}
          >
            <source src={videoSrc} type={videoType} />
          </video>
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
