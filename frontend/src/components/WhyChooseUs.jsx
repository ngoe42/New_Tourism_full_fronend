import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Compass, Shield, Heart, Camera, Leaf, Trophy } from 'lucide-react'

const reasons = [
  {
    icon: Compass,
    title: 'Expert Local Guides',
    desc: 'Our guides are Tanzania-born naturalists with extensive field experience and deep ecological knowledge of the land.',
  },
  {
    icon: Shield,
    title: 'Safety First Always',
    desc: 'All tours include comprehensive safety protocols, satellite communication, and emergency medical equipment.',
  },
  {
    icon: Heart,
    title: 'Personalized to You',
    desc: 'No two safaris are the same. Every itinerary is crafted around your interests, pace, and travel style.',
  },
  {
    icon: Camera,
    title: 'Photography Ready',
    desc: 'Optimal positioning for golden-hour shots, with guides who understand both wildlife and composition.',
  },
  {
    icon: Leaf,
    title: 'Sustainable & Ethical',
    desc: 'We support 12 local conservation projects and ensure our presence benefits the ecosystems we visit.',
  },
  {
    icon: Trophy,
    title: 'Award-Winning Service',
    desc: 'Recognized by Safari Awards, TripAdvisor, and Condé Nast Traveler as a top Tanzania operator.',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function WhyChooseUs() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  return (
    <section className="py-24 lg:py-32 bg-beige" id="about">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-label block mb-3"
          >
            Why Karibu Safari
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="section-title max-w-2xl mx-auto"
          >
            The Karibu Difference
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-gray-500 max-w-xl mx-auto mt-4 leading-relaxed"
          >
            From day one, we set out to redefine the standard for luxury safari experiences in East Africa.
          </motion.p>
        </div>

        {/* Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reasons.map((reason) => {
            const Icon = reason.icon
            return (
              <motion.div
                key={reason.title}
                variants={itemVariants}
                className="bg-white rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-400 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-beige group-hover:bg-gold/10 flex items-center justify-center mb-6 transition-colors duration-300">
                  <Icon size={24} className="text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl font-semibold text-green-950 mb-3">{reason.title}</h3>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">{reason.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
