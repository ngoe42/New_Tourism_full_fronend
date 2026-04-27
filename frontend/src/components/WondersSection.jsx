import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const cards = [
  {
    title: 'Climb Kilimanjaro',
    subtitle: 'Highest Mountain in Africa',
    image: '/images/sections/parallax-kilimanjaro.jpg',
    link: '/kilimanjaro',
  },
  {
    title: 'Tanzania Safari',
    subtitle: "Experience Africa's Wildlife",
    image: '/images/sections/parallax-serengeti.jpg',
    link: '/tours',
  },
]

export default function WondersSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-green-950 leading-tight">
            Let us be your guide to the wonders of Tanzania
          </h2>
          <div className="mx-auto mt-3 mb-5 w-14 h-[3px] rounded-full bg-gold" />
          <p className="font-sans text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Nelson Tours and Safaris is a Tanzania-based tour operator dedicated to creating exceptional Kilimanjaro climbs, unforgettable wildlife safaris, and tailor-made travel experiences built on local expertise, safety, and genuine hospitality.
          </p>
        </motion.div>

        {/* Two cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: i * 0.12 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] group"
            >
              {/* Background image */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />

              {/* Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-between p-7 text-center">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white drop-shadow-md leading-tight">
                    {card.title}
                  </h3>
                  <p className="font-sans text-sm sm:text-base font-semibold text-white/90 mt-1 drop-shadow-sm">
                    {card.subtitle}
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-1.5 bg-gold hover:bg-gold/90 text-white font-sans text-sm font-semibold px-6 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Discover Now <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
