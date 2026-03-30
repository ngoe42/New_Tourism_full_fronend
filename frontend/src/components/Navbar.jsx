import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Tours', href: '/tours' },
  { label: 'Destinations', href: '/tours', sub: ['Serengeti', 'Ngorongoro', 'Kilimanjaro', 'Zanzibar', 'Ruaha'] },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setActiveDropdown(null)
  }, [location])

  const isHome = location.pathname === '/'
  const isTransparent = isHome && !scrolled

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-white font-serif font-bold text-lg">
              K
            </div>
            <div>
              <span className={`font-serif font-semibold text-xl leading-none block transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-green-950'}`}>
                Karibu Safari
              </span>
              <span className={`font-sans text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 ${isTransparent ? 'text-gold-light' : 'text-gold'}`}>
                Tanzania
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.sub && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.href}
                  className={`flex items-center gap-1 font-sans text-sm font-medium tracking-wide transition-colors duration-300 hover:text-gold ${
                    isTransparent ? 'text-white/90' : 'text-gray-700'
                  } ${location.pathname === link.href ? 'text-gold' : ''}`}
                >
                  {link.label}
                  {link.sub && <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {link.sub && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                    >
                      {link.sub.map((item) => (
                        <Link
                          key={item}
                          to="/tours"
                          className="block px-5 py-3 font-sans text-sm text-gray-700 hover:bg-beige hover:text-green-950 transition-colors duration-200"
                        >
                          {item}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              to="/tours"
              className={`hidden lg:block text-sm font-medium font-sans px-6 py-2.5 rounded-full transition-all duration-300 ${
                isTransparent
                  ? 'bg-gold text-white hover:bg-gold-dark'
                  : 'bg-green-950 text-white hover:bg-green-900'
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
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block font-sans text-base font-medium text-gray-800 hover:text-gold transition-colors py-2 border-b border-gray-100"
                >
                  {link.label}
                </Link>
              ))}
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
