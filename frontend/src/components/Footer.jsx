import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, MessageCircle, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { experiencesApi } from '../api/experiences'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { resolveImageUrl } from '../utils/imageUrl'

const navLinks = [
  { label: 'Safari Tours', href: '/tours' },
  { label: 'Kilimanjaro Treks', href: '/routes' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

const socials = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
]

const bookingPoints = [
  'Free personalised itinerary',
  'No booking fees',
  'Flexible cancellation',
  '24 hr response guarantee',
]

export default function Footer() {
  const { showBlog, logoUrl } = useSiteSettings()
  const visibleNavLinks = navLinks.filter((l) => l.href !== '/blog' || showBlog)
  const { data } = useQuery({
    queryKey: ['experiences-footer'],
    queryFn: () => experiencesApi.list(),
    staleTime: 10 * 60 * 1000,
  })
  const experiences = (Array.isArray(data) ? data : (data?.value ?? [])).slice(0, 6)

  return (
    <footer className="bg-green-950 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <Link to="/" aria-label="Home">
            <img
              src={logoUrl ? resolveImageUrl(logoUrl) : '/images/logo/logo.png'}
              alt="Nelson Tours & Safari"
              className="h-24 w-auto object-contain drop-shadow mb-3"
            />
          </Link>
          <p className="font-sans text-white/50 text-xs leading-relaxed mb-4 max-w-[220px]">
            Crafting world-class safari experiences in Tanzania. Born local, built for the world.
          </p>
          <div className="flex gap-2.5">
            {socials.map(({ icon: Icon, label, href }) => (
              <a key={label} href={href} aria-label={label}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-gold hover:text-gold transition-colors">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Explore</h4>
          <ul className="space-y-2">
            {visibleNavLinks.map(({ label, href }) => (
              <li key={label}>
                <Link to={href} className="font-sans text-sm text-white/60 hover:text-gold transition-colors flex items-center gap-1.5 group">
                  <ChevronRight size={12} className="text-white/20 group-hover:text-gold transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Experiences */}
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Experiences</h4>
          {experiences.length > 0 ? (
            <ul className="space-y-2">
              {experiences.map((exp) => (
                <li key={exp.id}>
                  <Link to="/experiences" className="font-sans text-sm text-white/60 hover:text-gold transition-colors flex items-center gap-1.5 group">
                    <ChevronRight size={12} className="text-white/20 group-hover:text-gold transition-colors" />
                    {exp.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2">
              {['Maasai Village Visit', 'Game Drive Safari', 'Kilimanjaro Trek', 'Zanzibar Beach', 'Hot Air Balloon', 'Bush Dinner'].map((e) => (
                <li key={e}>
                  <Link to="/experiences" className="font-sans text-sm text-white/60 hover:text-gold transition-colors flex items-center gap-1.5 group">
                    <ChevronRight size={12} className="text-white/20 group-hover:text-gold transition-colors" />
                    {e}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Book with us */}
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Book With Us</h4>
          <ul className="space-y-2 mb-5">
            {bookingPoints.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-gold flex-shrink-0" />
                <span className="font-sans text-xs text-white/60">{p}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2.5 border-t border-white/10 pt-4">
            <a href="tel:+255750005973" className="flex items-center gap-2 group">
              <Phone size={13} className="text-gold flex-shrink-0" />
              <span className="font-sans text-xs text-white/60 group-hover:text-gold transition-colors">+255 750 005 973</span>
            </a>
            <a href="mailto:contact@nelsontoursandsafari.com" className="flex items-center gap-2 group">
              <Mail size={13} className="text-gold flex-shrink-0" />
              <span className="font-sans text-xs text-white/60 group-hover:text-gold transition-colors break-all">contact@nelsontoursandsafari.com</span>
            </a>
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-gold flex-shrink-0" />
              <span className="font-sans text-xs text-white/60">Arusha, Tanzania</span>
            </div>
          </div>

          <a
            href="https://wa.me/255750005973"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-sans text-xs font-semibold px-4 py-2 rounded-lg transition-colors w-full justify-center"
          >
            <MessageCircle size={13} /> Chat on WhatsApp
          </a>
          <p className="font-sans text-[10px] text-white/30 text-center mt-2 flex items-center justify-center gap-1">
            <Clock size={10} /> Average reply within 1 hour
          </p>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className="font-sans text-xs text-white/20">Licensed by TATO & TTB · Arusha, Tanzania</p>
          <p className="font-sans text-[11px] text-white/60">
            Designed &amp; Built by{' '}
            <a
              href="mailto:ngoekenedy@gmail.com"
              className="text-gold hover:text-gold/80 transition-colors underline underline-offset-2"
            >
              Kenedy Ngoe
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
