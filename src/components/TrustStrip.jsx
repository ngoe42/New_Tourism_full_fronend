import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Shield, Star, Users, Award, MapPin, Clock } from 'lucide-react'

const badges = [
  { icon: Star, label: 'Top-Rated Guides', sub: '4.97 avg. rating' },
  { icon: MapPin, label: 'Local Experts', sub: 'Born & raised in Tanzania' },
  { icon: Users, label: 'Small Groups', sub: 'Max 8 guests per tour' },
  { icon: Shield, label: 'Fully Licensed', sub: 'TATO & TTB certified' },
  { icon: Award, label: 'Award Winning', sub: 'Safari Awards 2024' },
  { icon: Clock, label: 'Tailored Experiences', sub: 'Every trip is unique' },
]

export default function TrustStrip() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <section ref={ref} className="bg-white py-10 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, i) => {
            const Icon = badge.icon
            return (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center text-center gap-2 py-2"
              >
                <div className="w-10 h-10 rounded-full bg-beige flex items-center justify-center">
                  <Icon size={18} className="text-gold" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-green-950">{badge.label}</p>
                  <p className="font-sans text-xs text-gray-400 mt-0.5">{badge.sub}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
