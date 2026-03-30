import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import TourCard from './TourCard'
import { tours } from '../data/tours'

export default function FeaturedTours() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const featured = tours.filter((t) => t.featured)

  return (
    <section id="tours" className="py-24 lg:py-32 bg-beige">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div ref={ref} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label block mb-3">Handpicked Experiences</span>
            <h2 className="section-title max-w-xl">
              Our Most Loved
              <br />
              <span className="italic text-gold">Safari Journeys</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="font-sans text-gray-500 max-w-xs leading-relaxed mb-5">
              Each journey is personally curated by our team of Tanzania-born guides with deep local expertise and genuine passion for the wild.
            </p>
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-green-950 hover:text-gold transition-colors duration-300 group"
            >
              View all tours
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        {/* Tour Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {featured.map((tour, index) => (
            <TourCard key={tour.id} tour={tour} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mt-16"
        >
          <Link to="/tours" className="btn-outline-dark inline-flex items-center gap-2">
            Explore All 24 Tours
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
