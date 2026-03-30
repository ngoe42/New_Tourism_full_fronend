import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube } from 'lucide-react'
import BookingForm from '../components/BookingForm'

const contactInfo = [
  { icon: Phone, label: 'Call Us', value: '+255 123 456 789', sub: 'Mon–Fri, 8am–6pm EAT', href: 'tel:+255123456789' },
  { icon: Mail, label: 'Email Us', value: 'hello@karibusafari.com', sub: 'Response within 24 hours', href: 'mailto:hello@karibusafari.com' },
  { icon: MapPin, label: 'Visit Us', value: 'Sokoine Road, Arusha', sub: 'Tanzania, East Africa', href: '#' },
  { icon: Clock, label: 'Office Hours', value: 'Mon–Fri: 8am–6pm', sub: 'Sat: 9am–2pm EAT', href: '#' },
]

const faqs = [
  {
    q: 'What is the best time to visit Tanzania?',
    a: 'The dry season (June–October) offers the best game viewing conditions. The Great Migration river crossings peak in July–August. The green season (November–May) offers lush landscapes and fewer crowds.',
  },
  {
    q: 'How far in advance should I book?',
    a: 'We recommend booking 3–6 months in advance for peak season (July–October). For custom itineraries, 6–9 months allows us to secure the best camps and exclusive experiences.',
  },
  {
    q: 'Are your safaris suitable for families with children?',
    a: 'Absolutely. We offer family-friendly safaris with minimum age requirements that vary by tour. Many of our camps have dedicated family suites and child-focused activities.',
  },
  {
    q: 'Do I need travel insurance?',
    a: 'Yes — travel insurance including medical evacuation coverage is strongly recommended and required for our mountaineering tours. We can recommend trusted providers.',
  },
  {
    q: 'What currencies are accepted?',
    a: 'We accept USD, EUR, and GBP for deposits and final payments. All tour prices are listed in USD. Secure online payment is available via bank transfer or card.',
  },
]

export default function Contact() {
  return (
    <main className="min-h-screen bg-beige">
      {/* Page Hero */}
      <section className="relative pt-36 pb-20 bg-green-950 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src="/images/sections/story-luxury.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/60 to-green-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold font-sans text-sm font-medium tracking-[0.2em] uppercase block mb-3"
          >
            Get In Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl text-white font-semibold mb-4"
          >
            Plan Your Safari
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-white/60 text-lg max-w-xl mx-auto"
          >
            Our safari specialists are ready to craft your perfect Tanzania adventure.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-10">
            {contactInfo.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-3xl p-6 shadow-xl shadow-black/5 hover:-translate-y-1 hover:shadow-2xl transition-all duration-400 block"
                >
                  <div className="w-12 h-12 rounded-2xl bg-beige flex items-center justify-center mb-4">
                    <Icon size={20} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="font-sans text-sm font-semibold text-green-950">{item.value}</p>
                  <p className="font-sans text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </motion.a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Form + Map Section */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-3 bg-white rounded-3xl p-8 lg:p-10 shadow-sm"
            >
              <h2 className="font-serif text-3xl font-semibold text-green-950 mb-2">Send Us a Message</h2>
              <p className="font-sans text-gray-500 text-sm mb-8">
                Tell us your dream safari and we'll build it from scratch — just for you.
              </p>
              <BookingForm />
            </motion.div>

            {/* Side info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Map placeholder */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm aspect-[4/3] relative">
                <img
                  src="/images/cta-bg.jpg"
                  alt="Tanzania map"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-green-950/40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <MapPin size={32} className="mx-auto mb-2 text-gold" />
                    <p className="font-serif text-xl font-semibold">Arusha, Tanzania</p>
                    <p className="font-sans text-sm text-white/70">Our home base</p>
                  </div>
                </div>
              </div>

              {/* Response promise */}
              <div className="bg-green-950 rounded-3xl p-6 text-white">
                <h3 className="font-serif text-xl font-semibold mb-3">Our Promise to You</h3>
                <ul className="space-y-3">
                  {[
                    'Personal response within 24 hours',
                    'No generic copy-paste quotes',
                    'Tailor-made itinerary at no cost',
                    'Zero pressure, pure expertise',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                      <span className="font-sans text-sm text-white/75">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Social links */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <p className="font-sans text-xs text-white/40 mb-3 uppercase tracking-wider">Follow Our Journey</p>
                  <div className="flex gap-3">
                    {[Instagram, Facebook, Youtube].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-gold hover:text-gold transition-colors"
                      >
                        <Icon size={15} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="pb-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-16">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">Quick Answers</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group bg-beige rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-sans text-sm font-semibold text-green-950 hover:text-gold transition-colors">
                  {faq.q}
                  <span className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0 ml-4 group-open:rotate-45 transition-transform duration-300 text-gray-400">+</span>
                </summary>
                <p className="px-6 pb-5 font-sans text-sm text-gray-600 leading-relaxed border-t border-gray-200/50 pt-4">
                  {faq.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
