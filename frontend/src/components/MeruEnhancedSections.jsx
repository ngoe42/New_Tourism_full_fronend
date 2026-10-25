import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, ShieldCheck, Thermometer, Star,
  ChevronDown, ArrowRight, Calendar, Heart, Wind,
  AlertTriangle, Zap, Users, Mountain, Sun, TreePine, Tent
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

export default function MeruEnhancedSections() {
  const faqs = [
    {
      q: 'How difficult is Mount Meru compared to Kilimanjaro?',
      a: 'Mount Meru is moderately challenging — less demanding in altitude than Kilimanjaro (4,566m vs 5,895m) and shorter in duration. However, the summit ridge is technically more exposed than any point on Kilimanjaro\'s standard routes, requiring confident footwork on a narrow volcanic traverse with steep drops on both sides. Fit trekkers with no prior high-altitude experience can successfully complete Meru. No ropes, harnesses, or ice axes are required.',
    },
    {
      q: 'Is Mount Meru a good acclimatization climb before Kilimanjaro?',
      a: 'It is widely considered the gold standard for Kilimanjaro acclimatization. Reaching 4,566m on Meru, typically 4–7 days before attempting Kilimanjaro, allows your body to begin producing additional red blood cells and adapt its oxygen processing before you face the critical altitude band on Kili. Climbers who ascend Meru first report significantly lower incidence of altitude sickness on Kilimanjaro and substantially higher summit success rates.',
    },
    {
      q: 'Do I need an armed ranger on Mount Meru?',
      a: 'Yes — an armed park ranger escort is mandatory for all Mount Meru climbs. This is a TANAPA regulation because the mountain lies entirely inside Arusha National Park, which has resident wildlife populations including buffalo, elephant, and other large animals. The ranger walks with your group throughout the climb. This should be viewed as a privilege — it transforms the lower mountain sections into an authentic walking safari unlike anything else in high-altitude trekking.',
    },
    {
      q: 'What is the best time of year to climb Mount Meru?',
      a: 'Mount Meru has two primary climbing seasons. June through October is the long dry season with clear skies, firm trails, and stable temperatures. December through February offers exceptional conditions with fewer climbers and spectacular clarity for sunrise views of Kilimanjaro. The months of March through May and November bring heavier precipitation and reduced visibility. We guide year-round and will advise on current conditions when you enquire.',
    },
    {
      q: 'Where do climbers sleep on Mount Meru?',
      a: 'Mount Meru uses a TANAPA-managed hut system. There are two main huts: Miriakamba Hut at 2,515m and Saddle Hut at 3,570m. The huts provide dormitory-style bunk beds with mattresses, communal dining areas, and basic toilet facilities. Meals are prepared by your Nelson Tours mountain cook. You do not need to carry or pitch a tent. Sleeping bags and personal layers are provided or can be rented through Nelson Tours.',
    },
    {
      q: 'What wildlife might I encounter on the trail?',
      a: 'Mount Meru\'s lower slopes pass through Arusha National Park, one of Tanzania\'s richest wildlife ecosystems. Common sightings include Guereza colobus monkeys, buffalo, zebras, giraffes, warthogs, and antelope species including impala and bushbuck. Elephant sightings occur on the lower trails. The birdlife is exceptional, with dozens of endemic highland species visible throughout the ascent. Wildlife density decreases above the treeline but the lower day is genuinely comparable to a guided game walk.',
    },
    {
      q: 'How many porters and guides will be on our climb?',
      a: 'A standard Nelson Tours Meru expedition includes one lead guide, one assistant guide (groups of 3+), one mountain cook, one TANAPA-licensed armed ranger (mandatory), and a porter team. Our porters are paid fairly above the TANAPA minimum wage, equipped properly for each altitude zone, and treated with full respect as the backbone of every expedition.',
    },
    {
      q: 'Can I combine Mount Meru with a Tanzania safari?',
      a: 'Absolutely — and it is one of our most popular combinations. A classic Nelson Tours itinerary pairs a 5-day Meru experience with a 4–7 day Northern Tanzania safari circuit covering Serengeti, Ngorongoro Crater, Tarangire, and Lake Manyara. We handle all logistics as a single seamless package. We also offer a Meru + Kilimanjaro combo for climbers who want to reach both summits. Speak to our team and we will design the perfect custom itinerary around your dates.',
    },
  ]

  const altitudeZones = [
    { zone: 'Cultivation & Gate Zone', alt: '1,500–1,640m', temp: '18–28°C', desc: 'Warm, green farmland approaches to Momella Gate inside Arusha National Park. Wildlife sightings begin here — giraffes, zebras, and warthogs are common in the open grasslands.' },
    { zone: 'Rainforest Zone', alt: '1,640–2,500m', temp: '12–22°C', desc: 'Dense Afromontane forest alive with colobus monkeys, buffalo, and extraordinary birdlife. Your armed ranger escort is most active here. Cool evenings, misty mornings, and lush canopy overhead.' },
    { zone: 'Heath & Moorland Zone', alt: '2,500–3,600m', temp: '5–15°C', desc: 'Open heathland with giant heather, protea flowers, and increasingly panoramic views of the inner crater and ash cone. The air begins to thin noticeably. Dramatic and beautiful.' },
    { zone: 'Alpine Desert & Ridge', alt: '3,600–4,200m', temp: '-2–8°C', desc: 'Rocky, exposed terrain with the narrow summit ridge coming into view. The inner crater wall drops steeply on one side. Concentration and sure-footedness become essential. Temperature drops sharply at night.' },
    { zone: 'Summit Zone', alt: '4,200–4,566m', temp: '-10–0°C', desc: 'The final push along Cobra Point to Socialist Peak. Summit night temperatures drop well below zero. The reward: sunrise over Kilimanjaro\'s glaciers floating above the clouds — one of the most extraordinary views in East Africa.' },
  ]

  const safetyStandards = [
    { icon: ShieldCheck, title: 'TANAPA-Licensed Armed Ranger', desc: 'A mandatory armed park ranger accompanies every climb throughout the mountain — a legal requirement within Arusha National Park and a privilege that makes lower Meru a genuine walking safari.' },
    { icon: Heart, title: 'Twice-Daily Health Monitoring', desc: 'Blood oxygen saturation and heart rate are measured every morning and evening. Any concerning reading triggers an immediate protocol review and, if necessary, descent.' },
    { icon: Zap, title: 'Emergency Supplemental Oxygen', desc: 'Portable oxygen is carried on every expedition above Saddle Hut. Our guides are trained to administer supplemental oxygen calmly and competently in any emergency situation.' },
    { icon: AlertTriangle, title: 'AMS Assessment Protocol', desc: 'AMS symptoms are assessed against the Lake Louise Score system. Our guides are empowered and instructed to initiate immediate descent if clinical thresholds are reached. No summit attempt is worth a life.' },
    { icon: Users, title: 'Private Guide-to-Guest Ratios', desc: 'We never overload our teams. Every Nelson Tours Meru expedition is private — your own guide team, your own pace, your own dates. No shared groups, no compromises on attention.' },
    { icon: Mountain, title: 'Pole Pole — Deliberate Pacing', desc: '"Pole pole" — slowly slowly — is as important on Meru as on Kilimanjaro. Our guides enforce a deliberate, unhurried pace throughout. The summit ridge demands composure, not speed.' },
  ]

  return (
    <div className="bg-[#faf8f3]">

      {/* ── 1. WHY CLIMB MERU ───────────────────────────────────────────────── */}
      <section id="why-meru" className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>The Mountain</SectionLabel>
            <SectionHeading>Why Climb Mount Meru?</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-5">
              At 4,566 metres, Mount Meru is Tanzania's second-highest peak and Africa's fifth-highest mountain. An active stratovolcano sitting entirely within Arusha National Park, it combines high-altitude trekking, dramatic volcanic geology, and genuine African wildlife in a single extraordinary expedition — something no other major mountain climb on the continent can offer.
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              Meru's horseshoe crater, formed by an ancient catastrophic collapse, frames an inner landscape of breathtaking drama — a sheer volcanic wall dropping to a smoking ash cone at its heart. The summit ridge is narrow and exposed, the wildlife trail is genuinely untamed, and the sunrise view of Kilimanjaro from Socialist Peak at 4,566m is among the most extraordinary sights available to any adventurer in the world. Nelson Tours and Safaris has guided climbers to that summit through forest, moorland, and volcanic ridge — and we are ready to guide you there too.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'The ideal acclimatization climb before Kilimanjaro',
                'Wildlife trekking through Arusha National Park on the ascent',
                'Dramatically fewer climbers than Kilimanjaro — true wilderness',
                'Spectacular inner crater and volcanic ash cone scenery',
                'Comfortable TANAPA-managed mountain hut accommodation',
                'Sunrise view of Kilimanjaro from Socialist Peak at dawn',
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
            <SectionLabel>Difficulty &amp; Acclimatization</SectionLabel>
            <SectionHeading>A Realistic Look at the Challenge</SectionHeading>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <p className="font-sans text-gray-600 leading-relaxed text-base mb-5">
                  Mount Meru is classified as a moderate-to-challenging high-altitude trek. At 4,566m it sits comfortably below the altitude band where acute mountain sickness becomes severe, but the summit ridge demands something Kilimanjaro does not — confident, focused footwork on a narrow volcanic traverse with a sheer drop into the inner crater on one side and steep scree on the other.
                </p>
                <p className="font-sans text-gray-600 leading-relaxed text-base">
                  This is not a technical climb — no ropes, harnesses, or ice axes are required at any point. But the combination of pre-dawn cold, high altitude, physical fatigue, and exposed ridge terrain means that mental composure and reasonable fitness are essential. Our guides are with you at every step of the summit ridge, pacing deliberately and reading your condition continuously. The mountain rewards those who prepare and who trust the process.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Summit Elevation', val: '4,566m (Socialist Peak)' },
                  { label: 'Little Meru Point', val: '3,820m (acclimatization option)' },
                  { label: 'Recommended Duration', val: '3–4 days on the mountain' },
                  { label: 'Key Challenge', val: 'Summit ridge exposure at altitude' },
                  { label: 'Minimum Fitness Level', val: 'Moderate — 2–3 months preparation advised' },
                  { label: 'Technical Skills Required', val: 'None — non-technical trek throughout' },
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
              Our Safety Standards on Mount Meru
            </h2>
            <p className="font-sans text-white/60 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              At Nelson Tours and Safaris, safety is not a feature of our service — it is the foundation of it. Every decision on the mountain is guided by one principle: your wellbeing comes first.
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
            <SectionHeading>Best Time to Climb Mount Meru</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              Mount Meru can be climbed year-round, but like all East African mountains its conditions vary significantly by season. Understanding the seasonal calendar will help you choose the window that delivers the best experience — from trail conditions underfoot to the clarity of that life-defining Kilimanjaro sunrise from Socialist Peak.
            </p>
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <Card className="border-l-4 border-l-green-500">
                <div className="flex items-center gap-2 mb-3">
                  <Sun size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Long Dry Season — June to October</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  The most popular and reliable climbing window. Clear skies, firm trails, and stable temperatures characterise this period. July and August see the highest climber volumes — book well in advance. Summit views of Kilimanjaro are at their most spectacular during this window.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">Most Popular Window</span>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Short Dry Season — December to February</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  A superb alternative window with fewer climbers, excellent trail conditions, and exceptional summit clarity. January and February in particular offer some of the finest conditions of the year — drier than mid-year but with the mountain almost entirely to yourself.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">Highly Recommended</span>
              </Card>
              <Card className="border-l-4 border-l-amber-400">
                <div className="flex items-center gap-2 mb-3">
                  <Wind size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Shoulder Season — March &amp; November</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  Transitional months as the rains arrive or clear. Trails become muddier and cloud cover can obscure summit views, but the mountain is quiet and atmospheric. Possible with appropriate preparation and flexibility on expectations.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">Possible with Preparation</span>
              </Card>
              <Card className="border-l-4 border-l-red-400">
                <div className="flex items-center gap-2 mb-3">
                  <Thermometer size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Long Rains — April &amp; May</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  April and May bring heavy rainfall to northern Tanzania. Trails become extremely muddy, cloud cover is persistent, and the summit ridge can be dangerous when wet. Technically climbable but we advise against this window unless dates are entirely unavoidable.
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
                <SectionHeading>Fitness &amp; Training Recommendations</SectionHeading>
                <p className="font-sans text-gray-600 leading-relaxed text-base mb-5">
                  The guides at Nelson Tours and Safaris have accompanied thousands of climbers on East Africa's mountains. The pattern is consistent: guests who prepare physically enjoy a profoundly better experience than those who do not. Mount Meru does not demand elite athletic fitness, but the summit ridge at midnight — cold, exposed, and at 4,500m — will reveal exactly how your preparation has gone.
                </p>
                <p className="font-sans text-gray-600 leading-relaxed text-base mb-6">
                  We recommend beginning a structured preparation programme at least two to three months before your departure. The emphasis should be on sustained cardiovascular endurance, stable footing on uneven terrain, and mental resilience during extended effort. If you plan to continue on to Kilimanjaro after Meru, your preparation investment pays double dividends.
                </p>
              </div>
              <div className="w-full lg:w-2/5 space-y-3">
                {[
                  { period: '2–3 months before', act: 'Begin regular hiking 2–3× per week. Build duration progressively.' },
                  { period: '6 weeks before', act: 'Introduce backpack hikes with 6–8kg load. Target 12–18km days.' },
                  { period: '4 weeks before', act: 'Add stair climbing to simulate volcanic scree gradient. Build night tolerance.' },
                  { period: '2 weeks before', act: 'Taper intensity. Prioritise sleep, hydration and nutrition.' },
                  { period: 'On arrival', act: 'Rest 1 night in Arusha. Attend pre-climb briefing.' },
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

      {/* ── 6. ALTITUDE ZONES ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Climate &amp; Conditions</SectionLabel>
            <SectionHeading>Five Altitude Zones. One Extraordinary Mountain.</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-3">
              Climbing Mount Meru is a journey through dramatically different worlds in just three to four days. You begin in warm, wildlife-rich national park landscape and end on a narrow volcanic ridge above the clouds, with one of Africa's most iconic dawn views unfolding before you. Each zone has its own character, challenges, and unforgettable moments.
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              The summit zone deserves special mention. The final approach begins at midnight — cold, dark, and steep. The narrow summit ridge between Rhino Point and Cobra Point requires focused footwork and steady breathing. And then, as the sky lightens from black to deep violet to gold, you arrive at Socialist Peak with Kilimanjaro rising above the clouds ahead of you. It is the reward that makes every midnight step worthwhile.
            </p>
            <div className="space-y-3">
              {altitudeZones.map((z, i) => (
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

      {/* ── 7. HUT LIFE ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-beige">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>On-Mountain Comfort</SectionLabel>
            <SectionHeading>Life at the Huts — What to Expect Each Day</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-6">
              Unlike most high-altitude climbs, Mount Meru uses a TANAPA-managed mountain hut system — meaning no tent to pitch and no sleeping on cold ground. Your Nelson Tours cook and crew manage everything so you arrive at each hut to hot food, a warm bunk, and a health check from your guide. Life on Meru is a fully supported expedition, not a survival test.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Tent, title: 'TANAPA Mountain Huts', desc: 'Miriakamba Hut (2,515m) and Saddle Hut (3,570m) provide dormitory-style bunks with mattresses, communal dining areas, and toilet facilities. Your Nelson Tours cook prepares all meals on-site.' },
                { icon: Users, title: 'Dedicated Mountain Cook', desc: 'A professional mountain cook travels with your team throughout the climb — preparing hot breakfasts, packed lunches, and warm three-course dinners at every hut. Nutrition is central to your summit performance.' },
                { icon: Star, title: 'Three Nutritious Meals Daily', desc: 'Menus are designed to maximise energy, hydration, and morale at altitude — high-carbohydrate hot meals, soups, fresh fruit, hot drinks, and packed trail food between huts.' },
                { icon: Heart, title: 'Evening Health Briefings', desc: 'Each evening your lead guide conducts a health check, measures pulse oximetry readings, reviews the next day\'s route, and answers questions. Transparency and communication define our climbing culture.' },
                { icon: TreePine, title: 'Walking Safari on Arrival Day', desc: 'Day 1 through Arusha National Park is as much a wildlife experience as a mountain one. Your armed ranger escort makes this genuinely comparable to a guided game walk — giraffes, buffalo, colobus monkeys.' },
                { icon: CheckCircle, title: 'Morning Departure Routine', desc: 'Structured wake-up, warm wash basin, hot breakfast, packed lunch, gear check — so you leave each hut organised, fuelled, and focused for the day ahead. Nothing is left to chance.' },
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

      {/* ── 8. WHY NELSON TOURS ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-green-950">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">The Nelson Difference</p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-5">
              Why Climbing with Nelson Tours and Safaris Is Different
            </h2>
            <p className="font-sans text-white/70 leading-relaxed text-base mb-5">
              Many operators can arrange a mountain permit, a hut booking, and a guide. What Nelson Tours and Safaris delivers on Mount Meru is categorically different — a deeply personal, meticulously organised, locally authored expedition where your success is our success.
            </p>
            <p className="font-sans text-white/70 leading-relaxed text-base mb-8">
              Our guides were born in the shadow of these mountains. They know Meru's crater walls, its weather shifts, its wildlife movements, and its summit ridge with an intimacy that no international operator can replicate. They notice when your pace has changed before you do. They share the stories that make this mountain mean something beyond the summit sign. That knowledge, that care, and that genuine pride in their mountain is something that no amount of marketing can manufacture — it comes from being here, being local, and truly loving this place.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Arusha-based team with deep local Meru mountain expertise',
                'Personalised pre-climb consultation and custom itinerary planning',
                'Strict porter welfare compliance and above-minimum wages',
                'Private departures — your dates, your pace, your own guide team',
                'TANAPA and KINAPA licensed — full regulatory compliance',
                'Real-time communication with our Arusha operations centre',
                'Seamless hotel coordination and airport transfers',
                'Optional Kilimanjaro extension after your Meru summit',
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
            <SectionLabel>Questions &amp; Answers</SectionLabel>
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
          <img src="/images/sections/mount-meru-hero.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-4">Reserve Your Expedition</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Ready to Stand on <br className="hidden sm:block" />Socialist Peak?
            </h2>
            <p className="font-sans text-white/65 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              The summit ridge. The volcanic crater at your feet. Kilimanjaro rising above the clouds. The African sunrise painting the sky gold. This is what waits for you on Mount Meru — and Nelson Tours will get you there safely, professionally, and memorably.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="https://wa.me/255750005973" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-white font-sans font-semibold text-base px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                WhatsApp Our Team <ArrowRight size={16} />
              </a>
              <a href="/contact"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-sans font-semibold text-base px-8 py-4 rounded-full transition-all duration-300">
                Send an Enquiry <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
