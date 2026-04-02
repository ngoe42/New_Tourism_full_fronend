import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, LogIn, LayoutDashboard, LogOut, MapPin, Clock, ArrowRight, Mountain } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { toursApi } from '../api/tours'
import { routesApi } from '../api/routes'
import { experiencesApi } from '../api/experiences'

const staticLinks = [
  { label: 'Home',        href: '/' },
  { label: 'Kilimanjaro', href: '/routes', hasRouteDropdown: true },
  { label: 'Safari',      href: '/tours', hasTourDropdown: true },
  { label: 'Experiences', href: '/experiences', hasExperienceDropdown: true },
  { label: 'Blog',        href: '/blog' },
  { label: 'About',       href: '/#about' },
  { label: 'Contact',     href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [avatarOpen, setAvatarOpen]     = useState(false)
  const avatarRef = useRef(null)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  const { data: toursData } = useQuery({
    queryKey: ['nav-tours'],
    queryFn: () => toursApi.list({ per_page: 20, is_published: true }),
    staleTime: 5 * 60 * 1000,
  })
  const tourList = Array.isArray(toursData?.items) ? toursData.items : []

  const { data: routesData } = useQuery({
    queryKey: ['nav-routes'],
    queryFn: () => routesApi.list(),
    staleTime: 5 * 60 * 1000,
  })
  const routeList = Array.isArray(routesData) ? routesData : []
  const [activeRouteHover, setActiveRouteHover] = useState(null)
  const [activeTourHover, setActiveTourHover] = useState(null)
  const [activeExpHover, setActiveExpHover] = useState(null)

  const { data: experiencesData } = useQuery({
    queryKey: ['nav-experiences'],
    queryFn: () => experiencesApi.list(),
    staleTime: 5 * 60 * 1000,
  })
  const experienceList = Array.isArray(experiencesData) ? experiencesData : []

  useEffect(() => {
    const handler = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setActiveDropdown(null) }, [location])

  const isHome        = location.pathname === '/'
  const isTransparent = isHome && !scrolled

  const textCls  = isTransparent ? 'text-white/90' : 'text-gray-700'
  const activeCls = 'text-gold'

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo + Desktop Nav grouped on the left */}
          <div className="flex items-center gap-10">
          <Link to="/" className="flex-shrink-0 relative w-[180px] h-full flex items-center" aria-label="Nelson Tours and Safari — Home">
            <img
              src="/images/logo/logo.png"
              alt="Nelson Tours & Safari"
              className={`absolute left-0 w-auto object-contain transition-all duration-500 origin-top-left z-10 ${
                isTransparent ? 'top-2 h-[120px]' : 'top-1/2 -translate-y-1/2 h-16'
              }`}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-7">
            {staticLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => {
                  if (link.hasTourDropdown || link.hasRouteDropdown || link.hasExperienceDropdown) setActiveDropdown(link.label)
                }}
                onMouseLeave={() => {
                  setActiveDropdown(null)
                  setActiveRouteHover(null)
                  setActiveTourHover(null)
                  setActiveExpHover(null)
                }}
              >
                <Link
                  to={link.href}
                  className={`flex items-center gap-1 font-sans text-sm font-medium tracking-wide transition-colors duration-300 hover:text-gold ${textCls} ${
                    location.pathname.startsWith(link.href) && link.href !== '/' ? activeCls : location.pathname === link.href ? activeCls : ''
                  }`}
                >
                  {link.label}
                  {(link.hasTourDropdown || link.hasRouteDropdown || link.hasExperienceDropdown) && (
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                  )}
                </Link>

                {/* Kilimanjaro Route Megamenu */}
                <AnimatePresence>
                  {link.hasRouteDropdown && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full -left-10 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex"
                      style={{ width: activeRouteHover ? 700 : 290 }}
                    >
                      {/* Left: Route List */}
                      <div className="w-[290px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                          <Mountain size={14} className="text-gold" />
                          <span className="font-sans text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Select Route</span>
                        </div>
                        <div className="py-2 flex-1">
                          {routeList.length === 0 ? (
                            <div className="px-5 py-4 font-sans text-sm text-gray-400">Loading routes…</div>
                          ) : (
                            routeList.map((route) => (
                              <div
                                key={route.id}
                                onMouseEnter={() => setActiveRouteHover(route)}
                                className={`px-4 py-2.5 font-sans text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between group ${
                                  activeRouteHover?.id === route.id ? 'bg-beige text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span>{route.name}</span>
                                <ArrowRight size={12} className={`transition-all duration-200 ${activeRouteHover?.id === route.id ? 'text-gold translate-x-0 opacity-100' : 'text-gray-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                              </div>
                            ))
                          )}
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <Link to="/routes" className="text-xs font-sans font-semibold text-green-700 hover:text-gold flex items-center justify-center gap-1 transition-colors">
                            Compare All Routes <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>

                      {/* Right: Route Details Preview */}
                      {activeRouteHover && (
                        <motion.div
                          key={activeRouteHover.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18 }}
                          className="w-[410px] flex flex-col"
                        >
                          {/* Cover image */}
                          <div className="relative h-48 flex-shrink-0 overflow-hidden">
                            {(() => {
                              const cover = activeRouteHover.images?.find(i => i.is_cover) ?? activeRouteHover.images?.[0]
                              return cover ? (
                                <img
                                  src={cover.url}
                                  alt={activeRouteHover.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
                                  <Mountain size={32} className="text-white/30" />
                                </div>
                              )
                            })()}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4">
                              <h4 className="font-serif text-lg text-white font-bold leading-tight drop-shadow">
                                {activeRouteHover.name}
                              </h4>
                              {activeRouteHover.nickname && (
                                <p className="font-sans text-xs text-[#c9a96e] italic mt-0.5">"{activeRouteHover.nickname}"</p>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="bg-[#faf8f3] p-4 flex flex-col flex-1">
                            <div className="flex gap-2 mb-3">
                              <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                                <Clock size={11} className="text-gold"/> {activeRouteHover.duration}
                              </span>
                              {activeRouteHover.difficulty && (
                                <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                                  <Mountain size={11} className="text-gold"/> {activeRouteHover.difficulty}
                                </span>
                              )}
                            </div>

                            <p className="font-sans text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
                              {activeRouteHover.short_description}
                            </p>

                            {activeRouteHover.nickname_explanation && (
                              <div className="bg-white/80 p-2.5 rounded-lg border border-white mb-3">
                                <p className="font-sans text-[11px] text-gray-500 leading-snug line-clamp-2">
                                  <span className="font-semibold text-green-800">Why the nickname?</span> {activeRouteHover.nickname_explanation}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
                              <Link
                                to={`/routes/${activeRouteHover.slug}`}
                                className="text-center font-sans text-xs font-semibold text-green-800 border border-green-800/20 bg-white hover:bg-gray-50 py-2 rounded-lg transition-colors"
                              >
                                More Details
                              </Link>
                              <Link
                                to={`/contact?interest=${activeRouteHover.name}`}
                                className="text-center font-sans text-xs font-semibold text-white bg-green-800 hover:bg-green-700 py-2 rounded-lg transition-colors shadow-md"
                              >
                                Book Now
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Safari tour megamenu */}
                <AnimatePresence>
                  {link.hasTourDropdown && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full -left-10 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex"
                      style={{ width: activeTourHover ? 700 : 290 }}
                    >
                      {/* Left: Tour list */}
                      <div className="w-[290px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                          <MapPin size={14} className="text-gold" />
                          <span className="font-sans text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Select Safari</span>
                        </div>
                        <div className="py-2 flex-1 overflow-y-auto max-h-72">
                          {tourList.length === 0 ? (
                            <div className="px-5 py-4 font-sans text-sm text-gray-400">Loading safaris…</div>
                          ) : (
                            tourList.map((tour) => (
                              <div
                                key={tour.id}
                                onMouseEnter={() => setActiveTourHover(tour)}
                                className={`px-4 py-2.5 font-sans text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between group ${
                                  activeTourHover?.id === tour.id ? 'bg-beige text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className="truncate pr-2">{tour.title}</span>
                                <ArrowRight size={12} className={`flex-shrink-0 transition-all duration-200 ${
                                  activeTourHover?.id === tour.id ? 'text-gold translate-x-0 opacity-100' : 'text-gray-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                                }`} />
                              </div>
                            ))
                          )}
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <Link to="/tours" className="text-xs font-sans font-semibold text-green-700 hover:text-gold flex items-center justify-center gap-1 transition-colors">
                            View All Safaris <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>

                      {/* Right: Tour preview */}
                      {activeTourHover && (
                        <motion.div
                          key={activeTourHover.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18 }}
                          className="w-[410px] flex flex-col"
                        >
                          {/* Cover image */}
                          <div className="relative h-48 flex-shrink-0 overflow-hidden">
                            {(() => {
                              const cover = activeTourHover.images?.find(i => i.is_cover) ?? activeTourHover.images?.[0]
                              return cover ? (
                                <img src={cover.url} alt={activeTourHover.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-amber-800 to-green-900 flex items-center justify-center">
                                  <MapPin size={32} className="text-white/30" />
                                </div>
                              )
                            })()}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4">
                              <h4 className="font-serif text-lg text-white font-bold leading-tight drop-shadow">
                                {activeTourHover.title}
                              </h4>
                              {activeTourHover.location && (
                                <p className="font-sans text-xs text-[#c9a96e] mt-0.5 flex items-center gap-1">
                                  <MapPin size={10} /> {activeTourHover.location}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="bg-[#faf8f3] p-4 flex flex-col flex-1">
                            <div className="flex gap-2 mb-3">
                              {activeTourHover.duration && (
                                <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                                  <Clock size={11} className="text-gold" /> {activeTourHover.duration}
                                </span>
                              )}
                              {activeTourHover.price > 0 && (
                                <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-green-700 bg-white px-2 py-1 rounded-md shadow-sm">
                                  From ${activeTourHover.price?.toLocaleString()}
                                </span>
                              )}
                            </div>

                            <p className="font-sans text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
                              {activeTourHover.subtitle}
                            </p>

                            <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
                              <Link
                                to={`/tours/${activeTourHover.slug}`}
                                className="text-center font-sans text-xs font-semibold text-green-800 border border-green-800/20 bg-white hover:bg-gray-50 py-2 rounded-lg transition-colors"
                              >
                                More Details
                              </Link>
                              <Link
                                to={`/contact?interest=${activeTourHover.title}`}
                                className="text-center font-sans text-xs font-semibold text-white bg-green-800 hover:bg-green-700 py-2 rounded-lg transition-colors shadow-md"
                              >
                                Book Now
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Experiences megamenu */}
                <AnimatePresence>
                  {link.hasExperienceDropdown && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full -left-10 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex"
                      style={{ width: activeExpHover ? 700 : 290 }}
                    >
                      {/* Left: Experience list */}
                      <div className="w-[290px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                          <Mountain size={14} className="text-gold" />
                          <span className="font-sans text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Select Experience</span>
                        </div>
                        <div className="py-2 flex-1">
                          {experienceList.length === 0 ? (
                            <div className="px-5 py-4 font-sans text-sm text-gray-400">Loading…</div>
                          ) : (
                            experienceList.map((exp) => (
                              <div
                                key={exp.id}
                                onMouseEnter={() => setActiveExpHover(exp)}
                                className={`px-4 py-2.5 font-sans text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between group ${
                                  activeExpHover?.id === exp.id ? 'bg-beige text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className="truncate pr-2">{exp.title}</span>
                                <ArrowRight size={12} className={`flex-shrink-0 transition-all duration-200 ${
                                  activeExpHover?.id === exp.id ? 'text-gold translate-x-0 opacity-100' : 'text-gray-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                                }`} />
                              </div>
                            ))
                          )}
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <Link to="/experiences" className="text-xs font-sans font-semibold text-green-700 hover:text-gold flex items-center justify-center gap-1 transition-colors">
                            View All Experiences <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>

                      {/* Right: Experience preview */}
                      {activeExpHover && (
                        <motion.div
                          key={activeExpHover.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18 }}
                          className="w-[410px] flex flex-col"
                        >
                          {/* Cover image */}
                          <div className="relative h-48 flex-shrink-0 overflow-hidden">
                            {activeExpHover.image_url ? (
                              <img src={activeExpHover.image_url} alt={activeExpHover.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-green-900 to-amber-800 flex items-center justify-center">
                                <Mountain size={32} className="text-white/30" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4">
                              <h4 className="font-serif text-lg text-white font-bold leading-tight drop-shadow">
                                {activeExpHover.title}
                              </h4>
                              {activeExpHover.subtitle && (
                                <p className="font-sans text-xs text-[#c9a96e] mt-0.5 italic">
                                  {activeExpHover.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="bg-[#faf8f3] p-4 flex flex-col flex-1">
                            {activeExpHover.description && (
                              <p className="font-sans text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                {activeExpHover.description}
                              </p>
                            )}
                            <div className="grid grid-cols-2 gap-2 mt-auto">
                              <Link
                                to="/experiences"
                                className="text-center font-sans text-xs font-semibold text-green-800 border border-green-800/20 bg-white hover:bg-gray-50 py-2 rounded-lg transition-colors"
                              >
                                More Details
                              </Link>
                              <Link
                                to={`/contact?interest=${encodeURIComponent(activeExpHover.title)}`}
                                className="text-center font-sans text-xs font-semibold text-white bg-green-800 hover:bg-green-700 py-2 rounded-lg transition-colors shadow-md"
                              >
                                Book Now
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          </div>{/* end logo+nav group */}

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {user ? (
              <div ref={avatarRef} className="relative hidden lg:block">
                <button
                  onClick={() => setAvatarOpen((o) => !o)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-sans text-sm font-bold transition-all duration-300 ring-2 ${
                    isTransparent ? 'bg-white/20 text-white ring-white/40 hover:bg-white/30' : 'bg-green-700 text-white ring-green-700/30 hover:bg-green-800'
                  }`}
                >
                  {user.name?.[0]?.toUpperCase() ?? 'A'}
                </button>
                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1"
                    >
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="font-sans text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                        <p className="font-sans text-[10px] text-gray-400 truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setAvatarOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 font-sans text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-green-700" /> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); navigate('/'); setAvatarOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 font-sans text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login"
                className={`hidden lg:flex items-center gap-1.5 text-sm font-medium font-sans px-4 py-2 rounded-full transition-all duration-300 border ${
                  isTransparent ? 'border-white/40 text-white hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                <LogIn size={14} /> Sign In
              </Link>
            )}
            <Link
              to="/tours"
              className={`hidden lg:block text-sm font-medium font-sans px-6 py-2.5 rounded-full transition-all duration-300 ${
                isTransparent ? 'bg-gold text-white hover:bg-gold-dark' : 'bg-green-950 text-white hover:bg-green-900'
              }`}
            >
              Book a Safari
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${isTransparent ? 'text-white' : 'text-green-950'}`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-1 max-h-[75vh] overflow-y-auto">
              {staticLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block font-sans text-base font-medium text-gray-800 hover:text-gold transition-colors py-2.5 border-b border-gray-100"
                >
                  {link.label}
                </Link>
              ))}
              {/* Mobile route list under Kilimanjaro */}
              {routeList.length > 0 && (
                <div className="pt-1 pb-2">
                  <p className="font-sans text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pt-1 flex items-center gap-1">
                    <Mountain size={12} className="text-gold" /> All Kilimanjaro Routes
                  </p>
                  <div className="space-y-1">
                    {routeList.map((route) => (
                      <Link
                        key={route.id}
                        to={`/routes/${route.slug}`}
                        className="flex items-center justify-between py-2 font-sans text-sm text-gray-600 hover:text-gold transition-colors border-b border-gray-50"
                      >
                        <span className="flex items-center gap-2">
                          <ArrowRight size={12} className="text-gold flex-shrink-0" />
                          {route.name}
                        </span>
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{route.duration}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* Mobile tour list under Safari */}
              {tourList.length > 0 && (
                <div className="pt-1 pb-2">
                  <p className="font-sans text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 pt-1">All Safaris</p>
                  <div className="space-y-1">
                    {tourList.map((tour) => (
                      <Link
                        key={tour.id}
                        to={`/tours/${tour.slug}`}
                        className="flex items-center gap-2 py-2 font-sans text-sm text-gray-600 hover:text-gold transition-colors border-b border-gray-50"
                      >
                        <ArrowRight size={12} className="text-gold flex-shrink-0" />
                        {tour.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <Link
                to="/tours"
                className="block w-full text-center bg-green-950 text-white font-sans font-medium py-3 rounded-full mt-4 hover:bg-gold transition-colors duration-300"
              >
                Book a Safari
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
