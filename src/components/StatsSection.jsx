import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import { stats } from '../data/tours'

export default function StatsSection() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className="bg-green-950 rounded-3xl px-8 py-16 lg:py-20"
        >
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-gold font-sans text-sm font-medium tracking-[0.2em] uppercase"
            >
              By The Numbers
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-white font-semibold mt-2"
            >
              Built for the Modern Safari Traveler
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="text-center py-4 px-2 relative"
              >
                {/* Vertical divider */}
                {i < stats.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/4 h-1/2 w-px bg-white/10" />
                )}

                <div className="font-serif text-5xl lg:text-6xl font-semibold text-white mb-1">
                  {inView ? (
                    <CountUp
                      start={0}
                      end={stat.value}
                      duration={2.5}
                      separator=","
                      suffix={stat.suffix}
                    />
                  ) : (
                    <span>0{stat.suffix}</span>
                  )}
                </div>
                <div className="font-sans text-sm text-white/50 tracking-wide mt-2 uppercase">
                  {stat.label}
                </div>
                <div className="w-8 h-0.5 bg-gold mx-auto mt-4" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
