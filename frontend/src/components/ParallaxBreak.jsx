import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function ParallaxBreak({
  image,
  title,
  subtitle,
  cta,
  ctaHref = '/tours',
  overlay = 'from-black/50 to-[#0f3d2e]/70',
  height = 'h-[60vh]',
}) {
  const imgRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!imgRef.current) return
      const rect = imgRef.current.parentElement.getBoundingClientRect()
      const offset = rect.top * 0.35
      imgRef.current.style.transform = `translateY(${offset}px) scale(1.15)`
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className={`relative ${height} overflow-hidden flex items-center justify-center`}>
      {/* Parallax image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imgRef}
          src={image}
          alt={title}
          className="w-full h-full object-cover will-change-transform scale-110"
          loading="lazy"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${overlay}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9 }}
        >
          {subtitle && (
            <p className="font-sans text-gold text-sm tracking-[0.25em] uppercase mb-4">{subtitle}</p>
          )}
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-semibold leading-tight text-shadow mb-8">
            {title}
          </h2>
          {cta && (
            <Link to={ctaHref} className="btn-primary inline-block">
              {cta}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  )
}
