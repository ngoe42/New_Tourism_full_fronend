import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, ArrowRight } from 'lucide-react'
import KilimanjaroEnhancedSections from '../components/RouteEnhancedSections'

export default function KilimanjaroOverview() {
  const heroRef = useRef(null)
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-[#faf8f3] min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[70vh] sm:min-h-[80vh] flex flex-col justify-end bg-green-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/sections/parallax-kilimanjaro.jpg"
            alt="Mount Kilimanjaro summit"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-950/40 to-green-950/10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-sans text-xs text-white/50 mb-6">
            <Link to="/" className="hover:text-white/80 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/70">Mount Kilimanjaro</span>
          </div>

          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3"
            >
              Africa's Highest Summit · 5,895m
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4"
            >
              Mount Kilimanjaro
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans text-base sm:text-lg text-white/75 leading-relaxed mb-8 max-w-2xl"
            >
              The world's most accessible high-altitude summit rises from the plains of northern Tanzania in magnificent isolation. Guided by Nelson Tours and Safaris, your journey to Uhuru Peak begins the moment you decide to try.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/routes"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold/90 text-white font-sans font-semibold text-base px-7 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Choose Your Route <ArrowRight size={16} />
              </Link>
              <a
                href="https://wa.me/255750005973"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-sans font-semibold text-base px-7 py-3.5 rounded-full transition-all duration-300"
              >
                Talk to an Expert
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Sticky CTA bar ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -64, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-12 lg:top-14 left-0 right-0 z-[49] flex items-center justify-center gap-3 px-4 py-3 bg-green-950/95 backdrop-blur-md shadow-lg"
          >
            <Link
              to="/routes"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-white font-sans font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-200 shadow hover:shadow-md hover:-translate-y-0.5"
            >
              Choose Your Route <ArrowRight size={14} />
            </Link>
            <a
              href="https://wa.me/255750005973"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/25 hover:bg-white/20 text-white font-sans font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-200"
            >
              Talk to an Expert
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick stats bar ───────────────────────────────────────────────────── */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center sm:justify-start">
            {[
              { label: 'Summit Altitude', val: '5,895m' },
              { label: 'Country', val: 'Tanzania, East Africa' },
              { label: 'Available Routes', val: '6 Routes' },
              { label: 'Typical Duration', val: '7–9 Days' },
              { label: 'Best Season', val: 'Jan–Mar & Jun–Oct' },
            ].map(s => (
              <div key={s.label} className="text-center sm:text-left">
                <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider leading-none">{s.label}</p>
                <p className="font-sans text-sm font-bold text-green-950 leading-tight mt-0.5">{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 10-section enhanced content ──────────────────────────────────────── */}
      <KilimanjaroEnhancedSections />

    </div>
  )
}
