import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { experiencesApi } from '../api/experiences'
import { resolveImageUrl } from '../utils/imageUrl'

const STATIC_EXPERIENCES = [
  {
    id: 1,
    title: 'Kilimanjaro Summit Trek',
    subtitle: 'Stand on the Roof of Africa at 5,895 m',
    description: 'Conquer Africa\'s highest peak and witness the world from above the clouds.',
    image_url: 'https://images.unsplash.com/photo-1621414050946-6c43c85e-a9c?w=1600',
  },
  {
    id: 2,
    title: 'Ngorongoro Crater',
    subtitle: 'Descend into a world unlike any other',
    description: 'The world\'s largest intact volcanic caldera, home to 25,000 wild animals.',
    image_url: 'https://images.unsplash.com/photo-1551244072-5d12893278bc?w=1600',
  },
  {
    id: 3,
    title: 'Serengeti Migration',
    subtitle: 'Witness the greatest wildlife spectacle on Earth',
    description: 'Over 1.5 million wildebeest thunder across endless golden plains.',
    image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600',
  },
  {
    id: 4,
    title: 'Hot-Air Balloon Safari',
    subtitle: 'Float silently over the savannah at dawn',
    description: 'An unforgettable sunrise perspective of the Serengeti from above.',
    image_url: 'https://images.unsplash.com/photo-1502920514313-52581002a659?w=1600',
  },
  {
    id: 5,
    title: 'Walking Safari',
    subtitle: 'Connect with the wild on foot',
    description: 'Track the Big Five on guided bush walks with expert FGASA rangers.',
    image_url: 'https://images.unsplash.com/photo-1568017388877-13bff411e1b5?w=1600',
  },
  {
    id: 6,
    title: 'Zanzibar Beach Escape',
    subtitle: 'Turquoise waters and white-sand serenity',
    description: 'Unwind on pristine Indian Ocean beaches after your safari adventure.',
    image_url: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1600',
  },
]

const INTERVAL = 5000

export default function ExperiencesSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  const { data: apiData } = useQuery({
    queryKey: ['experiences'],
    queryFn: () => experiencesApi.list(),
    staleTime: 1000 * 60 * 5,
  })

  const slides = (Array.isArray(apiData) && apiData.length > 0) ? apiData : STATIC_EXPERIENCES
  const total = slides.length

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total])

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    if (!paused) {
      timerRef.current = setInterval(next, INTERVAL)
    }
  }, [next, paused])

  useEffect(() => {
    resetTimer()
    return () => clearInterval(timerRef.current)
  }, [resetTimer])

  const handlePrev = () => { prev(); resetTimer() }
  const handleNext = () => { next(); resetTimer() }
  const goTo = (i) => { setCurrent(i); resetTimer() }

  const slide = slides[current]

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[85vh] min-h-[480px] sm:min-h-[560px] overflow-hidden bg-green-950">
      {/* Ken Burns slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0"
        >
          <motion.img
            src={resolveImageUrl(slide.image_url)}
            alt={slide.title}
            className="w-full h-full object-cover"
            animate={{ scale: [1.0, 1.06] }}
            transition={{ duration: INTERVAL / 1000 + 1.2, ease: 'linear' }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/5" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-20 sm:pb-24 px-6 sm:px-16 lg:px-24 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${current}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          >
            <span className="inline-block font-sans text-xs font-semibold tracking-[0.25em] uppercase text-amber-400 mb-3">
              Experience {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3 drop-shadow-xl">
              {slide.title}
            </h2>
            <p className="font-sans text-lg sm:text-xl text-amber-300 font-medium mb-4">
              {slide.subtitle}
            </p>
            {slide.description && (
              <p className="font-sans text-sm sm:text-base text-white/75 max-w-xl leading-relaxed">
                {slide.description}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-6 sm:px-16 lg:px-24 pb-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/25 cursor-pointer"
          >
            {i === current && !paused ? (
              <motion.div
                className="h-full bg-amber-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
              />
            ) : (
              <div className={`h-full rounded-full ${i < current ? 'bg-white/70' : ''}`} />
            )}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 right-6 sm:right-16 lg:right-24 flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setPaused((p) => !p)}
          className="w-9 h-9 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button
          onClick={handlePrev}
          className="w-9 h-9 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={handleNext}
          className="w-9 h-9 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Section label */}
      <div className="absolute top-8 left-6 sm:left-16 lg:left-24">
        <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-white/50">
          Tanzania Experiences
        </span>
      </div>
    </section>
  )
}
