import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'

const stories = [
  {
    label: 'Our Story',
    title: 'Born from a Deep Love\nof the African Wild',
    body: `Karibu Safari was founded by a passionate team of Tanzanian naturalists who believe that every traveler deserves more than a tour — they deserve a transformation. We grew up on these plains, under these stars, and beside these rivers. We share them with the world not as guides, but as storytellers.`,
    image: '/images/sections/story-guides.jpg',
    imageAlt: 'Safari guide with guests at sunset',
    bullets: ['Deep-rooted local expertise', 'Team of certified naturalists', 'TATO & TTB licensed & insured'],
    cta: { label: 'About Our Team', href: '/contact' },
    reverse: false,
  },
  {
    label: 'The Experience',
    title: 'Where Luxury Meets\nthe Untamed Wild',
    body: `We curate every detail — from the finest mobile tented camps perched on private conservancies, to gourmet bush dinners by torchlight. Our guiding philosophy: zero compromise on comfort, zero distance from nature. This is Africa in its purest, most private form.`,
    image: '/images/sections/story-luxury.jpg',
    imageAlt: 'Luxury tented safari camp at sunset',
    bullets: ['Private conservancy access', 'Gourmet bush dining experiences', 'Exclusive camp locations'],
    cta: { label: 'View Our Camps', href: '/tours' },
    reverse: true,
  },
]

function StoryBlock({ story, index }) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  return (
    <div
      ref={ref}
      className={`flex flex-col ${story.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-20 items-center`}
    >
      {/* Image side */}
      <motion.div
        initial={{ opacity: 0, x: story.reverse ? 60 : -60 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full lg:w-1/2 flex-shrink-0"
      >
        <div className="relative">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
            <img
              src={story.image}
              alt={story.imageAlt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
          {/* Decorative accent */}
          <div
            className={`absolute -bottom-6 ${story.reverse ? '-right-6' : '-left-6'} w-48 h-48 rounded-3xl bg-gold/10 -z-10`}
          />
          <div
            className={`absolute -top-4 ${story.reverse ? '-left-4' : '-right-4'} w-24 h-24 rounded-2xl bg-green-950/10 -z-10`}
          />
        </div>
      </motion.div>

      {/* Text side */}
      <motion.div
        initial={{ opacity: 0, x: story.reverse ? -60 : 60 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full lg:w-1/2"
      >
        <span className="section-label block mb-4">{story.label}</span>
        <h2 className="font-serif text-4xl lg:text-5xl font-semibold text-green-950 leading-tight mb-6 whitespace-pre-line">
          {story.title}
        </h2>
        <p className="font-sans text-gray-600 leading-relaxed text-lg mb-8">{story.body}</p>

        {/* Bullets */}
        <ul className="space-y-3 mb-10">
          {story.bullets.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <CheckCircle size={18} className="text-gold flex-shrink-0" />
              <span className="font-sans text-sm text-gray-700">{b}</span>
            </li>
          ))}
        </ul>

        <Link
          to={story.cta.href}
          className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-green-950 hover:text-gold transition-colors duration-300 group gold-underline"
        >
          {story.cta.label}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </motion.div>
    </div>
  )
}

export default function StorySection() {
  return (
    <section className="py-24 lg:py-36 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-28">
        {stories.map((story, i) => (
          <StoryBlock key={i} story={story} index={i} />
        ))}
      </div>
    </section>
  )
}
