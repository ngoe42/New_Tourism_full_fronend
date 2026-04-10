import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight, Compass } from 'lucide-react'
import { experiencesApi } from '../api/experiences'
import ExperiencesSlider from '../components/ExperiencesSlider'

export default function Experiences() {
  const { data, isLoading } = useQuery({
    queryKey: ['experiences-public'],
    queryFn: () => experiencesApi.list(),
  })

  const experiences = Array.isArray(data) ? data : (data?.value ?? [])

  return (
    <div className="bg-[#faf8f3] min-h-screen">

      {/* ── Hero Slider ───────────────────────────────────────────────────── */}
      <ExperiencesSlider />

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 size={36} className="animate-spin text-green-800" />
            </div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-24">
              <Compass size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="font-sans text-gray-400">Experiences coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={exp.image_url}
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="font-sans text-[10px] font-bold text-white/80 uppercase tracking-widest bg-black/30 backdrop-blur px-2.5 py-1 rounded-full">
                        Experience
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-green-950 mb-1 group-hover:text-green-700 transition-colors">
                      {exp.title}
                    </h3>
                    {exp.subtitle && (
                      <p className="font-sans text-xs font-semibold text-[#c9a96e] mb-3 italic">
                        {exp.subtitle}
                      </p>
                    )}
                    {exp.description && (
                      <p className="font-sans text-sm text-gray-500 leading-relaxed line-clamp-3">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-green-950 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Ready to Experience Tanzania?
          </h2>
          <p className="font-sans text-white/60 mb-8 leading-relaxed">
            Let us craft your perfect African adventure. Our expert team is ready to plan every detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 bg-[#c9a96e] text-white font-sans font-semibold text-sm px-7 py-3 rounded-full hover:bg-[#b8935a] transition-colors shadow-lg"
            >
              Browse Safaris <ArrowRight size={15} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-sans font-semibold text-sm px-7 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
