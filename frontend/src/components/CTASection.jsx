import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/cta-bg.jpg"
          alt="Safari sunset Tanzania"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f3d2e]/80 via-[#0f3d2e]/70 to-[#0f3d2e]/85" />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full border border-white/5 hidden lg:block" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full border border-white/5 hidden lg:block" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 hidden lg:block" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
        >
          <span className="text-gold font-sans text-sm font-medium tracking-[0.25em] uppercase block mb-4">
            Begin Your Journey
          </span>

          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white font-semibold leading-tight text-shadow mb-6">
            Your Dream Safari
            <br />
            <span className="text-gold italic">Awaits You</span>
          </h2>

          <p className="font-sans text-white/75 text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            Let our experts craft the perfect Tanzania itinerary tailored to your travel style, budget, and bucket-list moments. No obligation, just inspiration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tours" className="btn-primary inline-flex items-center justify-center gap-2">
              Browse All Tours
              <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-outline inline-flex items-center justify-center gap-2">
              <Phone size={15} />
              Talk to an Expert
            </Link>
          </div>

          <p className="font-sans text-white/40 text-sm mt-8">
            Free consultation · No booking fees · Tailor-made itineraries
          </p>
        </motion.div>
      </div>
    </section>
  )
}
