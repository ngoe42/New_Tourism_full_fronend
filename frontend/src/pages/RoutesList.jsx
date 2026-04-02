import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mountain, Clock, ChevronRight } from 'lucide-react'
import { routesApi } from '../api/routes'

export default function RoutesList() {
  const { data: rawRoutes, isLoading, error } = useQuery({
    queryKey: ['routes'],
    queryFn: () => routesApi.list(),
  })
  const routes = Array.isArray(rawRoutes) ? rawRoutes : []

  return (
    <div className="bg-beige min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-green-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Mount Kilimanjaro Routes
            </h1>
            <p className="font-sans text-lg text-white/80 max-w-2xl mx-auto">
              Compare and choose the perfect path to the roof of Africa. Each route offers a unique experience, scenery, and acclimatization profile.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">Failed to load routes. Please try again later.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {routes.map((route, idx) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-green-950 mb-1 group-hover:text-green-700 transition-colors">
                          {route.name}
                        </h3>
                        {route.nickname && (
                          <p className="font-sans text-xs text-gold font-medium italic">"{route.nickname}"</p>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <Mountain size={20} className="text-green-700" />
                      </div>
                    </div>

                    <p className="font-sans text-gray-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-4">
                      {route.short_description}
                    </p>

                    <div className="flex gap-4 mb-8 pt-6 border-t border-gray-100">
                      <div className="flex-1">
                        <p className="font-sans text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Duration</p>
                        <p className="font-sans text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                          <Clock size={14} className="text-gold" /> {route.duration}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-sans text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Difficulty</p>
                        <p className="font-sans text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                          <Mountain size={14} className="text-gold" /> {route.difficulty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="font-sans text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Starting From</p>
                        <p className="font-serif text-xl font-bold text-green-950">${route.price.toLocaleString()}</p>
                      </div>
                      <Link
                        to={`/routes/${route.slug}`}
                        className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300"
                      >
                        <ChevronRight size={20} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
