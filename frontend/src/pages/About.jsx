import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Users, Star, MapPin, Shield, Heart, Compass, Leaf, Trophy, Camera, Phone, Mail } from 'lucide-react'
import WhyChooseUs from '../components/WhyChooseUs'
import CTASection from '../components/CTASection'

const stats = [
  { value: '15+', label: 'Years of Experience' },
  { value: '12,000+', label: 'Happy Travelers' },
  { value: '4.97', label: 'Average Rating' },
  { value: '100%', label: 'Licensed & Insured' },
]

const team = [
  {
    name: 'Nelson Mwangi',
    role: 'Founder & Head Guide',
    bio: 'Born and raised in the shadow of Kilimanjaro, Nelson has spent over 20 years guiding travelers across Tanzania\'s most iconic landscapes.',
    image: '/images/team/nelson.jpg',
  },
  {
    name: 'Amina Rashid',
    role: 'Safari Operations Manager',
    bio: 'With a background in conservation biology and wildlife management, Amina ensures every safari delivers both wonder and responsibility.',
    image: '/images/team/amina.jpg',
  },
  {
    name: 'David Kimaro',
    role: 'Senior Mountain Guide',
    bio: 'A certified UIMLA guide who has summited Kilimanjaro over 200 times, David\'s expertise makes every climb safe and unforgettable.',
    image: '/images/team/david.jpg',
  },
]

const values = [
  { icon: Leaf, title: 'Conservation First', desc: 'We partner with local conservation projects and donate a portion of every booking to wildlife protection initiatives.' },
  { icon: Heart, title: 'Community Impact', desc: 'Our team is 100% local — we invest in Tanzanian communities, supporting schools, infrastructure, and local businesses.' },
  { icon: Shield, title: 'Ethical Tourism', desc: 'We follow strict low-impact practices to protect the ecosystems and cultures that make Tanzania extraordinary.' },
  { icon: Trophy, title: 'Excellence Always', desc: 'Every detail is curated — from hand-picked camps to gourmet bush dinners — with zero compromise on quality.' },
]

export default function About() {
  return (
    <main className="bg-beige">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[55vh] flex flex-col justify-end bg-green-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/sections/story-guides.jpg"
            alt="Safari guides in Tanzania"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-950/55 to-green-950/20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-2xl"
          >
            Born from a Deep Love of the African Wild
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-base text-white/70 mt-4 max-w-xl leading-relaxed"
          >
            Nelson Tour and Safari — Tanzania's premier safari & Kilimanjaro trekking company, guided by people who grew up on these plains.
          </motion.p>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl font-bold text-green-950">{s.value}</p>
              <p className="font-sans text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Our Story ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Block 1 */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center mb-20 lg:mb-28">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full lg:w-1/2 flex-shrink-0"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                  <img src="/images/sections/story-guides.jpg" alt="Safari guide with guests at sunset" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-48 h-48 rounded-3xl bg-gold/10 -z-10 hidden sm:block" />
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl bg-green-950/10 -z-10 hidden sm:block" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full lg:w-1/2"
            >
              <span className="section-label block mb-4">Our Story</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-green-950 leading-tight mb-5">
                Born from a Deep Love<br />of the African Wild
              </h2>
              <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-6">
                Nelson Tour and Safari was founded by a passionate team of Tanzanian naturalists who believe that every traveler deserves more than a tour — they deserve a transformation. We grew up on these plains, under these stars, and beside these rivers. We share them with the world not as guides, but as storytellers.
              </p>
              <ul className="space-y-3 mb-8">
                {['Deep-rooted local expertise', 'Team of certified naturalists', 'TATO & TTB licensed & insured'].map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-gold flex-shrink-0" />
                    <span className="font-sans text-sm text-gray-700">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Block 2 */}
          <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full lg:w-1/2 flex-shrink-0"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                  <img src="/images/sections/story-luxury.jpg" alt="Luxury tented safari camp at sunset" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-3xl bg-gold/10 -z-10 hidden sm:block" />
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl bg-green-950/10 -z-10 hidden sm:block" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full lg:w-1/2"
            >
              <span className="section-label block mb-4">The Experience</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-green-950 leading-tight mb-5">
                Where Luxury Meets<br />the Untamed Wild
              </h2>
              <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-6">
                We curate every detail — from the finest mobile tented camps perched on private conservancies, to gourmet bush dinners by torchlight. Our guiding philosophy: zero compromise on comfort, zero distance from nature. This is Africa in its purest, most private form.
              </p>
              <ul className="space-y-3 mb-8">
                {['Private conservancy access', 'Gourmet bush dining experiences', 'Exclusive camp locations'].map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-gold flex-shrink-0" />
                    <span className="font-sans text-sm text-gray-700">{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/tours"
                className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-green-950 hover:text-gold transition-colors duration-300 group gold-underline"
              >
                View Our Tours <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Our Values ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-beige">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">What We Stand For</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-green-950">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full bg-beige flex items-center justify-center mb-4">
                    <Icon size={18} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans text-sm font-bold text-green-950 mb-2">{v.title}</h3>
                  <p className="font-sans text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────── */}
      <WhyChooseUs />

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <CTASection />

    </main>
  )
}
