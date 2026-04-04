import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Mountain, TrendingUp, Users, Calendar, MapPin, CheckCircle,
  XCircle, Backpack, ChevronRight, ArrowLeft, ShieldCheck, Info,
  DollarSign, Loader2, Star
} from 'lucide-react'
import { routesApi } from '../api/routes'
import { useSiteSettings } from '../hooks/useSiteSettings'
import BookingForm from '../components/BookingForm'

const TABS = ['Overview', 'Itinerary', "What's Included", 'Packing List']

const difficultyColor = {
  Easy: 'bg-green-100 text-green-700',
  Moderate: 'bg-yellow-100 text-yellow-700',
  Challenging: 'bg-orange-100 text-orange-700',
  'Very Challenging': 'bg-red-100 text-red-700',
}

export default function RouteDetail() {
  const { slug } = useParams()
  const { showPrices } = useSiteSettings()
  const [activeTab, setActiveTab] = useState('Overview')
  const { data: route, isLoading, error } = useQuery({
    queryKey: ['route', slug],
    queryFn: () => routesApi.getBySlug(slug),
  })

  const images = route?.images ?? []
  const coverImg = images.find((i) => i.is_cover) ?? images[0]

  if (isLoading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-gold" />
      </div>
    )
  }

  if (error || !route) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center gap-4">
        <Mountain size={48} className="text-gray-300" />
        <h2 className="font-serif text-3xl font-bold text-green-950">Route Not Found</h2>
        <p className="font-sans text-gray-500">The Kilimanjaro route you're looking for doesn't exist.</p>
        <Link to="/routes" className="mt-4 bg-green-950 text-white px-6 py-3 rounded-full font-sans font-medium hover:bg-green-800 transition-colors">
          View All Routes
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#faf8f3] min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[60vh] sm:min-h-[75vh] flex flex-col justify-end bg-green-950 overflow-hidden">
        {/* Full background image */}
        {coverImg ? (
          <div className="absolute inset-0">
            <img src={coverImg.url} alt={route.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-950/60 to-green-950/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a5c42_0%,_#0f3d2e_70%)]" />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-sans text-xs text-white/50 mb-6">
            <Link to="/" className="hover:text-white/80 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/routes" className="hover:text-white/80 transition-colors">Kilimanjaro Routes</Link>
            <ChevronRight size={12} />
            <span className="text-white/70">{route.name}</span>
          </div>

          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3"
            >
              {route.name}
            </motion.h1>
            {route.nickname && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-serif text-xl text-[#c9a96e] italic mb-4"
              >
                "{route.nickname}"
              </motion.p>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans text-base text-white/75 leading-relaxed mb-8 max-w-2xl"
            >
              {route.short_description}
            </motion.p>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: Clock, label: 'Duration', value: route.duration },
                { icon: TrendingUp, label: 'Difficulty', value: route.difficulty },
                { icon: Mountain, label: 'Max Altitude', value: route.max_altitude },
                { icon: Star, label: 'Success Rate', value: route.success_rate },
                { icon: Users, label: 'Group Size', value: route.group_size },
                { icon: Calendar, label: 'Best Season', value: route.best_season },
              ].filter((s) => s.value).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2.5 rounded-xl border border-white/10">
                  <Icon size={14} className="text-[#c9a96e] flex-shrink-0" />
                  <div>
                    <p className="font-sans text-[10px] text-white/50 uppercase tracking-wider leading-none">{label}</p>
                    <p className="font-sans text-sm font-semibold text-white leading-tight">{value}</p>
                  </div>
                </div>
              ))}
              {showPrices && route.price > 0 && (
                <div className="flex items-center gap-2 bg-[#c9a96e]/20 px-4 py-2.5 rounded-xl border border-[#c9a96e]/30">
                  <DollarSign size={14} className="text-[#c9a96e]" />
                  <div>
                    <p className="font-sans text-[10px] text-white/50 uppercase tracking-wider leading-none">From</p>
                    <p className="font-sans text-sm font-bold text-[#c9a96e] leading-tight">${route.price.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Tabs + Content ────────────────────────────────────────────────── */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left: tabbed content */}
            <div className="lg:col-span-2">

              {/* Tab bar */}
              <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-8 overflow-x-auto scrollbar-none" style={{scrollbarWidth:'none'}}>
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 min-w-max px-4 py-2 rounded-xl font-sans text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-green-950 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >

                  {/* ── OVERVIEW ─────────────────────────────────────────── */}
                  {activeTab === 'Overview' && (
                    <div className="space-y-8">
                      {/* Full description */}
                      {route.full_description && (
                        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                          <h3 className="font-serif text-xl font-bold text-green-950 mb-4">About This Route</h3>
                          <div className="space-y-3">
                            {route.full_description.split('\n').filter(Boolean).map((p, i) => (
                              <p key={i} className="font-sans text-gray-600 leading-relaxed">{p}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Nickname explanation */}
                      {route.nickname_explanation && (
                        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-6 flex gap-4">
                          <Info size={18} className="text-[#c9a96e] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-sans text-sm font-bold text-green-900 mb-1">Why the nickname "{route.nickname}"?</p>
                            <p className="font-sans text-sm text-gray-600 leading-relaxed">{route.nickname_explanation}</p>
                          </div>
                        </div>
                      )}

                      {/* Highlights */}
                      {route.highlights?.length > 0 && (
                        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                          <h3 className="font-serif text-xl font-bold text-green-950 mb-5">Route Highlights</h3>
                          <ul className="grid sm:grid-cols-2 gap-3">
                            {route.highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <Star size={16} className="text-[#c9a96e] flex-shrink-0 mt-0.5" />
                                <span className="font-sans text-sm text-gray-600">{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Requirements */}
                      {route.requirements && (
                        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                          <h3 className="font-serif text-xl font-bold text-green-950 mb-4">Requirements</h3>
                          <p className="font-sans text-gray-600 leading-relaxed">{route.requirements}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── ITINERARY ────────────────────────────────────────── */}
                  {activeTab === 'Itinerary' && (
                    <div className="space-y-4">
                      {route.itinerary?.length > 0 ? (
                        route.itinerary.map((day, idx) => (
                          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-5">
                            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-green-950 text-white flex items-center justify-center font-sans font-bold text-sm">
                              {day.day ?? idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-sans font-bold text-gray-900 mb-1">{day.title ?? `Day ${idx + 1}`}</h4>
                              {day.description && (
                                <p className="font-sans text-sm text-gray-500 leading-relaxed">{day.description}</p>
                              )}
                              {day.distance && (
                                <span className="inline-flex items-center gap-1 mt-2 font-sans text-xs text-[#c9a96e] font-semibold">
                                  <MapPin size={11} /> {day.distance}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                          <Mountain size={32} className="text-gray-200 mx-auto mb-3" />
                          <p className="font-sans text-gray-400">Itinerary details coming soon.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── INCLUDED / EXCLUDED ──────────────────────────────── */}
                  {activeTab === "What's Included" && (
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                        <h3 className="font-sans font-bold text-green-800 mb-4 flex items-center gap-2">
                          <CheckCircle size={18} className="text-green-600" /> Included
                        </h3>
                        {route.included?.length > 0 ? (
                          <ul className="space-y-2.5">
                            {route.included.map((item, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="font-sans text-sm text-gray-600">{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="font-sans text-sm text-gray-400">Details coming soon.</p>
                        )}
                        {route.package_details && (
                          <div className="mt-5 pt-5 border-t border-gray-100">
                            <p className="font-sans text-xs text-gray-500 leading-relaxed">{route.package_details}</p>
                          </div>
                        )}
                      </div>
                      <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                        <h3 className="font-sans font-bold text-red-700 mb-4 flex items-center gap-2">
                          <XCircle size={18} className="text-red-500" /> Not Included
                        </h3>
                        {route.excluded?.length > 0 ? (
                          <ul className="space-y-2.5">
                            {route.excluded.map((item, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                                <span className="font-sans text-sm text-gray-600">{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="font-sans text-sm text-gray-400">Details coming soon.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── PACKING LIST ─────────────────────────────────────── */}
                  {activeTab === 'Packing List' && (
                    <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                      <h3 className="font-sans font-bold text-green-950 mb-5 flex items-center gap-2">
                        <Backpack size={18} className="text-[#c9a96e]" /> What to Bring
                      </h3>
                      {route.packing_list?.length > 0 ? (
                        <ul className="grid sm:grid-cols-2 gap-3">
                          {route.packing_list.map((item, i) => (
                            <li key={i} className="flex items-center gap-2.5">
                              <div className="w-2 h-2 rounded-full bg-[#c9a96e] flex-shrink-0" />
                              <span className="font-sans text-sm text-gray-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="font-sans text-sm text-gray-400">Packing list coming soon. Contact us for details.</p>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: sticky booking sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-5">
                <div className="bg-white rounded-3xl p-7 shadow-xl shadow-green-900/5 border border-gray-100">
                  <p className="font-sans text-xs text-gray-400 uppercase tracking-widest mb-1">Book This Route</p>
                  {showPrices && route.price > 0 && (
                    <div className="flex items-end gap-2 mb-6">
                      <span className="font-serif text-3xl font-bold text-green-950">
                        ${route.price.toLocaleString()}
                      </span>
                      <span className="font-sans text-gray-400 mb-0.5 text-sm">/ person</span>
                    </div>
                  )}
                  {!showPrices && (
                    <p className="font-serif text-xl font-semibold text-green-950 mb-6">Request a Quote</p>
                  )}
                  <BookingForm tourTitle={route.name} tourPrice={showPrices ? route.price || undefined : undefined} />
                </div>

                {/* Quick stats card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                  {[
                    { icon: Clock, label: 'Duration', value: route.duration },
                    { icon: TrendingUp, label: 'Difficulty', value: route.difficulty },
                    { icon: Mountain, label: 'Summit Altitude', value: route.max_altitude },
                    { icon: Star, label: 'Success Rate', value: route.success_rate },
                    { icon: Calendar, label: 'Best Season', value: route.best_season },
                    { icon: Users, label: 'Group Size', value: route.group_size },
                  ].filter((r) => r.value).map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-sans text-xs text-gray-400">
                        <Icon size={13} className="text-[#c9a96e]" />{label}
                      </span>
                      <span className="font-sans text-sm font-semibold text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                  <ShieldCheck size={16} className="text-green-600 flex-shrink-0" />
                  <p className="font-sans text-xs text-green-800 font-medium">Expert guides · Full safety equipment</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Back link ─────────────────────────────────────────────────────── */}
      <div className="py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link to="/routes" className="inline-flex items-center gap-2 font-sans text-sm text-gray-500 hover:text-green-800 transition-colors">
            <ArrowLeft size={15} /> Back to All Routes
          </Link>
        </div>
      </div>

    </div>
  )
}
