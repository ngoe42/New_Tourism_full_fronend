import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, LogIn, LayoutDashboard, LogOut, MapPin, Clock, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { toursApi } from '../api/tours'

const staticLinks = [
  { label: 'Home',        href: '/' },
  { label: 'Kilimanjaro', href: '/tours/kilimanjaro-summit-trek' },
  { label: 'Safari',      href: '/tours', hasTourDropdown: true },
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
  const tourList = toursData?.items ?? []

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

          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none group flex-shrink-0">
            <span className={`font-serif font-bold text-2xl tracking-[0.12em] uppercase transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-green-950'}`}>
              Nelson
            </span>
            <span className={`font-serif italic text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 ${isTransparent ? 'text-gold-light' : 'text-gold'}`}>
              Tour &amp; Safari
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-7">
            {staticLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.hasTourDropdown && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.href}
                  className={`flex items-center gap-1 font-sans text-sm font-medium tracking-wide transition-colors duration-300 hover:text-gold ${textCls} ${
                    location.pathname === link.href ? activeCls : ''
                  }`}
                >
                  {link.label}
                  {link.hasTourDropdown && (
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                  )}
                </Link>

                {/* Safari tour dropdown */}
                <AnimatePresence>
                  {link.hasTourDropdown && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                      style={{ minWidth: 280 }}
                    >
                      {/* Header row */}
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="font-sans text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Our Safaris</span>
                        <Link
                          to="/tours"
                          className="font-sans text-xs text-green-700 font-semibold hover:text-gold flex items-center gap-1 transition-colors"
                        >
                          View all <ArrowRight size={11} />
                        </Link>
                      </div>

                      {/* Tour list */}
                      {tourList.length === 0 ? (
                        <div className="px-5 py-4 font-sans text-sm text-gray-400">Loading safaris…</div>
                      ) : (
                        tourList.map((tour) => (
                          <Link
                            key={tour.id}
                            to={`/tours/${tour.slug}`}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-beige transition-colors duration-150 group/item border-b border-gray-50 last:border-0"
                          >
                            {/* Cover thumbnail */}
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 mt-0.5">
                              {tour.images?.[0]?.url ? (
                                <img src={tour.images[0].url} alt={tour.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-green-100" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-sans text-sm font-semibold text-gray-800 group-hover/item:text-green-700 transition-colors truncate">
                                {tour.title}
                              </p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1 font-sans text-[11px] text-gray-400">
                                  <Clock size={10} /> {tour.duration}
                                </span>
                                <span className="flex items-center gap-1 font-sans text-[11px] text-gray-400">
                                  <MapPin size={10} /> {tour.location?.split(',')[0]}
                                </span>
                              </div>
                            </div>
                            <span className="font-sans text-xs font-bold text-green-700 flex-shrink-0 mt-1">
                              ${tour.price?.toLocaleString()}
                            </span>
                          </Link>
                        ))
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
