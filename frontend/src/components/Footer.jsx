import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter } from 'lucide-react'

const footerLinks = {
  Destinations: ['Serengeti', 'Ngorongoro Crater', 'Kilimanjaro', 'Zanzibar', 'Tarangire', 'Ruaha'],
  Tours: ['Classic Safaris', 'Luxury Safaris', 'Adventure Treks', 'Beach Escapes', 'Cultural Tours', 'Honeymoon'],
  Company: ['About Us', 'Our Guides', 'Sustainability', 'Press', 'Careers', 'Blog'],
  Support: ['Plan Your Trip', 'FAQs', 'Travel Insurance', 'Visa Info', 'Health & Safety', 'Contact Us'],
}

const socials = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-green-950 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block mb-6" aria-label="Nelson Tours and Safari — Home">
              <img
                src="/images/logo/logo.png"
                alt="Nelson Tours & Safari"
                className="h-16 w-auto object-contain drop-shadow-lg"
              />
            </Link>

            <p className="font-sans text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
              Crafting world-class safari experiences in Tanzania. Born local, built for the world.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <a href="tel:+255123456789" className="flex items-center gap-3 group">
                <Phone size={14} className="text-gold flex-shrink-0" />
                <span className="font-sans text-sm text-white/60 group-hover:text-gold transition-colors">+255 123 456 789</span>
              </a>
              <a href="mailto:hello@nelsontoursandsafari.com" className="flex items-center gap-3 group">
                <Mail size={14} className="text-gold flex-shrink-0" />
                <span className="font-sans text-sm text-white/60 group-hover:text-gold transition-colors">hello@nelsontoursandsafari.com</span>
              </a>
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-gold flex-shrink-0" />
                <span className="font-sans text-sm text-white/60">Arusha, Tanzania</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-8">
              {socials.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold transition-colors duration-300"
                  >
                    <Icon size={15} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="col-span-1 lg:col-span-1">
              <h4 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-white mb-5">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      to="/tours"
                      className="font-sans text-sm text-white/50 hover:text-gold transition-colors duration-200"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter strip */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-serif text-lg font-medium text-white">Stay inspired</p>
              <p className="font-sans text-sm text-white/50">Safari stories, wildlife news, and exclusive offers.</p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 font-sans text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                className="bg-gold text-white font-sans text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gold-dark transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-white/30">
            © {new Date().getFullYear()} Nelson Tour and Safari. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <Link
                key={item}
                to="/"
                className="font-sans text-xs text-white/30 hover:text-gold transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
