import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CheckCircle, ArrowRight, Shield, Heart, Leaf,
  Mountain, Eye, Waves, Users, MapPin, Truck, Globe
} from 'lucide-react'
import WhyChooseUs from '../components/WhyChooseUs'
import CTASection from '../components/CTASection'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { resolveImageUrl } from '../utils/imageUrl'

const fadeUp = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7 } }
const fadeLeft = { initial: { opacity: 0, x: -50 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.8 } }
const fadeRight = { initial: { opacity: 0, x: 50 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.8 } }

const stats = [
  { value: '15+', label: 'Years of Expertise' },
  { value: '12,000+', label: 'Lives Transformed' },
  { value: '4.97★', label: 'Average Guest Rating' },
  { value: '100%', label: 'Licensed & Insured' },
]

const services = [
  { icon: Eye, title: 'Tanzania Wildlife Safaris', desc: 'Witness the Great Migration across the Serengeti, descend into the Ngorongoro Crater, and track leopards through Tarangire — guided by people who have lived beside these animals their entire lives.' },
  { icon: Mountain, title: 'Mount Kilimanjaro Expeditions', desc: 'Africa\'s highest summit awaits. Our UIMLA-certified mountain crews guide you safely and confidently across Machame, Lemosho, Marangu, and more — with oxygen support, trained medics, and carefully inspected gear.' },
  { icon: Waves, title: 'Zanzibar Beach Escapes', desc: 'After the savannah, unwind on the spice-scented shores of Zanzibar. We arrange luxury beachfront retreats, dhow sailing tours, Stone Town explorations, and seamless transfers from the mainland.' },
  { icon: Users, title: 'Cultural & Day Tours', desc: 'From the vibrant Maasai villages of the Rift Valley to the thundering curtains of Materuni Waterfalls — our cultural journeys connect you with the soul of Tanzania, not just its scenery.' },
  { icon: MapPin, title: 'Tailor-Made Private Adventures', desc: 'No two travelers are alike. Our destination specialists design every itinerary around your pace, preferences, and dreams — combining wildlife, mountains, culture, and coast in perfect harmony.' },
  { icon: Truck, title: 'Airport Transfers & Travel Support', desc: 'From your first landing at Kilimanjaro International Airport to your final departure, we coordinate every transfer, connection, and logistics detail so you can focus entirely on the experience.' },
]

const team = [
  { name: 'Nelson Mwangi', role: 'Founder & Lead Safari Specialist', bio: 'Born in the foothills of Kilimanjaro, Nelson spent his childhood listening to the roar of the Serengeti wind and the call of the bush. Over two decades as a field guide and destination architect, he has quietly built Nelson Tours and Safaris into one of Tanzania\'s most respected adventure companies — combining deep local wisdom with a fierce passion for extraordinary hospitality.', image: '/images/team/nelson.jpg' },
  { name: 'Amina Rashid', role: 'Safari Operations Manager', bio: 'A graduate of conservation biology with field seasons in the Ngorongoro highlands and the Selous ecosystem, Amina oversees every logistical thread of our safari departures. Her obsessive attention to detail ensures that each trip departs precisely as planned — and that every guest returns home with a story worth telling for life.', image: '/images/team/amina.jpg' },
  { name: 'David Kimaro', role: 'Senior Kilimanjaro Mountain Guide', bio: 'David has summited Kilimanjaro over two hundred and forty times. A UIMLA-certified high-altitude guide, he is trained in wilderness first aid, supplemental oxygen protocols, and altitude acclimatisation strategy. His calm authority on the mountain has turned anxious climbers into confident summiteers for fifteen consecutive years.', image: '/images/team/david.jpg' },
]

const safetyItems = [
  { title: 'Altitude Medicine & Oxygen Support', desc: 'All Kilimanjaro expeditions carry supplemental oxygen and pulse oximeters. Our guides conduct daily health checks and are empowered to make descent decisions for guest safety.' },
  { title: 'Wilderness First Aid Certified Crew', desc: 'Every senior guide and mountain crew leader holds current wilderness first aid certification. Medical emergency protocols are rehearsed before every departure.' },
  { title: 'Regularly Inspected Safari Vehicles', desc: 'Our 4×4 Land Cruisers are serviced every 5,000 kilometres. Pre-departure mechanical checks are conducted on every safari departure — no exceptions.' },
  { title: 'Carefully Inspected Mountain Equipment', desc: 'Tents, sleeping systems, cooking equipment, and personal safety gear are inspected after every expedition and replaced at the first sign of wear.' },
  { title: '24/7 In-Field Support', desc: 'Our operations team is contactable around the clock during active tours. If anything changes — weather, logistics, health — our response time is measured in minutes, not hours.' },
]

const responsibilityItems = [
  { icon: Heart, title: 'Fair Wages for All Our Team', desc: 'Every guide, porter, cook, and driver earns a living wage that significantly exceeds the regional average. We believe a rewarded team delivers exceptional experiences.' },
  { icon: Leaf, title: 'Porter Welfare Code', desc: 'We strictly follow the Kilimanjaro Porters Assistance Project (KPAP) guidelines — ensuring fair loads, proper equipment, sufficient food, and dignified treatment for every mountain porter.' },
  { icon: Globe, title: 'Community Investment', desc: 'A portion of every booking goes toward supporting local schools, water infrastructure projects, and community-run conservation initiatives in the regions we operate.' },
  { icon: Shield, title: 'Low-Impact Conservation Ethics', desc: 'We operate in strict accordance with national park regulations, avoid sensitive habitats, and educate every guest on responsible wildlife interaction and environmental stewardship.' },
]

export default function About() {
  const { aboutHeroImage, storyImage1, storyImage2, aboutTeam1Image, aboutTeam2Image, aboutTeam3Image } = useSiteSettings()
  const heroImg   = resolveImageUrl(aboutHeroImage) || '/images/sections/story-guides.jpg'
  const block1Img = resolveImageUrl(storyImage1)    || '/images/sections/story-guides.jpg'
  const block2Img = resolveImageUrl(storyImage2)    || '/images/sections/story-luxury.jpg'
  const teamImgs  = [
    resolveImageUrl(aboutTeam1Image) || '/images/team/nelson.jpg',
    resolveImageUrl(aboutTeam2Image) || '/images/team/amina.jpg',
    resolveImageUrl(aboutTeam3Image) || '/images/team/david.jpg',
  ]

  return (
    <main className="bg-beige">

      {/* ── 1. HERO — Who We Are ──────────────────────────────────── */}
      <section className="relative min-h-[62vh] flex flex-col justify-end bg-green-950 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Tanzania safari at sunrise" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-950/60 to-green-950/10" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-36 pb-20">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">
            Who We Are
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl mb-5">
            Tanzania's Most Trusted Safari & Adventure Specialists
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.22 }} className="font-sans text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed mb-8">
            Nelson Tours and Safaris is a Tanzanian-owned, Arusha-based travel company dedicated to one mission: crafting life-changing adventures across Africa's most extraordinary landscapes. We are safari planners, mountain guides, beach escape architects and cultural storytellers — united by an unshakeable love for this land and an unwavering commitment to the guests who trust us to show it to them.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }} className="flex flex-wrap gap-6">
            {stats.map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center min-w-[110px]">
                <p className="font-serif text-2xl font-bold text-gold">{s.value}</p>
                <p className="font-sans text-xs text-white/70 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 2. OUR STORY & PASSION ────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-center mb-20 lg:mb-28">
            <motion.div {...fadeLeft} className="w-full lg:w-1/2 flex-shrink-0">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                <img src={block1Img} alt="Nelson guide tracking wildlife at dawn" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute -bottom-6 -left-6 w-44 h-44 rounded-3xl bg-gold/10 -z-10 hidden sm:block" />
              </div>
            </motion.div>
            <motion.div {...fadeRight} className="w-full lg:w-1/2">
              <span className="section-label block mb-4">Our Story &amp; Passion</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-green-950 leading-tight mb-5">
                Rooted in Tanzania. <br />Built on Passion.
              </h2>
              <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-4">
                Nelson Tours and Safaris was not built in a boardroom. It was born on the red volcanic soils of Arusha, under the watchful silhouette of Mount Kilimanjaro, from a simple but powerful belief: that Tanzania is one of the most extraordinary places on Earth — and that every human being who visits it deserves to experience its full, unfiltered wonder.
              </p>
              <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-6">
                Our founder, Nelson, grew up listening to the rhythm of the Serengeti. He spent years as a field guide before assembling a team of equally passionate local professionals — naturalists, mountain climbers, cultural guides and hospitality specialists — each driven by the same quiet pride in Tanzania's landscapes, wildlife, and people. What began as a dream to share this land honestly and beautifully has grown into one of Tanzania's most trusted adventure companies.
              </p>
              {['Deep roots in Tanzanian culture and wilderness', 'Team of certified naturalists and mountain professionals', 'TTB & TATO fully licensed and insured operator'].map(b => (
                <div key={b} className="flex items-center gap-3 mb-3">
                  <CheckCircle size={16} className="text-gold flex-shrink-0" />
                  <span className="font-sans text-sm text-gray-700">{b}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Block 2 — Mission */}
          <div className="flex flex-col lg:flex-row-reverse gap-14 lg:gap-20 items-center">
            <motion.div {...fadeRight} className="w-full lg:w-1/2 flex-shrink-0">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                <img src={block2Img} alt="Luxury tented camp in the Serengeti" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute -bottom-6 -right-6 w-44 h-44 rounded-3xl bg-gold/10 -z-10 hidden sm:block" />
              </div>
            </motion.div>
            <motion.div {...fadeLeft} className="w-full lg:w-1/2">
              <span className="section-label block mb-4">Our Mission</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-green-950 leading-tight mb-5">
                Safe. Seamless. <br />Unforgettable.
              </h2>
              <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-4">
                Our mission is straightforward but profound: to deliver safe, seamless and genuinely life-enriching African adventures for every single guest who chooses to travel with us. We do not measure success by how many tours we run — we measure it by how many lives we transform.
              </p>
              <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-6">
                Whether you are standing at the rim of the Ngorongoro Crater watching ten thousand wildebeest move in silence below you, or reaching the snow-capped peak of Uhuru at 5,895 metres, or sipping coconut water on a Zanzibar dhow as the sun drops behind the Indian Ocean — we are committed to making every one of those moments perfect.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-green-950 hover:text-gold transition-colors duration-300 group gold-underline">
                Plan Your Journey <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. WHAT WE OFFER ──────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-beige">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="section-label mb-3">What We Offer</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-green-950 max-w-2xl mx-auto leading-tight">
              Six Ways to Experience the Magic of Tanzania
            </h2>
            <p className="font-sans text-gray-500 mt-4 max-w-xl mx-auto leading-relaxed">
              From the sweeping plains of the Serengeti to the turquoise shallows of Zanzibar, our portfolio covers every dimension of Tanzania's extraordinary appeal.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div key={s.title} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.08 }} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="w-11 h-11 rounded-xl bg-beige flex items-center justify-center mb-5">
                    <Icon size={20} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-green-950 mb-3">{s.title}</h3>
                  <p className="font-sans text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 5. WHY TRAVELERS CHOOSE US ────────────────────────────── */}
      <WhyChooseUs />

      {/* ── 6. OUR EXPERT TEAM ────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-green-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">Our Expert Team</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white max-w-2xl mx-auto leading-tight">
              The People Who Make Your Adventure Extraordinary
            </h2>
            <p className="font-sans text-white/60 mt-4 max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
              Behind every flawless safari departure, every successful Kilimanjaro summit, and every perfectly arranged beach escape is a dedicated team of Tanzanian professionals who care deeply about your experience.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {team.map((m, i) => (
              <motion.div key={m.name} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.12 }} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-colors duration-300">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={teamImgs[i]} alt={m.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" onError={e => { e.currentTarget.style.display='none' }} />
                </div>
                <div className="p-7">
                  <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-1">{m.role}</p>
                  <h3 className="font-serif text-xl font-semibold text-white mb-3">{m.name}</h3>
                  <p className="font-sans text-sm text-white/60 leading-relaxed">{m.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.p {...fadeUp} className="font-sans text-white/50 text-sm text-center max-w-2xl mx-auto leading-relaxed">
            Beyond our leadership team, Nelson Tours and Safaris employs over fifty field professionals — expert safari drivers, acclimatisation specialists, cultural interpreters, camp cooks, porters and logistics coordinators — each selected for their expertise, their character, and their genuine passion for Tanzania.
          </motion.p>
        </div>
      </section>

      {/* ── 7. SAFETY, COMFORT & RELIABILITY ─────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-start">
            <motion.div {...fadeLeft} className="w-full lg:w-1/2">
              <span className="section-label block mb-4">Safety &amp; Reliability</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-green-950 leading-tight mb-5">
                Your Safety Is Never Negotiable
              </h2>
              <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-6">
                At Nelson Tours and Safaris, safety is not a checkbox — it is the foundation on which every single departure is built. From the moment you land in Tanzania to your safe return home, our operational systems, trained personnel and emergency protocols are designed to give you — and your loved ones — complete peace of mind.
              </p>
              <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
                On Kilimanjaro, this means daily health monitoring, supplemental oxygen on hand, and a team empowered to prioritise your wellbeing over summit ambitions. On safari, it means meticulously maintained vehicles, communication systems and experienced drivers who know every terrain. Across all operations, it means 24/7 reachable support — because you should never feel alone in the field.
              </p>
              <div className="space-y-4">
                {safetyItems.map(s => (
                  <div key={s.title} className="flex gap-4 p-4 bg-beige rounded-xl border border-gray-100">
                    <CheckCircle size={18} className="text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-sans text-sm font-bold text-green-950 mb-1">{s.title}</p>
                      <p className="font-sans text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── 8. VEHICLES & OPERATIONS ── */}
            <motion.div {...fadeRight} className="w-full lg:w-1/2">
              <span className="section-label block mb-4">Vehicles &amp; Operations</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-green-950 leading-tight mb-5">
                World-Class Equipment. Seamless Logistics.
              </h2>
              <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-5">
                The quality of your Tanzania adventure depends significantly on the tools and logistics behind it. Our fleet of custom-fitted 4×4 Toyota Land Cruisers — the gold standard of African safari vehicles — features pop-up roof hatches for unobstructed game viewing, charging ports, refrigerated cool boxes, and ample storage for your gear.
              </p>
              <p className="font-sans text-gray-600 leading-relaxed text-base mb-5">
                Each vehicle is serviced on a strict schedule, fitted with emergency communication devices, and stocked with first aid equipment before every departure. Our drivers are qualified safari naturalists in their own right — not merely transport operators but active contributors to your wildlife experience.
              </p>
              <p className="font-sans text-gray-600 leading-relaxed text-base mb-6">
                On Kilimanjaro, our mountain equipment inventory is maintained to expedition-grade standards: four-season tents, rated sleeping systems, a full camp kitchen, and a dedicated porter welfare protocol. Our logistics team coordinates every connection — national park permits, accommodation bookings, airport pickups and onward transfers — with precision and care.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {['Custom 4x4 Land Cruiser fleet','Pre-departure mechanical checks','Expedition-grade mountain gear','National park permit management','Refrigerated game drive cool boxes','Seamless multi-destination logistics'].map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-gold flex-shrink-0 mt-0.5" />
                    <span className="font-sans text-xs text-gray-600 leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 9. RESPONSIBLE TOURISM ────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-beige">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="section-label mb-3">Responsible Tourism</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-green-950 max-w-2xl mx-auto leading-tight">
              Tanzania Gave Us Everything. <br />We Give Back Faithfully.
            </h2>
            <p className="font-sans text-gray-500 mt-4 max-w-xl mx-auto leading-relaxed">
              Responsible tourism is not a marketing phrase at Nelson Tours and Safaris — it is a deeply held obligation. We operate in some of the world's most sensitive ecosystems and serve communities whose livelihoods depend on ethical stewardship of this land.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {responsibilityItems.map((r, i) => {
              const Icon = r.icon
              return (
                <motion.div key={r.title} {...fadeUp} transition={{ duration: 0.55, delay: i * 0.09 }} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                  <div className="w-11 h-11 rounded-xl bg-beige flex items-center justify-center mb-5">
                    <Icon size={20} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans text-sm font-bold text-green-950 mb-2">{r.title}</h3>
                  <p className="font-sans text-xs text-gray-500 leading-relaxed">{r.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 10. HONEST BOOKING ────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-green-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-center">
            <motion.div {...fadeLeft} className="w-full lg:w-1/2">
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-4">Honest Booking</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-5">
                Clarity, Confidence and Complete Trust
              </h2>
              <p className="font-sans text-white/70 leading-relaxed text-base sm:text-lg mb-4">
                Planning an international safari or Kilimanjaro expedition is a significant investment — financially, emotionally and logistically. At Nelson Tours and Safaris, we take that responsibility with the utmost seriousness.
              </p>
              <p className="font-sans text-white/70 leading-relaxed text-base mb-6">
                From your very first enquiry, we provide clear, itemised quotations with zero hidden fees. Our booking process is transparent at every stage — what is included, what is not, how payments are structured, and what happens if your plans change. We use secure, internationally trusted payment methods, and our guest support team is available at every step to answer questions, suggest alternatives and ensure your confidence never wavers.
              </p>
            </motion.div>
            <motion.div {...fadeRight} className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { t: 'Transparent Pricing', d: 'Fully itemised quotes with no surprise charges — ever. What you see is exactly what you pay.' },
                { t: 'Secure Payment Systems', d: 'International card payments, bank transfers and installment options available with full receipt documentation.' },
                { t: 'Flexible Planning Support', d: 'Life changes. We offer flexible modification policies and work with you when circumstances shift.' },
                { t: 'Customer-First Communication', d: 'Our team responds within hours — not days. Your questions are never left unanswered.' },
                { t: 'Pre-Departure Briefings', d: 'Before you travel, we walk you through every detail — packing, health, park rules and what to expect.' },
                { t: 'Post-Trip Follow-Up', d: 'We check in after every journey. Your feedback shapes how we improve for every guest who follows.' },
              ].map(b => (
                <div key={b.t} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors duration-300">
                  <p className="font-sans text-xs font-bold text-gold mb-1.5">{b.t}</p>
                  <p className="font-sans text-xs text-white/55 leading-relaxed">{b.d}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 11. WHAT MAKES US DIFFERENT ───────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <p className="section-label mb-4">What Sets Us Apart</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-green-950 leading-tight mb-8">
              We Don't Sell Tours. <br className="hidden sm:block" />We Create Memories That Last a Lifetime.
            </h2>
            <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-6 max-w-3xl mx-auto">
              There are many operators who can arrange a vehicle, a park permit and an accommodation booking. What separates Nelson Tours and Safaris is something that cannot be listed on a specification sheet: the depth of care that flows through every interaction, every decision and every moment of every journey we curate.
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-6 max-w-3xl mx-auto">
              It is the guide who notices you watching a lion cub with particular fascination and quietly parks the vehicle at the perfect angle without being asked. It is the operations manager who remembers your anniversary and arranges a bottle of Tanzanian wine in your tent. It is the porter on the mountain who meets your exhausted eyes at Camp 4 and says, with complete conviction: <em>"You are going to make it."</em>
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-10 max-w-3xl mx-auto">
              These are the moments that define what we do. Not the logistical precision — though we pride ourselves on that too — but the human connection, the local wisdom, the genuine joy our team takes in showing you the land they love. Tanzania is extraordinary. But it is the people who guide you through it that make it unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tours" className="inline-flex items-center justify-center gap-2 bg-green-950 text-white font-sans text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-green-900 transition-colors duration-300">
                Explore Our Safaris <ArrowRight size={15} />
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-green-950 text-green-950 font-sans text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-green-950 hover:text-white transition-all duration-300">
                Talk to Our Team <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 12. CLOSING CALL TO ADVENTURE ─────────────────────────── */}
      <section className="relative py-28 sm:py-36 bg-green-950 overflow-hidden text-center">
        <div className="absolute inset-0 opacity-20">
          <img src="/images/sections/story-luxury.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-5">Your Adventure Awaits</p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-7">
              Tanzania Is Calling. <br />It Is Time to Answer.
            </h2>
            <p className="font-sans text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              The Serengeti does not wait. Kilimanjaro's glaciers will not last forever. The dhows of Zanzibar sail at dawn. If there is a journey inside you that has been waiting for the right guide, the right company and the right moment — this is it. Let Nelson Tours and Safaris be your trusted partner from first conversation to final farewell.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2.5 bg-gold hover:bg-gold/90 text-white font-sans font-semibold text-base px-10 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Begin Your Tanzania Story <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <CTASection />

    </main>
  )
}
