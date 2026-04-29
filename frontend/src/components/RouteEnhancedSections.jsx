import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CheckCircle, ShieldCheck, Thermometer, Tent, Star,
  ChevronDown, ArrowRight, Calendar, Heart, Wind,
  AlertTriangle, Zap, Users, Mountain, Sun
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.65 },
}

const SectionLabel = ({ children }) => (
  <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">{children}</p>
)

const SectionHeading = ({ children }) => (
  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-green-950 leading-tight mb-5">{children}</h2>
)

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-100 ${className}`}>{children}</div>
)

// ─────────────────────────────────────────────────────────────────────────────
// 9. FAQ Accordion
// ─────────────────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-beige/40 transition-colors duration-200"
      >
        <span className="font-sans text-sm font-semibold text-green-950">{q}</span>
        <ChevronDown
          size={18}
          className={`text-gold flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1 bg-beige/30 border-t border-gray-100">
              <p className="font-sans text-sm text-gray-600 leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function KilimanjaroEnhancedSections() {
  const faqs = [
    {
      q: 'Do I need mountaineering experience to climb Kilimanjaro?',
      a: 'No technical climbing experience is required. Kilimanjaro is a high-altitude trek, not a technical ascent — no ropes, ice axes, or specialist skills are needed. What matters is physical fitness, mental determination, and certified local guidance — all of which Nelson Tours and Safaris provides.',
    },
    {
      q: 'What happens if I develop altitude sickness on the mountain?',
      a: `Your safety is our absolute priority. Every Nelson Tours and Safaris team carries a pulse oximeter for continuous monitoring and emergency supplemental oxygen. If a guest shows symptoms of Acute Mountain Sickness (AMS) that do not respond to rest and hydration, our certified guides are trained to initiate an immediate descent. No summit is worth a life — and our guides have the authority and training to act swiftly.`,
    },
    {
      q: 'How physically fit do I need to be before attempting this climb?',
      a: `You do not need to be an elite athlete, but a meaningful base of cardiovascular fitness is essential. We recommend three to four months of preparation before your climb — including regular hiking, stair climbs with a loaded backpack, and sustained aerobic exercise. Guests who arrive undertrained frequently struggle in the upper altitude zones. Your guides can only do so much; your preparation determines your summit chances more than any other single factor.`,
    },
    {
      q: 'What is the best time of year to climb Kilimanjaro?',
      a: `Kilimanjaro can be climbed year-round, but the optimal windows are January–March and June–October. These dry seasons offer the most stable trail conditions, clearer summit views, and lower precipitation on the upper mountain. The long rainy season (April–May) and short rains (November) are possible but bring muddier trails and reduced visibility. Our operations team will advise you on the ideal window based on your travel dates.`,
    },
    {
      q: 'What is included in the Nelson Tours and Safaris Kilimanjaro package?',
      a: `Our Kilimanjaro packages include all national park fees, camping or hut accommodation, all meals on the mountain (breakfast, lunch, dinner, hot drinks), a certified lead guide, assistant guides, a professional cook, dedicated porters, emergency oxygen, first aid equipment, pre-climb briefing, and seamless Arusha hotel pick-up and drop-off. We believe in transparent, all-inclusive pricing with no surprise additions.`,
    },
    {
      q: 'How many porters will carry my gear, and are they treated fairly?',
      a: `Nelson Tours and Safaris strictly adheres to the Kilimanjaro Porters Assistance Project (KPAP) guidelines. Each porter carries a maximum regulated load, is provided with appropriate clothing and shelter, receives fair wages that significantly exceed the regional minimum, and is treated with the full dignity and respect they deserve. When you climb with us, you can be confident that every member of your mountain team is safe, fairly compensated, and proud of their work.`,
    },
    {
      q: 'Which Kilimanjaro route should I choose?',
      a: 'The right route depends on your experience, available days, budget, and preferred scenery. Machame is the most popular and scenic. Lemosho is the most beautiful. Marangu is the only hut route. Our team will guide you to the perfect choice during your pre-booking consultation.',
    },
    {
      q: 'Do I need travel insurance to climb Kilimanjaro?',
      a: `Comprehensive travel insurance that explicitly covers high-altitude trekking above 5,000 metres and helicopter evacuation is strongly required. Kilimanjaro is a serious high-altitude endeavour and medical evacuation from the mountain, if required, is expensive without adequate coverage. Our team will provide you with a recommended minimum insurance specification during your pre-departure briefing. This is non-negotiable for your safety and peace of mind.`,
    },
  ]

  const climateZones = [
    { zone: 'Cultivation Zone', alt: '800–1,800m', temp: '20–30°C', desc: 'Lush farmland and forest edge. Warm, humid and green — the gateway to the mountain.' },
    { zone: 'Rainforest Zone', alt: '1,800–2,800m', temp: '12–20°C', desc: 'Dense cloud forest with towering trees, moss, and frequent mist. Expect mud and cool evenings.' },
    { zone: 'Heath & Moorland', alt: '2,800–4,000m', temp: '5–15°C', desc: 'Open moorland with giant heathers and stunning views. The air begins to thin noticeably here.' },
    { zone: 'Alpine Desert', alt: '4,000–5,000m', temp: '-5–10°C', desc: 'Stark, rocky and exposed. Temperature swings are dramatic and altitude effects become real.' },
    { zone: 'Arctic Summit Zone', alt: '5,000–5,895m', temp: '-20–0°C', desc: 'Glaciers, ice fields and thin air. Summit night temperatures can plunge below -20°C. Preparation is everything.' },
  ]

  const safetyStandards = [
    { icon: ShieldCheck, title: 'UIMLA-Certified Lead Guides', desc: 'Every expedition is led by an internationally certified high-altitude guide with a minimum of five years of Kilimanjaro experience.' },
    { icon: Heart, title: 'Daily Pulse Oximetry Checks', desc: 'Blood oxygen saturation and heart rate are monitored every morning and evening. Any concerning reading triggers an immediate protocol review.' },
    { icon: Zap, title: 'Emergency Supplemental Oxygen', desc: 'Portable oxygen cylinders are carried on every expedition. Our guides are trained to administer supplemental oxygen calmly and competently.' },
    { icon: AlertTriangle, title: 'Altitude Sickness Observation', desc: 'AMS symptoms are assessed against the Lake Louise Score system. Our guides are empowered — and instructed — to initiate descent if clinical thresholds are reached.' },
    { icon: Users, title: 'Optimal Guide-to-Guest Ratios', desc: 'We never overload our teams. We maintain strict guide ratios so every guest receives attentive, personalised support throughout the climb.' },
    { icon: Mountain, title: 'Pole Pole — The Slow Pace Philosophy', desc: '"Pole pole" means slowly in Swahili, and it is the most important principle on Kilimanjaro. Our guides enforce a deliberate, unhurried pace that is the single greatest predictor of summit success.' },
  ]

  return (
    <div className="bg-[#faf8f3]">

      {/* ── 1. WHY CHOOSE THIS ROUTE ────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>The Mountain</SectionLabel>
            <SectionHeading>Why Climb Kilimanjaro?</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-5">
              At 5,895 metres, Mount Kilimanjaro is the highest peak in Africa and one of the Seven Summits. It rises in magnificent isolation from the plains of northern Tanzania, and it has drawn adventurers and determined trekkers from every corner of the world for well over a century. What makes Kilimanjaro extraordinary is not simply its altitude — it is the complete sensory journey it offers across five distinct climate ecosystems.
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              In the span of a single expedition you walk from equatorial rainforest through highland moorland, alpine desert, and glaciated summit terrain. You witness sunrises that reach across entire nations. And at Uhuru Peak, you understand precisely why climbers who have stood there say it changes something permanently. Nelson Tours and Safaris has guided thousands of people to that moment — and we are ready to guide you there too.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Superior acclimatisation profile with gradual altitude gain',
                'No technical mountaineering skills required',
                'Diverse landscapes from rainforest to arctic summit zone',
                'High summit success rate with our structured itinerary',
                'Suitable for fit, motivated adventurers of varying experience',
                "Supported by Nelson's expert mountain crew from base to summit",
              ].map(p => (
                <div key={p} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-gold flex-shrink-0 mt-0.5" />
                  <span className="font-sans text-sm text-gray-600">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. DIFFICULTY & ACCLIMATIZATION ────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-beige">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Difficulty & Acclimatization</SectionLabel>
            <SectionHeading>A Realistic Look at the Challenge</SectionHeading>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <p className="font-sans text-gray-600 leading-relaxed text-base mb-5">
                  Kilimanjaro is classified as a high-altitude trek, not a technical climb — but it demands genuine physical and mental commitment. The primary challenge is never the terrain; it is altitude. The summit at 5,895 metres sits well above the threshold at which acute mountain sickness becomes a serious concern for most people.
                </p>
                <p className="font-sans text-gray-600 leading-relaxed text-base">
                  This is precisely why itinerary length matters so profoundly. Each additional day at altitude allows your body to produce more red blood cells, improve oxygen efficiency, and reduce the likelihood of AMS symptoms. Climbers who choose longer itineraries consistently report better summit experiences, higher energy levels on summit night, and stronger descent performance. Our team always recommends the itinerary length that gives you the best realistic chance of reaching the top.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Terrain Type', val: 'Varied — forest, moorland, alpine desert, summit scree' },
                  { label: 'Summit Elevation', val: '5,895m (Uhuru Peak)' },
                  { label: 'Recommended Duration', val: '7–9 days (route dependent)' },
                  { label: 'Key Challenge', val: 'Altitude adaptation and summit night endurance' },
                  { label: 'Minimum Fitness Level', val: 'Moderate to good — 3–4 months of preparation advised' },
                  { label: 'Technical Skills Required', val: 'None — no ropes, ice axes or climbing experience needed' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between gap-4 py-3 border-b border-gray-200 last:border-0">
                    <span className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide">{r.label}</span>
                    <span className="font-sans text-sm text-gray-700 text-right">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 3. SAFETY STANDARDS ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-green-950">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <SectionLabel>Mountain Safety</SectionLabel>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
              Our Safety Standards on Kilimanjaro
            </h2>
            <p className="font-sans text-white/60 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              At Nelson Tours and Safaris, safety is the infrastructure beneath every summit attempt. It is not a feature of our service — it is the foundation of it.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {safetyStandards.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans text-sm font-bold text-white mb-2">{s.title}</h3>
                  <p className="font-sans text-xs text-white/55 leading-relaxed">{s.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 4. BEST TIME TO CLIMB ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>When to Climb</SectionLabel>
            <SectionHeading>Best Time to Climb Kilimanjaro</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              Kilimanjaro can be attempted in any month — but the conditions you encounter and the likelihood of a clear summit view vary significantly depending on when you choose to climb. Understanding the seasonal calendar is one of the most practical decisions you will make in your planning process.
            </p>
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <Card className="border-l-4 border-l-green-500">
                <div className="flex items-center gap-2 mb-3">
                  <Sun size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Peak Season — January to March</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  The first dry window of the year delivers settled skies, firm trail conditions, and excellent summit visibility. Temperatures are cooler, particularly at night, but the dryness of the air and the stability of weather patterns make this one of the finest climbing periods. January also tends to have fewer climbers on the mountain than the summer peak.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">Highly Recommended</span>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Peak Season — June to October</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  The long dry season is the most popular climbing window and for good reason — trails are dry, the summit views are spectacular, and the mountain atmosphere is at its most stable. July and August represent the absolute peak period with the highest climber volumes. Book well in advance if you plan to climb during these months.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">Most Popular Window</span>
              </Card>
              <Card className="border-l-4 border-l-amber-400">
                <div className="flex items-center gap-2 mb-3">
                  <Wind size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Shoulder Season — November & December</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  The short rains arrive in November and typically clear by mid-December. Trails become muddier in the lower zones and cloud cover can obscure summit views. However, December from mid-month onward improves considerably, and lower climber numbers mean a quieter, more solitary mountain experience.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">Possible with Preparation</span>
              </Card>
              <Card className="border-l-4 border-l-red-400">
                <div className="flex items-center gap-2 mb-3">
                  <Thermometer size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Long Rains — April & May</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  April and May bring the long rains to Tanzania. Lower trails become extremely muddy and slippery, cloud cover is persistent, and the summit experience is frequently obscured. Whilst technically possible, we advise against scheduling your climb in this window unless your dates are entirely fixed and unavoidable.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full">Not Recommended</span>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 5. FITNESS & TRAINING ────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-beige">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="w-full lg:w-3/5">
                <SectionLabel>Physical Preparation</SectionLabel>
                <SectionHeading>Fitness & Training Recommendations</SectionHeading>
                <p className="font-sans text-gray-600 leading-relaxed text-base mb-5">
                  The guides at Nelson Tours and Safaris have walked beside thousands of climbers over the years. The pattern is consistent and clear: the guests who prepare physically in the months before their climb enjoy a profoundly better experience than those who do not. You do not need to be an elite endurance athlete. But you do need to arrive with lungs that have been tested, legs that have been loaded, and a body that understands sustained aerobic effort.
                </p>
                <p className="font-sans text-gray-600 leading-relaxed text-base mb-6">
                  We recommend beginning a structured preparation programme at least three months before your departure date. The emphasis should be on sustained cardiovascular endurance, not raw strength or speed. Long days on your feet — especially uphill — are your most valuable training tool. If you have access to mountains or significant hills, use them regularly with a loaded backpack.
                </p>
              </div>
              <div className="w-full lg:w-2/5 space-y-3">
                {[
                  { period: '3–4 months before', act: 'Begin regular hiking 2–3× per week. Build duration progressively.' },
                  { period: '2 months before', act: 'Introduce backpack hikes with 8–10kg load. Target 15–20km days.' },
                  { period: '6 weeks before', act: 'Add stair climbing and cross-training. Simulate summit-night duration.' },
                  { period: '2 weeks before', act: 'Taper intensity. Prioritise sleep, hydration and nutrition.' },
                  { period: 'On arrival', act: 'Rest for 1–2 days in Arusha before your climb begins.' },
                ].map(t => (
                  <div key={t.period} className="bg-white rounded-xl px-5 py-4 border border-gray-100">
                    <p className="font-sans text-xs font-bold text-gold mb-0.5">{t.period}</p>
                    <p className="font-sans text-xs text-gray-600 leading-relaxed">{t.act}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 6. MOUNTAIN WEATHER & CLIMATE ZONES ─────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Climate & Conditions</SectionLabel>
            <SectionHeading>Five Climate Zones. One Extraordinary Mountain.</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-3">
              Climbing Kilimanjaro is, in the most literal sense, a journey through multiple worlds. In the space of several days, you pass from tropical warmth through temperate forest and open moorland into an alien arctic desert before emerging into the glaciated summit zone. No two days on the mountain feel remotely the same — and that variety is a defining part of the experience.
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              Summit night deserves special mention. Departing camp at midnight, temperatures regularly drop to -15°C or below, and a biting wind accelerates the wind-chill factor considerably. This is the moment for which your preparation, your layering system, and your guide's encouragement are most critical. It is cold, it is dark, it is difficult — and it is absolutely unforgettable.
            </p>
            <div className="space-y-3">
              {climateZones.map((z, i) => (
                <motion.div
                  key={z.zone}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 bg-beige/40 border border-gray-100 rounded-2xl px-6 py-4 hover:border-gold/30 transition-colors duration-300"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-950 text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="font-sans text-sm font-bold text-green-950">{z.zone}</span>
                      <span className="font-sans text-xs text-gray-400">{z.alt}</span>
                      <span className="font-sans text-xs font-semibold text-gold">{z.temp}</span>
                    </div>
                    <p className="font-sans text-xs text-gray-500 leading-relaxed">{z.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 7. CAMPING / HUT EXPERIENCE ──────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-beige">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>On-Mountain Comfort</SectionLabel>
            <SectionHeading>Life at Camp — What to Expect Each Day</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-6">
              Life on the mountain with Nelson Tours and Safaris is not a survival exercise — it is a fully supported expedition where your comfort, nutrition, and morale receive the same careful attention as your safety. Our mountain crew works quietly and efficiently to ensure your camp is ready, your meals are hot, and your experience is as comfortable as the mountain allows.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Tent, title: 'Quality Sleeping Tents', desc: 'Double-walled, four-season expedition tents are used on all our climbs — pitched by our crew before you arrive at camp, so you never arrive to a cold, unassembled site.' },
                { icon: Users, title: 'Dedicated Dining Tent', desc: 'A private mess tent is set up at each camp for your meals and briefings — providing shelter from the elements, a place to warm up, and a social space to process the day with your group.' },
                { icon: Star, title: 'Three Nutritious Meals Daily', desc: 'Our mountain cook prepares three full meals per day plus mid-hike snacks and unlimited hot drinks. Menus are designed to maximise energy, hydration, and morale at altitude.' },
                { icon: Heart, title: 'Professional Porter Team', desc: 'Our carefully selected porters carry your camp gear, food, and group equipment — so your load remains manageable and your energy is directed entirely toward the climb ahead.' },
                { icon: ShieldCheck, title: 'Evening Health Briefings', desc: 'Each evening, your lead guide conducts a health check, reviews the next day\'s route, and addresses questions and concerns. Transparency and communication are central to our climbing culture.' },
                { icon: CheckCircle, title: 'Morning Departure Routine', desc: 'We operate on a structured morning routine — wake-up call, warm water wash basin, breakfast, packed lunch handover — so you leave camp organised, fuelled, and focused for the day ahead.' },
              ].map((c, i) => {
                const Icon = c.icon
                return (
                  <Card key={c.title}>
                    <div className="w-10 h-10 rounded-xl bg-beige flex items-center justify-center mb-4">
                      <Icon size={18} className="text-gold" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-sans text-sm font-bold text-green-950 mb-2">{c.title}</h3>
                    <p className="font-sans text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                  </Card>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 8. WHAT MAKES NELSON DIFFERENT ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-green-950">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">The Nelson Difference</p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-5">
              Why Climbing with Nelson Tours and Safaris Is Different
            </h2>
            <p className="font-sans text-white/70 leading-relaxed text-base mb-5">
              Many operators can arrange a mountain permit, a tent, and a guide. What Nelson Tours and Safaris delivers is categorically different — it is a deeply personal, meticulously organised, locally authored expedition experience where your success is genuinely our success.
            </p>
            <p className="font-sans text-white/70 leading-relaxed text-base mb-8">
              Our guides do not simply walk alongside you — they read you. They notice when your pace is flagging before you do, when your breathing has changed, when you need encouragement or space. They share the stories of this mountain — the names of the peaks, the significance of the glaciers, the culture of the communities that live in Kilimanjaro's shadow. That knowledge, that care, and that pride of place is something no international operator can replicate. It is born from being here, being local, and genuinely loving this mountain.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Arusha-based team with deep local mountain expertise',
                'Personalised pre-climb consultation and itinerary planning',
                'Strict porter welfare compliance (KPAP certified standards)',
                'Consistent guide-to-guest ratios — never overloaded',
                'Real-time communication with our operations centre',
                'Post-climb feedback and continuous improvement culture',
                'Seamless Arusha hotel coordination and airport transfers',
                'Optional Zanzibar beach extension after your summit',
              ].map(p => (
                <div key={p} className="flex items-start gap-3">
                  <CheckCircle size={15} className="text-gold flex-shrink-0 mt-0.5" />
                  <span className="font-sans text-sm text-white/75">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 9. FAQs ──────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-10">
            <SectionLabel>Questions & Answers</SectionLabel>
            <SectionHeading>Frequently Asked Questions</SectionHeading>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. BOOKING CTA ──────────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 bg-green-950 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/images/sections/parallax-kilimanjaro.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-4">Reserve Your Expedition</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              The Summit Is Waiting. <br className="hidden sm:block" />Your Story Begins Now.
            </h2>
            <p className="font-sans text-white/65 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              The moment you take your first step onto Kilimanjaro, something shifts. The noise of daily life falls away. The mountain takes over. And every step forward brings you closer to standing at the highest point in Africa — 5,895 metres above the world, above the clouds, above every doubt you ever had about yourself. Nelson Tours and Safaris has guided thousands of climbers to that moment. It is time to begin your story.
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
