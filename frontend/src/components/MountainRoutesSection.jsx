import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mountain, Clock, ChevronRight, ArrowRight, Loader2 } from 'lucide-react'
import { routesApi } from '../api/routes'
import { resolveImageUrl } from '../utils/imageUrl'
import { useSiteSettings } from '../hooks/useSiteSettings'

const DIFFICULTY_COLORS = {
  Easy:             'bg-green-100 text-green-700',
  Moderate:         'bg-yellow-100 text-yellow-700',
  Challenging:      'bg-orange-100 text-orange-700',
  'Very Challenging':'bg-red-100 text-red-700',
}

export default function MountainRoutesSection({ mountain, title, subtitle, contactPath = '/contact' }) {
  const { showPrices } = useSiteSettings()
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['routes', mountain],
    queryFn: () => routesApi.list(true, mountain),
    staleTime: 5 * 60 * 1000,
  })
  const routes = Array.isArray(raw) ? raw : []

  if (!isLoading && routes.length === 0) return (
    <section className="py-16 sm:py-20 bg-[#faf8f3] border-t border-[#e8e0d0]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">Available Packages</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-green-950 leading-tight mb-4">
            {title || 'Our Routes & Packages'}
          </h2>
          {subtitle && (
            <p className="font-sans text-base text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">{subtitle}</p>
          )}
          <p className="font-sans text-sm text-gray-400 max-w-xl mx-auto mb-8">
            Our packages for this mountain are available on custom quotation. Contact us directly for departure dates, pricing, and personalised itinerary options.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/255750005973"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-950 hover:bg-green-900 text-white font-sans font-semibold text-sm px-7 py-3 rounded-full transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5"
            >
              WhatsApp for Packages <ArrowRight size={14} />
            </a>
            <a
              href={`${contactPath}?interest=${encodeURIComponent(mountain)}`}
              className="inline-flex items-center gap-2 border border-green-950/20 text-green-950 hover:bg-green-950 hover:text-white font-sans font-semibold text-sm px-7 py-3 rounded-full transition-all duration-200"
            >
              Request Custom Quote
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )

  return (
    <section className="py-16 sm:py-20 bg-[#faf8f3] border-t border-[#e8e0d0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-10"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-2">
            Available Packages
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-green-950 leading-tight mb-3">
            {title || 'Our Routes & Packages'}
          </h2>
          {subtitle && (
            <p className="font-sans text-base text-gray-500 max-w-2xl leading-relaxed">{subtitle}</p>
          )}
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-gold" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route, idx) => {
              const cover = route.images?.find(i => i.is_cover) ?? route.images?.[0]
              const diffColor = DIFFICULTY_COLORS[route.difficulty] ?? 'bg-gray-100 text-gray-600'
              return (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: idx * 0.08, duration: 0.5 }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-300"
                >
                  {/* Cover image */}
                  <div className="relative h-44 bg-green-950 overflow-hidden flex-shrink-0">
                    {cover ? (
                      <img
                        src={resolveImageUrl(cover.url)}
                        alt={route.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Mountain size={48} className="text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-green-950/60 to-transparent" />
                    {route.difficulty && (
                      <span className={`absolute top-3 right-3 font-sans text-xs font-semibold px-2.5 py-1 rounded-full ${diffColor}`}>
                        {route.difficulty}
                      </span>
                    )}
                    {route.success_rate && (
                      <span className="absolute bottom-3 left-3 font-sans text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        {route.success_rate} success rate
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-3">
                      <h3 className="font-serif text-xl font-bold text-green-950 leading-tight group-hover:text-green-700 transition-colors">
                        {route.name}
                      </h3>
                      {route.nickname && (
                        <p className="font-sans text-xs text-gold font-medium italic mt-0.5">"{route.nickname}"</p>
                      )}
                    </div>

                    <p className="font-sans text-sm text-gray-500 leading-relaxed mb-5 flex-1 line-clamp-3">
                      {route.short_description}
                    </p>

                    {/* Stats row */}
                    <div className="flex gap-4 pb-4 mb-4 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="font-sans text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Duration</p>
                        <p className="font-sans text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                          <Clock size={13} className="text-gold" /> {route.duration}
                        </p>
                      </div>
                      {route.max_altitude && (
                        <div className="flex-1">
                          <p className="font-sans text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Altitude</p>
                          <p className="font-sans text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                            <Mountain size={13} className="text-gold" /> {route.max_altitude}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto">
                      {showPrices && route.price > 0 ? (
                        <div>
                          <p className="font-sans text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">From</p>
                          <p className="font-serif text-lg font-bold text-green-950">${Number(route.price).toLocaleString()}</p>
                        </div>
                      ) : (
                        <Link
                          to={`${contactPath}?interest=${encodeURIComponent(route.name)}`}
                          className="font-sans text-xs font-semibold text-gold hover:underline"
                        >
                          Request a Quote
                        </Link>
                      )}
                      <Link
                        to={`/routes/${route.slug}`}
                        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-green-950 bg-green-950/5 hover:bg-gold hover:text-white px-4 py-2 rounded-full transition-all duration-200"
                      >
                        View Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {!isLoading && routes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center mt-10"
          >
            <a
              href="https://wa.me/255750005973"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-950 hover:bg-green-900 text-white font-sans font-semibold text-sm px-7 py-3 rounded-full transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5"
            >
              Book a Package <ArrowRight size={14} />
            </a>
            <Link
              to={`${contactPath}?interest=${encodeURIComponent(mountain)}`}
              className="inline-flex items-center gap-2 border border-green-950/20 text-green-950 hover:bg-green-950 hover:text-white font-sans font-semibold text-sm px-7 py-3 rounded-full transition-all duration-200"
            >
              Request Custom Quote
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
