import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CheckCircle, ShieldCheck, Thermometer, Star,
  ChevronDown, ArrowRight, Calendar, Heart, Wind,
  AlertTriangle, Zap, Users, Mountain, Sun, Compass, Backpack
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

export default function OldoinyoLengaiEnhancedSections() {
  const faqs = [
    {
      q: 'What does Oldoinyo Lengai mean?',
      a: 'Oldoinyo Lengai (also written Ol Doinyo Lengai) is a Maasai phrase meaning "Mountain of God." The Maasai people of northern Tanzania consider the volcano a sacred dwelling place of Engai, the Maasai supreme deity. The mountain holds deep spiritual significance for Maasai communities living around Lake Natron and the broader Rift Valley region, and that sacred identity is something your Nelson Tours guide will share with you throughout the trek.',
    },
    {
      q: 'Is Oldoinyo Lengai still an active volcano?',
      a: 'Yes — Oldoinyo Lengai is one of the most active volcanoes in Africa and one of only a handful of continuously active volcanoes on the continent. It has erupted multiple times in recent decades, with significant activity recorded in 2007–2008. Today the volcano continues to produce lava flows from vents in its crater. The level of activity varies, but the presence of steaming vents and active lava is part of what makes a summit visit so extraordinary. Your guide will assess conditions before your climb and our team monitors volcanic activity updates regularly.',
    },
    {
      q: 'What makes Oldoinyo Lengai geologically unique?',
      a: 'Oldoinyo Lengai is the only active volcano in the world that produces natrocarbonatite lava — a unique type of carbonate lava containing almost no silicon. This lava erupts at temperatures around 500°C (roughly half the temperature of basaltic lava), which means it appears almost black when it flows and cools rapidly to a white or grey powder-like crust on exposure to air and moisture. Geologists travel from around the world to study it. For visitors, it means standing at a crater rim that looks unlike any other volcano on Earth.',
    },
    {
      q: 'How difficult is the climb?',
      a: 'Oldoinyo Lengai is one of Tanzania\'s most physically demanding trekking challenges. The ascent is extremely steep — gradients of 45° to 60° are common on the upper sections — on loose volcanic ash and crumbling rock that shifts underfoot with every step. The climb typically takes 5 to 7 hours ascent and 2 to 3 hours descent. No technical mountaineering skills are required, but a high level of cardiovascular fitness, mental resilience, and experience with challenging terrain is strongly recommended. We rate this climb as strenuous and advise against it for first-time trekkers without a solid base fitness.',
    },
    {
      q: 'How long does the hike take?',
      a: 'The full summit experience typically takes 7 to 12 hours from trailhead to return. Trekkers depart the Lake Natron area at midnight or in the very early hours (00:00–01:00am) to time the summit for sunrise at approximately 4,500–5,000 steps of ascent. The descent, while faster, requires careful concentration on the loose volcanic surface. Most groups reach the crater rim between 5:00am and 7:00am depending on fitness and pace.',
    },
    {
      q: 'When is the best season to climb Oldoinyo Lengai?',
      a: 'The recommended climbing seasons are June to October (long dry season) and December to February (short dry season). During these windows the roads to Lake Natron are passable by 4WD vehicle, temperatures are more manageable, and trail conditions are at their most stable. The April–May long rains make the volcanic ash dangerously slippery and the access road frequently impassable. November brings unpredictable short rains. We guide year-round but will advise honestly on current conditions.',
    },
    {
      q: 'Can beginners attempt the Oldoinyo Lengai climb?',
      a: 'Oldoinyo Lengai is not recommended for first-time trekkers or those without a meaningful base of hiking fitness. The gradient, the loose surface, the midnight departure, the heat at lower altitudes, and the remoteness of the location combine to make this one of Tanzania\'s most demanding one-day trekking challenges. We recommend prior experience with multi-hour hikes on challenging terrain before attempting Lengai. We advise guests aged 16 and above. If you are unsure of your fitness level, contact our team and we will honestly assess your suitability.',
    },
    {
      q: 'Is it safe to climb Oldoinyo Lengai?',
      a: 'With the right operator, experienced local guides, and appropriate preparation, Oldoinyo Lengai is a safe and extraordinary adventure. Nelson Tours uses certified local Maasai guides who know the mountain intimately — including its current volcanic activity levels, loose sections, and weather patterns. We carry first aid equipment on every climb, monitor volcanic activity in advance of departures, and maintain contact with our Arusha base throughout the climb. The volcano\'s active nature means we reserve the right to postpone or cancel any climb if conditions are assessed as unsafe.',
    },
    {
      q: 'Can Oldoinyo Lengai be combined with a Tanzania safari?',
      a: 'Absolutely — and it is one of our most popular adventure additions. Oldoinyo Lengai combines naturally with a Lake Natron flamingo excursion, a Maasai cultural boma visit, and the Ngare Sero waterfall walk. It also pairs perfectly with a full Northern Tanzania safari circuit covering Serengeti, Ngorongoro Crater, and Tarangire — typically as either an opening adventure or a post-safari highlight. Many guests also combine Lengai with a Kilimanjaro or Mount Meru climb. Our team will design the perfect itinerary around your dates and interests.',
    },
  ]

  const altitudeZones = [
    { zone: 'Lake Natron Base', alt: '600–900m', temp: '28–38°C', desc: 'The Rift Valley floor is hot, flat, and otherworldly. The soda lake shimmers pink with flamingos. The trailhead village of Engare Sero is your staging point. Depart in darkness — the heat makes daytime climbing dangerous and unpleasant.' },
    { zone: 'Lower Slopes', alt: '900–1,500m', temp: '22–30°C', desc: 'The initial gradient is moderate through scrubby Rift Valley vegetation and volcanic rock. Your guide establishes the rhythm — slow, deliberate, and sustainable. The temperature is still warm; hydration is critical here.' },
    { zone: 'Mid-Mountain', alt: '1,500–2,300m', temp: '12–20°C', desc: 'The gradient steepens significantly. Loose volcanic ash and crumbling dark rock become the dominant surface. Footholds require care. The rift valley below begins to recede as the sky lightens to deep indigo. Pace is everything.' },
    { zone: 'Upper Slopes', alt: '2,300–2,800m', temp: '5–12°C', desc: 'The steepest and most demanding section. Gradients reach 50–60° in places. Hands are used on the upper section. The volcanic surface is unstable — your guide knows the stable lines. You are above the clouds now, and the world below is beginning to glow.' },
    { zone: 'Summit Crater Rim', alt: '2,878–2,962m', temp: '0–8°C', desc: 'The crater rim reveals the extraordinary interior — active lava vents, black and grey carbonatite flows, steaming fumaroles. Lake Natron appears as a vast pink mirror far below. The Great Rift Valley escarpments stretch to the horizon. This is why you came.' },
  ]

  const safetyStandards = [
    { icon: ShieldCheck, title: 'Licensed Maasai Summit Guides', desc: 'Every Lengai climb is led by certified local Maasai guides who have summited the mountain dozens or hundreds of times. Their knowledge of the mountain\'s volcanic behaviour, unstable sections, and safe lines is irreplaceable.' },
    { icon: Heart, title: 'Pre-Climb Health Assessment', desc: 'Before departure from Lake Natron, your guide conducts a health and fitness assessment. Guests showing signs of illness, dehydration, or heat exhaustion are advised to rest rather than attempt the summit. Your safety overrides any other consideration.' },
    { icon: AlertTriangle, title: 'Volcanic Activity Monitoring', desc: 'We monitor volcanic activity reports in the days before every scheduled climb. If conditions at the crater are assessed as dangerous by our guide team or by TANAPA authorities, the climb is postponed. No exceptions.' },
    { icon: Zap, title: 'Emergency First Aid Support', desc: 'A comprehensive first aid kit is carried on every summit attempt. Our guides are trained in wilderness first aid and emergency response protocols. Emergency contact procedures with the nearest medical facility are in place for all departures.' },
    { icon: Users, title: 'Small Private Group Policy', desc: 'We do not run shared group climbs on Oldoinyo Lengai. Every departure is private — your own guide, your own pace, your own safety margins. This is not a mountain to rush or overload with strangers.' },
    { icon: Mountain, title: 'Midnight Departure Protocol', desc: 'All Lengai climbs depart at midnight or in the early hours specifically to avoid the brutal Rift Valley heat during ascent and to time the summit for sunrise. This is not optional — it is a core safety principle of every responsible Lengai operator.' },
  ]

  return (
    <div className="bg-[#faf8f3]">

      {/* ── 1. WHY CLIMB OLDOINYO LENGAI ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>The Mountain of God</SectionLabel>
            <SectionHeading>Why Climb Oldoinyo Lengai?</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-5">
              Rising from the soda flats of the Great Rift Valley near the shores of Lake Natron in northern Tanzania, Oldoinyo Lengai — the "Mountain of God" — is one of the most geologically extraordinary and spiritually significant landforms on Earth. It is the only active volcano in the world that produces natrocarbonatite lava: a rare, carbonite-rich magma that erupts at temperatures far lower than conventional volcanoes, flowing black and cooling rapidly to a white powdery crust that gives the crater floor a surface unlike anything else in the natural world.
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-5">
              To the Maasai people who have lived in the shadow of this volcano for generations, Lengai is the earthly home of Engai — their supreme deity. The mountain is not simply a geographic feature; it is the axis of their spiritual world. Climbing it is, for many visitors, an experience that transcends adventure and becomes something quieter and more profound — a sense of moving through a landscape that carries weight far older than trekking routes or summit certificates.
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              The climb itself is startlingly different from any other mountain in Tanzania. You depart at midnight from the Lake Natron basin — hot, flat, and glowing with the reflections of flamingo colonies on the alkaline water — and ascend steeply through darkness on loose volcanic ash and crumbling carbonatite rock. The gradient is relentless, the surface treacherous underfoot, and the effort immense. And then, as the first light breaks over the Rift Valley escarpments and you haul yourself onto the crater rim, the world unfolds below you in one of the most extraordinary dawn panoramas in Africa. This is Lengai. There is nothing else like it.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Summit Tanzania\'s sacred Mountain of God at 2,962m',
                'Active volcano producing the world\'s rarest "cold lava"',
                'Midnight ascent timed for sunrise over Lake Natron',
                'Steep, thrilling and genuinely challenging for adventure trekkers',
                'Deep Maasai cultural and spiritual significance',
                'Remote Rift Valley wilderness — far from mass tourism',
                'Best combined with Lake Natron flamingo excursion',
                'Pairs perfectly with Kilimanjaro, Meru or Northern Circuit safari',
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

      {/* ── 2. DIFFICULTY & ROUTE ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-beige">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Difficulty &amp; Route</SectionLabel>
            <SectionHeading>A Realistic Look at the Challenge</SectionHeading>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <p className="font-sans text-gray-600 leading-relaxed text-base mb-5">
                  Oldoinyo Lengai is widely considered one of Tanzania's most physically demanding one-day trekking challenges. The mountain rises steeply from the Rift Valley floor at approximately 600 metres to the crater rim at 2,962 metres — a raw altitude gain of over 2,300 metres on an unstable volcanic surface that tests every step. There are no switchbacks in the conventional sense on the upper section; you climb directly, using hands and feet on loose ash, carbonatite rock, and crumbling ridgelines.
                </p>
                <p className="font-sans text-gray-600 leading-relaxed text-base">
                  This is not technical mountaineering — no ropes, harnesses, or specialist equipment are required. But the combination of extreme gradient, volcanic surface, pre-dawn departure, heat at lower altitudes, and total remoteness from any medical facility means that fitness, experience, and mental resilience are non-negotiable. We recommend this climb for experienced hikers aged 16 and above with a strong base of cardiovascular and muscular endurance.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Summit Elevation', val: '2,962m (Crater Rim)' },
                  { label: 'Altitude Gain', val: '~2,300m from trailhead' },
                  { label: 'Trekking Duration', val: '7–12 hours round trip' },
                  { label: 'Difficulty Rating', val: 'Strenuous — very high' },
                  { label: 'Minimum Age', val: '16 years recommended' },
                  { label: 'Technical Skills', val: 'None — non-technical throughout' },
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
              Our Safety Standards on Oldoinyo Lengai
            </h2>
            <p className="font-sans text-white/60 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Oldoinyo Lengai is a remote, active volcano with real hazards. Nelson Tours and Safaris does not take these lightly. Every departure is planned, monitored, and led by people who know this mountain.
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

      {/* ── 4. BEST TIME TO TREK ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>When to Trek</SectionLabel>
            <SectionHeading>Best Time to Climb Oldoinyo Lengai</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              The road to Lake Natron and the condition of the volcanic trail are both heavily influenced by Tanzania's seasonal rainfall. Choosing the right window is not just about comfort — it is a practical safety and logistics consideration. Here is our honest seasonal guide for planning your Lengai trek.
            </p>
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <Card className="border-l-4 border-l-green-500">
                <div className="flex items-center gap-2 mb-3">
                  <Sun size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Long Dry Season — June to October</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  The most reliable and popular trekking window. Roads to Lake Natron are accessible by 4WD, the volcanic trail is at its most stable, and the flamingos on Lake Natron are spectacular. Temperatures are cooler — particularly important for the lower altitude sections of the climb.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">Most Popular Window</span>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Short Dry Season — December to February</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  A superb alternative window with fewer trekkers and excellent conditions. Lake Natron flamingo numbers are often at their highest in January–February. The summit views in the clear dry-season air are extraordinary. Book early as this is a popular window for combined safari packages.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">Highly Recommended</span>
              </Card>
              <Card className="border-l-4 border-l-amber-400">
                <div className="flex items-center gap-2 mb-3">
                  <Wind size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Shoulder Season — March &amp; November</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  Transitional months. The access road becomes progressively muddier and the volcanic ash surface on the mountain becomes slippery when wet. Possible in early March and late November, but flexibility on dates is essential. Contact us and we will advise on current conditions.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">Possible with Flexibility</span>
              </Card>
              <Card className="border-l-4 border-l-red-400">
                <div className="flex items-center gap-2 mb-3">
                  <Thermometer size={18} className="text-gold" />
                  <h3 className="font-sans text-sm font-bold text-green-950">Long Rains — April &amp; May</h3>
                </div>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-3">
                  The access road to Lake Natron is frequently impassable during the long rains. The volcanic ash surface becomes extremely slippery and dangerous. We do not operate Lengai climbs in April and May as a standard policy. Safety is not negotiable.
                </p>
                <span className="inline-block font-sans text-xs font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full">Not Operated</span>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 5. ITINERARY ──────────────────────────────────────────────────────── */}
      <section id="itinerary" className="py-16 sm:py-20 bg-beige">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Day-by-Day Itinerary</SectionLabel>
            <SectionHeading>The 2-Day Oldoinyo Lengai &amp; Lake Natron Experience</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              Our recommended Oldoinyo Lengai programme combines the summit trek with a full day of Rift Valley exploration — the flamingo shoreline, the Ngare Sero waterfall, and the extraordinary landscape of Lake Natron basin. Choose from our carefully designed trekking options or ask us to build a custom itinerary around your available days.
            </p>

            <div className="space-y-6">
              {/* Day 1 */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-green-950 px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-sans text-xs font-bold text-gold">Day 1</span>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white">Arusha to Lake Natron — Rift Valley, Waterfalls &amp; Maasai Lands</h3>
                </div>
                <div className="p-6 sm:p-7">
                  <p className="font-sans text-sm text-gray-600 leading-relaxed mb-4">
                    Your expedition departs Arusha in the early morning in a private 4WD vehicle. The drive north is a journey into one of Tanzania's most remote and spectacular landscapes — winding through Maasai villages, past the Ngorongoro Highlands escarpment, and eventually dropping dramatically into the Great Rift Valley as the road descends to the soda flats of Lake Natron. The shifting terrain, the changing vegetation, and the increasingly volcanic character of the landscape tell you that you are entering somewhere genuinely different. Allow 4–5 hours driving with stops.
                  </p>
                  <p className="font-sans text-sm text-gray-600 leading-relaxed mb-4">
                    On arrival in the Engaresero area, check in to your lodge or tented camp with views of the lake and the silhouette of Oldoinyo Lengai rising from the Rift Valley floor ahead of you. The afternoon offers an optional guided walk to the Ngare Sero waterfalls — a hidden gem where a freshwater river carves through volcanic rock into crystal pools before meeting the soda lake. In the late afternoon, drive or walk to the Lake Natron shoreline for sunset — the flamingo flocks, the alkaline surface reflecting the fading light, and Lengai standing sentinel above it all. Dinner and early rest. Tomorrow begins at midnight.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {[
                      { label: 'Drive', val: '4–5 hours' },
                      { label: 'Meals', val: 'Lunch & Dinner' },
                      { label: 'Overnight', val: 'Lake Natron Lodge' },
                      { label: 'Activity', val: 'Waterfall Walk' },
                    ].map(d => (
                      <div key={d.label} className="bg-[#faf8f3] rounded-xl px-4 py-3 border border-[#e8e0d0]">
                        <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider">{d.label}</p>
                        <p className="font-sans text-xs font-bold text-green-950 mt-0.5">{d.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Day 2 */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-green-950 px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-sans text-xs font-bold text-gold">Day 2</span>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white">Midnight Summit Trek — Crater Rim, Sunrise &amp; Return to Arusha</h3>
                </div>
                <div className="p-6 sm:p-7">
                  <p className="font-sans text-sm text-gray-600 leading-relaxed mb-4">
                    At 00:00–01:00am your guide wakes you. Headlamps on, trekking poles in hand, summit pack prepared. The night air at the Lake Natron basin is warm and electric with the sound of the Rift Valley. You transfer to the trailhead at the foot of Lengai and begin. The initial sections are steep and immediately demanding. Your Maasai guide sets a deliberate and sustainable pace, establishing rest points at each significant altitude gain. The mountain rises ahead of you in the darkness, an immense black shape against the stars.
                  </p>
                  <p className="font-sans text-sm text-gray-600 leading-relaxed mb-4">
                    As you climb through the mid-mountain section, the Lake Natron basin spreads below — the pink alkaline surface glowing faintly in the pre-dawn light, the flamingo roosts stirring at the water's edge. The upper section is the crux: loose carbonatite ash, gradients that demand hands and feet, and a surface that moves with every step. Your guide knows the stable lines. The sky begins to pale. A deep purple spreads across the horizon. You can see the Rift Valley escarpments stretching away in both directions. And then — the crater rim.
                  </p>
                  <p className="font-sans text-sm text-gray-600 leading-relaxed mb-4">
                    Standing on the crater rim of Oldoinyo Lengai at sunrise, looking into an active volcano as the sun clears the escarpment and lights up Lake Natron below, is one of the most viscerally extraordinary experiences available to any adventurer anywhere in East Africa. The carbonatite vents steam quietly. The crater floor is a surreal landscape of black flows and white crusts. Your guide shares what this moment means to the Maasai. The views — Natron, the Rift, the endless wilderness — are genuinely unlike anything else you will ever see.
                  </p>
                  <p className="font-sans text-sm text-gray-600 leading-relaxed mb-4">
                    Descent follows the ascent route — slower than you might expect on the loose surface, requiring full concentration throughout. Back at the lodge for a hot shower, a full cooked breakfast, and time to process what you have just done. Transfer back to Arusha in the afternoon, arriving in the early evening.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {[
                      { label: 'Departure', val: '00:00–01:00am' },
                      { label: 'Trek Time', val: '7–12 hours' },
                      { label: 'Summit', val: '2,962m crater rim' },
                      { label: 'Return', val: 'Arusha evening' },
                    ].map(d => (
                      <div key={d.label} className="bg-[#faf8f3] rounded-xl px-4 py-3 border border-[#e8e0d0]">
                        <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider">{d.label}</p>
                        <p className="font-sans text-xs font-bold text-green-950 mt-0.5">{d.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions / Exclusions */}
            <div className="grid sm:grid-cols-2 gap-6 mt-10">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-sans text-sm font-bold text-green-950 mb-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-gold" /> Package Includes
                </h3>
                <div className="space-y-2">
                  {[
                    'All trekking permits and local community conservation fees',
                    'Private 4WD transport Arusha → Lake Natron → Arusha',
                    'Lake Natron accommodation — lodge or tented camp (1 night)',
                    'All meals from Day 1 lunch to Day 2 breakfast',
                    'Experienced English-speaking driver-guide',
                    'Licensed Maasai summit guide throughout climb',
                    'Packed summit breakfast and drinking water',
                    'First aid kit and emergency safety support',
                    'Optional Ngare Sero waterfall guided walk',
                    'All government taxes and conservation charges',
                  ].map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={13} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-sans text-xs text-gray-600">{i}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-sans text-sm font-bold text-green-950 mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-gray-400" /> Not Included
                </h3>
                <div className="space-y-2 mb-6">
                  {[
                    'International flights to Tanzania',
                    'Tanzania entry visa',
                    'Travel and medical insurance (required)',
                    'Porter service (available on request)',
                    'Tips and gratuities for guides and staff',
                    'Personal expenses and souvenirs',
                    'Beverages not specified in the package',
                  ].map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-gray-300 text-xs flex-shrink-0 mt-0.5">—</span>
                      <span className="font-sans text-xs text-gray-500">{i}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#faf8f3] rounded-xl p-4 border border-[#e8e0d0]">
                  <p className="font-sans text-xs font-semibold text-gold mb-1">Pricing</p>
                  <p className="font-sans text-xs text-gray-600 leading-relaxed">Available on custom quotation based on group size, accommodation level, transport style, and additional Lake Natron experiences. Private departures available year-round.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 6. ALTITUDE ZONES ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Climate &amp; Terrain</SectionLabel>
            <SectionHeading>Five Altitude Zones. One Extraordinary Volcano.</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-3">
              Oldoinyo Lengai rises from one of the hottest and most remote valleys in Africa to a crater rim that steams with active volcanic vents. The journey through its altitude zones is one of the most dramatic and varied in East African trekking — from the flamingo-pink soda lake floor to the otherworldly carbonatite landscape of the summit.
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              The upper mountain deserves particular respect. The loose carbonatite surface does not consolidate like alpine rock or forest soil — it shifts and crumbles with every step, demanding total concentration from the moment the gradient steepens. Your guide knows the stable lines intimately. Trust them, match their pace, and the summit is entirely achievable.
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

      {/* ── 7. OPTIONAL ADD-ONS & TRAVEL INFO ───────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-beige">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="w-full lg:w-1/2">
                <SectionLabel>Optional Add-Ons</SectionLabel>
                <SectionHeading>Extend Your Adventure</SectionHeading>
                <p className="font-sans text-gray-600 leading-relaxed text-base mb-6">
                  Oldoinyo Lengai sits at the centre of one of Tanzania's richest adventure corridors. Add any of the following experiences to build a truly unforgettable itinerary.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: Star,     title: 'Maasai Cultural Boma Visit',    desc: 'An authentic guided visit to a traditional Maasai homestead near Lake Natron — traditional architecture, cattle culture, elder conversation, and the chance to understand the people for whom Lengai is sacred.' },
                    { icon: Compass,  title: 'Lake Natron Flamingo Excursion', desc: 'Walk the shoreline of one of Africa\'s most alkaline lakes as hundreds of thousands of lesser flamingos feed and roost in the shallows. An extraordinary wildlife spectacle unlike any other.' },
                    { icon: Mountain, title: 'Ngare Sero Waterfall Trek',      desc: 'A guided hike through volcanic landscape to a hidden waterfall and freshwater pools — a beautiful contrast to the salt flats of Natron.' },
                    { icon: Backpack, title: 'Combine with Kilimanjaro / Meru', desc: 'Many guests pair Lengai with a Kilimanjaro or Mount Meru summit for the ultimate Tanzania mountain trilogy. We handle all logistics as a single seamless package.' },
                    { icon: Compass,  title: 'Northern Tanzania Safari Circuit', desc: 'Add Serengeti, Ngorongoro Crater, and Tarangire for a complete Tanzania adventure — mountain, volcano, and the greatest wildlife spectacle on Earth.' },
                    { icon: Star,     title: 'Zanzibar Beach Recovery',        desc: 'Rest your legs on the white sands of Zanzibar after your trek. A perfect 3–4 day contrast after Lengai and the Rift Valley wilderness.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="bg-white rounded-xl px-5 py-4 border border-gray-100 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-green-950 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-gold" />
                      </div>
                      <div>
                        <p className="font-sans text-xs font-bold text-green-950 mb-0.5">{title}</p>
                        <p className="font-sans text-xs text-gray-500 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <SectionLabel>Essential Travel Information</SectionLabel>
                <SectionHeading>Plan Your Trip</SectionHeading>
                <div className="space-y-3">
                  {[
                    { period: 'Fitness Preparation', act: 'Train specifically for steep, sustained climbing 6–8 weeks before. Stair climbing, hill hiking with loaded pack, and core conditioning are your most valuable tools.' },
                    { period: 'What to Pack', act: 'Headlamp (essential), trekking poles, worn-in hiking boots with ankle support, warm layers for the summit (2–8°C), UV sunglasses, sun hat, sunscreen SPF50+, at least 3L water capacity.' },
                    { period: 'Airport Arrival', act: 'Fly into Kilimanjaro International Airport (JRO) — the closest international gateway. Arusha Airport (ARK) also serves regional connections. We arrange all transfers.' },
                    { period: 'Altitude & Heat', act: 'The Rift Valley base is extremely hot (30–38°C in daytime). Midnight departure avoids the worst heat. The summit can reach 0–8°C. Bring both warm and cool layers.' },
                    { period: 'Volcanic Terrain Safety', act: 'Stay on the guide\'s established line at all times. Do not approach active vents without guide instruction. The carbonatite surface is chemically caustic on prolonged skin contact — gloves are advisable.' },
                    { period: 'Insurance Requirement', act: 'Travel insurance covering strenuous trekking, emergency evacuation, and medical treatment is mandatory for all Lengai climbers. Non-negotiable for your own safety.' },
                  ].map(t => (
                    <div key={t.period} className="bg-white rounded-xl px-5 py-4 border border-gray-100">
                      <p className="font-sans text-xs font-bold text-gold mb-0.5">{t.period}</p>
                      <p className="font-sans text-xs text-gray-600 leading-relaxed">{t.act}</p>
                    </div>
                  ))}
                </div>
              </div>
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
              Why Book Oldoinyo Lengai with Nelson Tours and Safaris?
            </h2>
            <p className="font-sans text-white/70 leading-relaxed text-base mb-5">
              Oldoinyo Lengai is not the kind of mountain where the operator choice is a minor detail. The remoteness of Lake Natron, the volcanic hazards of the terrain, the importance of local Maasai guide relationships, and the logistical demands of a midnight departure in a landscape this wild mean that who you climb with matters enormously.
            </p>
            <p className="font-sans text-white/70 leading-relaxed text-base mb-8">
              Nelson Tours and Safaris is an Arusha-based, Tanzania-rooted operator with deep partnerships across the Maasai communities of northern Tanzania. Our Lengai guides are local — some grew up within sight of the volcano. They know its moods, its safe lines, and what it means to their people. That knowledge, combined with our operational rigour and private departure model, delivers an experience that is genuinely a cut above the rest.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Tanzania trekking experts — Arusha-based, locally rooted',
                'Trusted long-term partnerships with Maasai summit guides',
                'Private custom departures — your dates, your pace',
                'Thorough pre-trip safety planning and volcanic activity monitoring',
                '4WD expedition transport through remote northern Tanzania',
                'Personalised pre-trip support and packing consultations',
                'Authentic off-the-beaten-path adventure — no mass tourism',
                'Optional multi-mountain packages and safari extensions',
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
          <img src="/images/sections/oldoinyo-lengai-hero.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-4">Reserve Your Trek</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Ready to Stand on the <br className="hidden sm:block" />Mountain of God?
            </h2>
            <p className="font-sans text-white/65 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              The crater rim. The active vents steaming at your feet. Lake Natron spread across the Rift Valley floor below. The African sunrise painting the escarpments gold. This is Oldoinyo Lengai at dawn — and Nelson Tours will get you there safely, professionally, and in a way that does justice to this extraordinary place.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="https://wa.me/255750005973" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-white font-sans font-semibold text-base px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                WhatsApp Our Team <ArrowRight size={16} />
              </a>
              <Link to="/contact"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-sans font-semibold text-base px-8 py-4 rounded-full transition-all duration-300">
                Send an Enquiry <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10">
              {[
                { label: 'Climb Mount Meru',        to: '/meru' },
                { label: 'Climb Kilimanjaro',        to: '/kilimanjaro' },
                { label: 'Northern Tanzania Safari', to: '/safari' },
                { label: 'Lake Natron Adventure',    to: '/contact?interest=Lake+Natron+Adventure' },
                { label: 'Zanzibar Beach Holiday',   to: '/tours' },
              ].map(({ label, to }) => (
                <Link key={label} to={to} className="font-sans text-xs text-white/40 hover:text-gold transition-colors">{label} →</Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
