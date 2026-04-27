import { motion } from 'framer-motion'
import { MapPin, Award, Star, Phone, Globe, Lock, Zap, Trophy } from 'lucide-react'

const trustPoints = [
  { icon: MapPin, title: 'Unmatched Local Knowledge', desc: 'Our guides grew up on these landscapes. They know the secret migration corridors, the quietest crater tracks, and the communities no guidebook has ever mapped.' },
  { icon: Award, title: 'Fully Licensed Operator', desc: 'We are registered with the Tanzania Tourism Board (TTB) and the Tanzania Association of Tour Operators (TATO), offering you full legal protection and peace of mind from day one.' },
  { icon: Star, title: 'Handpicked Accommodations', desc: 'Every lodge, tented camp, and beach resort in our portfolio is personally vetted by our team — chosen for character, comfort, location, and authenticity.' },
  { icon: Phone, title: 'Responsive Communication', desc: 'From first enquiry to final farewell, our team is reachable within hours — by email, WhatsApp, or phone — in English, Swahili, and additional languages on request.' },
  { icon: Globe, title: 'Fully Customised Private Tours', desc: 'We do not operate group-only packages. Every journey we design is private, flexible, and built around you — your dates, your pace, your dream.' },
  { icon: Lock, title: 'Transparent Pricing & Secure Booking', desc: 'No hidden fees. No ambiguous inclusions. We present clear, itemised pricing and use secure payment systems so you always know exactly what you are paying for.' },
  { icon: Zap, title: 'Attention to Every Detail', desc: 'A cold towel on arrival. A birthday cake at the crater rim. Dietary requirements honoured without prompting. The details that transform a trip into a memory.' },
  { icon: Trophy, title: 'Consistently Outstanding Reviews', desc: 'We hold a near-perfect rating across international platforms because we treat every traveler as a member of the Nelson family — not a booking number.' },
]

export default function WhyChooseUs() {
  return (
    <section className="py-20 sm:py-28 bg-white" id="why-choose-us">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="section-label mb-3">Why Choose Us</p>
          <h2 className="section-title max-w-2xl mx-auto">
            Eight Reasons the World's Travelers Choose Nelson
          </h2>
          <p className="font-sans text-gray-500 max-w-xl mx-auto mt-4 leading-relaxed">
            From local expertise and licensed operations to transparent pricing and obsessive attention to detail — here is what sets us apart.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPoints.map((t, i) => {
            const Icon = t.icon
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.07 }}
                className="border border-gray-100 rounded-2xl p-6 bg-beige/40 hover:border-gold/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4">
                  <Icon size={16} className="text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-sans text-sm font-bold text-green-950 mb-2">{t.title}</h3>
                <p className="font-sans text-xs text-gray-500 leading-relaxed">{t.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
