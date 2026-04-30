import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, ChevronRight, LayoutDashboard, LogOut, MapPin, Clock, ArrowRight, Mountain, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { toursApi } from '../api/tours'
import { routesApi } from '../api/routes'
import { experiencesApi } from '../api/experiences'
import { categories } from '../data/tours'
import { resolveImageUrl } from '../utils/imageUrl'

const SAFARI_CATEGORIES = categories.filter((c) => c !== 'All')

const staticLinks = [
  { label: 'Home',        href: '/' },
  { label: 'Kilimanjaro', href: '/routes', hasRouteDropdown: true },
  { label: 'Safari',      href: '/tours', hasTourDropdown: true },
  { label: 'Experiences', href: '/experiences', hasExperienceDropdown: true },
  { label: 'Blog',        href: '/blog' },
  { label: 'About',       href: '/about' },
  { label: 'Contact',     href: '/contact' },
]

export default function Navbar() {
  const { showBlog, logoUrl } = useSiteSettings()
  const visibleLinks = staticLinks.filter((l) => l.href !== '/blog' || showBlog)
  const [scrolled, setScrolled]         = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(null)
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
  const [activeKiliSubItem, setActiveKiliSubItem] = useState(null)
  const [mobileSub, setMobileSub] = useState(null)

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
    const onScroll = () => setScrolled(window.scrollY > 5)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setActiveDropdown(null) }, [location])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setMobileExpanded(null)
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isTransparent = false

  const textCls  = 'text-gray-700'
  const activeCls = 'text-gold'

  return (
    <>
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-md'
      }`}
    >
      {/* ── Social / contact top bar ─────────────────────────────────── */}
      <div className={`bg-green-950 overflow-hidden transition-all duration-500 ${
        scrolled ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-7 opacity-100'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-6 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-5">
            <a href="tel:+255777123456" className="flex items-center gap-1 font-sans text-[10px] text-white/60 hover:text-white transition-colors">
              <Phone size={10} /> +255 777 123 456
            </a>
            <a href="mailto:info@nelsontoursandsafari.com" className="flex items-center gap-1 font-sans text-[10px] text-white/60 hover:text-white transition-colors">
              <Mail size={10} /> info@nelsontoursandsafari.com
            </a>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <a href="https://facebook.com/nelsonsafari" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/50 hover:text-white transition-colors"><Facebook size={13} /></a>
            <a href="https://instagram.com/nelsonsafari" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/50 hover:text-white transition-colors"><Instagram size={13} /></a>
            <a href="https://twitter.com/nelsonsafari" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="text-white/50 hover:text-white transition-colors"><Twitter size={13} /></a>
            <a href="https://youtube.com/@nelsonsafari" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-white/50 hover:text-white transition-colors"><Youtube size={13} /></a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 lg:h-14">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center relative w-[216px] sm:w-[264px] lg:w-[312px] h-full" aria-label="Nelson Tours and Safari — Home">
            <img
              src={logoUrl ? resolveImageUrl(logoUrl) : '/images/logo/logo.png'}
              alt="Nelson Tours & Safari"
              className={`h-[84px] sm:h-24 lg:h-[120px] w-auto object-contain transition-all duration-500 origin-top-left z-10 ${
                isTransparent ? 'scale-110 sm:scale-125 translate-y-0.5 sm:translate-y-1' : 'scale-100 translate-y-0 translate-x-0'
              }`}
            />
          </Link>

          {/* Desktop Nav — centred */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center px-4">
            {visibleLinks.map((link) => (
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
                  setActiveKiliSubItem(null)
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

                {/* Kilimanjaro Megamenu — 3-column */}
                <AnimatePresence>
                  {link.hasRouteDropdown && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full -left-10 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex"
                      style={{
                        width: activeKiliSubItem === 'routes'
                          ? (activeRouteHover ? 800 : 490)
                          : activeKiliSubItem === 'mountains'
                          ? 450
                          : 250,
                      }}
                    >
                      {/* Column 1: Kilimanjaro main menu */}
                      <div className="w-[250px] flex-shrink-0 bg-white flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                          <Mountain size={14} className="text-gold" />
                          <span className="font-sans text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Kilimanjaro</span>
                        </div>
                        <div className="py-2 flex-1">
                          {/* Overview */}
                          <Link
                            to="/trekking"
                            onClick={() => setActiveDropdown(null)}
                            onMouseEnter={() => { setActiveKiliSubItem(null); setActiveRouteHover(null) }}
                            className="flex items-center gap-2.5 px-4 py-2.5 font-sans text-sm text-gray-700 hover:bg-gray-50 hover:text-green-800 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                            Kilimanjaro &amp; Trekking Overview
                          </Link>
                          {/* Routes → sub-panel */}
                          <div
                            onMouseEnter={() => { setActiveKiliSubItem('routes') }}
                            className={`flex items-center justify-between px-4 py-2.5 font-sans text-sm cursor-pointer transition-colors ${
                              activeKiliSubItem === 'routes' ? 'bg-beige text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                              Kilimanjaro Routes
                            </div>
                            <ChevronRight size={13} className={`flex-shrink-0 transition-colors ${activeKiliSubItem === 'routes' ? 'text-gold' : 'text-gray-300'}`} />
                          </div>
                          {/* Packing List */}
                          <Link
                            to="/trekking#packing-list"
                            onClick={() => setActiveDropdown(null)}
                            onMouseEnter={() => { setActiveKiliSubItem(null); setActiveRouteHover(null) }}
                            className="flex items-center gap-2.5 px-4 py-2.5 font-sans text-sm text-gray-700 hover:bg-gray-50 hover:text-green-800 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                            Kilimanjaro Packing List
                          </Link>
                          {/* Other Mountains → sub-panel */}
                          <div
                            onMouseEnter={() => { setActiveKiliSubItem('mountains'); setActiveRouteHover(null) }}
                            className={`flex items-center justify-between px-4 py-2.5 font-sans text-sm cursor-pointer transition-colors ${
                              activeKiliSubItem === 'mountains' ? 'bg-beige text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                              Other Mountains
                            </div>
                            <ChevronRight size={13} className={`flex-shrink-0 transition-colors ${activeKiliSubItem === 'mountains' ? 'text-gold' : 'text-gray-300'}`} />
                          </div>
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <Link to="/trekking" onClick={() => setActiveDropdown(null)} className="text-xs font-sans font-semibold text-green-700 hover:text-gold flex items-center justify-center gap-1 transition-colors">
                            Trekking Overview <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>

                      {/* Column 2a: Routes list */}
                      {activeKiliSubItem === 'routes' && (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15 }}
                          className="w-[240px] flex-shrink-0 bg-white border-l border-gray-100 flex flex-col"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-beige/40">
                            <Mountain size={12} className="text-gold" />
                            <span className="font-sans text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Select Route</span>
                          </div>
                          <div className="py-2 flex-1">
                            {routeList.length === 0 ? (
                              <div className="px-4 py-3 font-sans text-sm text-gray-400">Loading routes…</div>
                            ) : (
                              routeList.map((route) => (
                                <div
                                  key={route.id}
                                  onMouseEnter={() => setActiveRouteHover(route)}
                                  onClick={() => { navigate(`/routes/${route.slug}`); setActiveDropdown(null) }}
                                  className={`px-4 py-2.5 font-sans text-sm cursor-pointer transition-colors flex items-center justify-between group ${
                                    activeRouteHover?.id === route.id ? 'bg-beige text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <span>{route.name}</span>
                                  <ArrowRight size={11} className={`transition-all duration-200 ${activeRouteHover?.id === route.id ? 'text-gold opacity-100' : 'text-gray-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                </div>
                              ))
                            )}
                          </div>
                          <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <Link to="/routes" onClick={() => setActiveDropdown(null)} className="text-xs font-sans font-semibold text-green-700 hover:text-gold flex items-center justify-center gap-1 transition-colors">
                              View All Routes <ArrowRight size={11} />
                            </Link>
                          </div>
                        </motion.div>
                      )}

                      {/* Column 3: Route detail preview */}
                      {activeKiliSubItem === 'routes' && activeRouteHover && (
                        <motion.div
                          key={activeRouteHover.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18 }}
                          className="w-[310px] flex flex-col"
                        >
                          <div className="relative h-40 flex-shrink-0 overflow-hidden">
                            {(() => {
                              const cover = activeRouteHover.images?.find(i => i.is_cover) ?? activeRouteHover.images?.[0]
                              return cover ? (
                                <img src={resolveImageUrl(cover.url)} alt={activeRouteHover.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
                                  <Mountain size={28} className="text-white/30" />
                                </div>
                              )
                            })()}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4">
                              <h4 className="font-serif text-base text-white font-bold leading-tight drop-shadow">{activeRouteHover.name}</h4>
                              {activeRouteHover.nickname && (
                                <p className="font-sans text-xs text-[#c9a96e] italic mt-0.5">"{activeRouteHover.nickname}"</p>
                              )}
                            </div>
                          </div>
                          <div className="bg-[#faf8f3] p-4 flex flex-col flex-1">
                            <div className="flex gap-2 mb-3 flex-wrap">
                              {activeRouteHover.duration && (
                                <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                                  <Clock size={10} className="text-gold" /> {activeRouteHover.duration}
                                </span>
                              )}
                              {activeRouteHover.difficulty && (
                                <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                                  <Mountain size={10} className="text-gold" /> {activeRouteHover.difficulty}
                                </span>
                              )}
                            </div>
                            <p className="font-sans text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">{activeRouteHover.short_description}</p>
                            <div className="grid grid-cols-2 gap-2 mt-auto">
                              <Link to="/routes" onClick={() => setActiveDropdown(null)} className="text-center font-sans text-xs font-semibold text-green-800 border border-green-800/20 bg-white hover:bg-gray-50 py-2 rounded-lg transition-colors">
                                All Routes
                              </Link>
                              <Link to={`/routes/${activeRouteHover.slug}`} onClick={() => setActiveDropdown(null)} className="text-center font-sans text-xs font-semibold text-white bg-green-800 hover:bg-green-700 py-2 rounded-lg transition-colors shadow-sm">
                                View Route
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Column 2b: Other Mountains sub-panel */}
                      {activeKiliSubItem === 'mountains' && (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15 }}
                          className="w-[200px] flex-shrink-0 bg-white border-l border-gray-100 flex flex-col"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-beige/40">
                            <Mountain size={12} className="text-gold" />
                            <span className="font-sans text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Other Mountains</span>
                          </div>
                          <div className="py-2">
                            <Link
                              to="/oldoinyo-lengai"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center justify-between px-4 py-2.5 font-sans text-sm text-gray-700 hover:bg-beige hover:text-green-800 transition-colors group"
                            >
                              <span>Oldoinyo Lengai</span>
                              <ArrowRight size={11} className="text-gray-300 group-hover:text-gold transition-colors" />
                            </Link>
                            <Link
                              to="/meru"
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center justify-between px-4 py-2.5 font-sans text-sm text-gray-700 hover:bg-beige hover:text-green-800 transition-colors group"
                            >
                              <span>Mount Meru</span>
                              <ArrowRight size={11} className="text-gray-300 group-hover:text-gold transition-colors" />
                            </Link>
                          </div>
                          <div className="p-3 border-t border-gray-100 bg-gray-50 mt-auto">
                            <Link to="/contact" onClick={() => setActiveDropdown(null)} className="text-xs font-sans font-semibold text-green-700 hover:text-gold flex items-center justify-center gap-1 transition-colors">
                              Enquire Now <ArrowRight size={11} />
                            </Link>
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
                      {/* Left: Category list */}
                      <div className="w-[290px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                          <MapPin size={14} className="text-gold" />
                          <span className="font-sans text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Browse by Type</span>
                        </div>
                        <div className="py-2 flex-1">
                          {SAFARI_CATEGORIES.map((cat) => {
                            const previewTour = tourList.find((t) => t.category === cat)
                            return (
                              <div
                                key={cat}
                                onMouseEnter={() => setActiveTourHover(previewTour || null)}
                                className={`px-4 py-2.5 font-sans text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between group ${
                                  activeTourHover?.category === cat ? 'bg-beige text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                                onClick={() => { navigate(`/tours?category=${encodeURIComponent(cat)}`); setActiveDropdown(null) }}
                              >
                                <span>{cat}</span>
                                <ArrowRight size={12} className={`transition-all duration-200 ${activeTourHover?.category === cat ? 'text-gold translate-x-0 opacity-100' : 'text-gray-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                              </div>
                            )
                          })}
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <Link
                            to="/tours"
                            onClick={() => setActiveDropdown(null)}
                            className="text-xs font-sans font-semibold text-green-700 hover:text-gold flex items-center justify-center gap-1 transition-colors"
                          >
                            View All Safaris <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>

                      {/* Right: Tour Details Preview */}
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
                                <img
                                  src={resolveImageUrl(cover.url)}
                                  alt={activeTourHover.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
                                  <MapPin size={32} className="text-white/30" />
                                </div>
                              )
                            })()}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4">
                              <h4 className="font-serif text-lg text-white font-bold leading-tight drop-shadow">
                                {activeTourHover.title}
                              </h4>
                              {activeTourHover.subtitle && (
                                <p className="font-sans text-xs text-[#c9a96e] italic mt-0.5">"{activeTourHover.subtitle}"</p>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="bg-[#faf8f3] p-4 flex flex-col flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                                <Clock size={11} className="text-gold"/> {activeTourHover.duration}
                              </span>
                              {activeTourHover.location && (
                                <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                                  <MapPin size={11} className="text-gold"/> {activeTourHover.location}
                                </span>
                              )}
                              {activeTourHover.group_size && (
                                <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                                  {activeTourHover.group_size}
                                </span>
                              )}
                            </div>

                            <p className="font-sans text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
                              {activeTourHover.description}
                            </p>

                            <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
                              <Link
                                to={`/tours/${activeTourHover.id}`}
                                onClick={() => setActiveDropdown(null)}
                                className="text-center font-sans text-xs font-semibold text-green-800 border border-green-800/20 bg-white hover:bg-gray-50 py-2 rounded-lg transition-colors"
                              >
                                More Details
                              </Link>
                              <Link
                                to={`/tours/${activeTourHover.id}`}
                                onClick={() => setActiveDropdown(null)}
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
                              <img src={resolveImageUrl(activeExpHover.image_url)} alt={activeExpHover.title} className="w-full h-full object-cover" />
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

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {user ? (
              <div ref={avatarRef} className="relative hidden lg:block">
                <button
                  onClick={() => setAvatarOpen((o) => !o)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-sans text-xs font-bold transition-all duration-300 ring-2 ${
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
            ) : null}
            <Link
              to="/tours"
              className={`hidden lg:block text-sm font-medium font-sans px-5 py-1 rounded-full transition-all duration-300 ${
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

    </motion.nav>

    {/* Mobile Menu Drawer — rendered outside <nav> to escape its stacking context */}
    <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer — right-side panel, not full screen */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 bottom-0 w-[82vw] max-w-[340px] bg-white z-[9999] lg:hidden flex flex-col shadow-2xl"
            >
              {/* Header: Logo + Close */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  <img
                    src={logoUrl ? resolveImageUrl(logoUrl) : '/images/logo/logo.png'}
                    alt="Nelson Tours & Safari"
                    className="h-14 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable nav area */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">

                {/* Accordion Nav */}
                <nav className="py-1">

                  {/* HOME */}
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-5 py-3.5 font-sans text-sm font-bold text-gray-800 uppercase tracking-wider hover:text-gold hover:bg-beige/50 transition-colors border-b border-gray-100"
                  >
                    Home
                  </Link>

                  {/* KILIMANJARO accordion */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === 'kilimanjaro' ? null : 'kilimanjaro')}
                      className="w-full flex items-center justify-between px-5 py-3.5 font-sans text-sm font-bold text-gray-800 uppercase tracking-wider hover:text-gold hover:bg-beige/50 transition-colors"
                    >
                      <span>Kilimanjaro</span>
                      <ChevronRight size={15} className={`text-gray-400 transition-transform duration-200 ${mobileExpanded === 'kilimanjaro' ? 'rotate-90 text-gold' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileExpanded === 'kilimanjaro' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden bg-gray-50/80"
                        >
                          <div className="py-1">
                            {/* Overview */}
                            <Link
                              to="/trekking"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2.5 px-5 py-2.5 font-sans text-sm text-gray-700 hover:text-gold hover:bg-beige/50 transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                              Kilimanjaro &amp; Trekking Overview
                            </Link>

                            {/* Routes sub-accordion */}
                            <div>
                              <button
                                onClick={() => setMobileSub(mobileSub === 'routes' ? null : 'routes')}
                                className="w-full flex items-center justify-between px-5 py-2.5 font-sans text-sm text-gray-700 hover:text-gold hover:bg-beige/50 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                                  Kilimanjaro Routes
                                </div>
                                <ChevronRight size={13} className={`text-gray-400 transition-transform duration-200 ${mobileSub === 'routes' ? 'rotate-90 text-gold' : ''}`} />
                              </button>
                              <AnimatePresence initial={false}>
                                {mobileSub === 'routes' && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="overflow-hidden bg-white/60"
                                  >
                                    <div className="pl-9 pr-5 py-1 space-y-0.5">
                                      {routeList.map((route) => (
                                        <Link
                                          key={route.id}
                                          to={`/routes/${route.slug}`}
                                          onClick={() => setMenuOpen(false)}
                                          className="flex items-center gap-2 py-2 font-sans text-sm text-gray-600 hover:text-gold transition-colors border-b border-gray-100/60 last:border-0"
                                        >
                                          <span className="w-1 h-1 rounded-full bg-gold/40 flex-shrink-0" />
                                          {route.name}
                                        </Link>
                                      ))}
                                      <Link
                                        to="/routes"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 font-sans text-xs font-semibold text-gold hover:opacity-75 transition-opacity"
                                      >
                                        <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                                        View All Routes
                                      </Link>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Packing List */}
                            <Link
                              to="/trekking#packing-list"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2.5 px-5 py-2.5 font-sans text-sm text-gray-700 hover:text-gold hover:bg-beige/50 transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                              Kilimanjaro Packing List
                            </Link>

                            {/* Other Mountains sub-accordion */}
                            <div>
                              <button
                                onClick={() => setMobileSub(mobileSub === 'mountains' ? null : 'mountains')}
                                className="w-full flex items-center justify-between px-5 py-2.5 font-sans text-sm text-gray-700 hover:text-gold hover:bg-beige/50 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                                  Other Mountains
                                </div>
                                <ChevronRight size={13} className={`text-gray-400 transition-transform duration-200 ${mobileSub === 'mountains' ? 'rotate-90 text-gold' : ''}`} />
                              </button>
                              <AnimatePresence initial={false}>
                                {mobileSub === 'mountains' && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="overflow-hidden bg-white/60"
                                  >
                                    <div className="pl-9 pr-5 py-1 space-y-0.5">
                                      <Link
                                        to="/oldoinyo-lengai"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 font-sans text-sm text-gray-600 hover:text-gold transition-colors border-b border-gray-100/60"
                                      >
                                        <span className="w-1 h-1 rounded-full bg-gold/40 flex-shrink-0" />
                                        Oldoinyo Lengai
                                      </Link>
                                      <Link
                                        to="/meru"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-2 font-sans text-sm text-gray-600 hover:text-gold transition-colors"
                                      >
                                        <span className="w-1 h-1 rounded-full bg-gold/40 flex-shrink-0" />
                                        Mount Meru
                                      </Link>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* SAFARI accordion */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === 'safari' ? null : 'safari')}
                      className="w-full flex items-center justify-between px-5 py-3.5 font-sans text-sm font-bold text-gray-800 uppercase tracking-wider hover:text-gold hover:bg-beige/50 transition-colors"
                    >
                      <span>Safari</span>
                      <ChevronRight size={15} className={`text-gray-400 transition-transform duration-200 ${mobileExpanded === 'safari' ? 'rotate-90 text-gold' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileExpanded === 'safari' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden bg-gray-50/80"
                        >
                          <div className="px-5 py-2 space-y-0.5">
                            {SAFARI_CATEGORIES.map((cat) => (
                              <Link
                                key={cat}
                                to={`/tours?category=${encodeURIComponent(cat)}`}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2.5 py-2 font-sans text-sm text-gray-600 hover:text-gold transition-colors border-b border-gray-100/60 last:border-0"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-gold/40 flex-shrink-0" />
                                {cat}
                              </Link>
                            ))}
                            <Link
                              to="/tours"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2.5 py-2 font-sans text-xs font-semibold text-gold hover:opacity-75 transition-opacity"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                              View All Safaris
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* EXPERIENCES accordion */}
                  <div className="border-b border-gray-100">
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === 'experiences' ? null : 'experiences')}
                      className="w-full flex items-center justify-between px-5 py-3.5 font-sans text-sm font-bold text-gray-800 uppercase tracking-wider hover:text-gold hover:bg-beige/50 transition-colors"
                    >
                      <span>Experiences</span>
                      <ChevronRight size={15} className={`text-gray-400 transition-transform duration-200 ${mobileExpanded === 'experiences' ? 'rotate-90 text-gold' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileExpanded === 'experiences' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden bg-gray-50/80"
                        >
                          <div className="px-5 py-2 space-y-0.5">
                            <Link
                              to="/experiences"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2.5 py-2 font-sans text-xs font-semibold text-gold hover:opacity-75 transition-opacity"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                              All Experiences
                            </Link>
                            {experienceList.map((exp) => (
                              <Link
                                key={exp.id}
                                to="/experiences"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2.5 py-2 font-sans text-sm text-gray-600 hover:text-gold transition-colors border-b border-gray-100/60 last:border-0"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-gold/40 flex-shrink-0" />
                                {exp.title}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Flat links */}
                  {[
                    ...(showBlog ? [{ label: 'Blog', href: '/blog' }] : []),
                    { label: 'About',   href: '/about' },
                    { label: 'Contact', href: '/contact' },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-5 py-3.5 font-sans text-sm font-bold text-gray-800 uppercase tracking-wider hover:text-gold hover:bg-beige/50 transition-colors border-b border-gray-100"
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Auth links — only rendered when logged in */}
                  {user && (
                    <div className="px-4 pt-4 pb-2 space-y-2">
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 py-2.5 px-4 font-sans text-sm font-medium text-green-800 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                        >
                          <LayoutDashboard size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); navigate('/'); setMenuOpen(false) }}
                        className="w-full flex items-center gap-2.5 py-2.5 px-4 font-sans text-sm font-medium text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </nav>
              </div>

              {/* Footer: CTAs + Social — always pinned to bottom */}
              <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-4 space-y-2.5">
                <Link
                  to="/tours"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center w-full bg-green-950 text-white font-sans text-sm font-semibold py-3.5 rounded-2xl hover:bg-green-800 transition-colors shadow-sm"
                >
                  Book a Safari
                </Link>
                <a
                  href="https://wa.me/255750005973"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-sans text-sm font-semibold py-3.5 rounded-2xl hover:bg-[#1fbd5a] transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width={17} height={17}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
                <div className="flex items-center justify-center gap-5 pt-1">
                  {[
                    { href: 'https://instagram.com/nelsonsafari', label: 'Instagram', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" strokeWidth={0}/></svg> },
                    { href: 'https://facebook.com/nelsonsafari', label: 'Facebook', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
                    { href: 'https://youtube.com/@nelsonsafari', label: 'YouTube', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg> },
                  ].map(({ href, label, icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-gray-400 hover:text-gold transition-colors">
                      {icon}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
    </AnimatePresence>
    </>
  )
}
