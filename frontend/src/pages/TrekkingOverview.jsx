import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ChevronRight, ArrowRight, Mountain, Clock, Star, Users, Shield,
  Heart, CheckCircle, ChevronDown, MapPin, Thermometer,
  Calendar, Activity, Compass, Camera, Backpack, Phone
} from 'lucide-react'

/* ─────────────────────── static data ─────────────────────── */
const WHY_NELSON = [
  { icon: Shield,      title: 'Certified Local Guides',   desc: 'KINAPA-licensed guides born in the shadow of these mountains. They know every step, every weather pattern, every hidden challenge.' },
  { icon: Heart,       title: 'Daily Health Monitoring',  desc: 'Pulse oximetry and health checks every morning and evening. Your safety is non-negotiable and governs every decision on the mountain.' },
  { icon: Backpack,    title: 'Premium Equipment',        desc: 'High-altitude dome tents, insulated sleeping pads, hot water bottles, and altitude medication carried as standard on every expedition.' },
  { icon: Users,       title: 'Ethical Porter Welfare',   desc: 'We pay above KINAPA minimum wages, provide proper equipment, warm meals, and fair load limits. Our crew are partners, not servants.' },
  { icon: Star,        title: '4.9★ Climber Reviews',     desc: 'Over 2,000 verified reviews from climbers worldwide. Our summit success rates consistently exceed industry averages by 15–20%.' },
]

const TIMELINE = [
  { day: 'Day 0',   title: 'Arrival & Pre-Climb Briefing',  desc: 'You land in Kilimanjaro International Airport (JRO) or Arusha and are transferred to our partner lodge. That evening, your lead guide hosts a detailed expedition briefing covering safety protocols, altitude awareness, daily routine, and gear inspection.' },
  { day: 'Day 1',   title: 'Gear Check & Trail Departure',   desc: 'After a comprehensive equipment inspection and a hearty high-energy breakfast, you meet your full mountain crew — your guide, assistant guides, cook, and porters. You register at the park gate and begin your ascent through ancient rainforest teeming with colobus monkeys and exotic birdlife.' },
  { day: 'Days 2–4', title: 'Mountain Crew & Zone Transitions', desc: 'Each day your crew sets camp, prepares warm meals, and monitors your health. You cross from cloud forest into open heather moorland, then into otherworldly alpine desert. Pole pole — slowly slowly — is the mantra. Rest, hydrate, acclimatize.' },
  { day: 'Day 5–6', title: 'Altitude Adaptation & High Camp', desc: 'You reach high camp, your final base before the summit. The air is thin, cold, and electric with anticipation. Hot soup, early dinner, and rest before a midnight wake-up. Your guide reviews the plan and conditions.' },
  { day: 'Night',   title: 'Summit Push',                    desc: 'Under a star-blanketed sky at midnight, you begin the most demanding hours of the climb. Headtorches cut through the darkness as you zigzag up the steep scree to Stella Point (5,756m) and then push the final ridge to Uhuru Peak — 5,895m, the Roof of Africa.' },
  { day: 'Descent', title: 'Descent & Recovery',             desc: 'The descent is swift — the mountain gives back your energy as altitude drops. You reach lower camp for lunch, continue to the gate, and arrive at your vehicle to cheers from your crew. A hot shower, cold drink, and your summit certificate await.' },
  { day: 'Day +1',  title: 'Certificate & Celebration',      desc: 'The morning after is yours. Nelson Tours arranges your official summit certificate, a celebratory dinner if you wish, and private airport or lodge transfer. You leave with a story that will define you for the rest of your life.' },
]

const TESTIMONIALS = [
  {
    name: 'James Whitmore',
    country: 'London, UK',
    peak: 'Uhuru Peak · Machame Route',
    stars: 5,
    text: 'I\'ve guided treks in Nepal and Patagonia, but Nelson Tours set a new standard. Our lead guide Emmanuel knew my body better than I did — adjusting pace, nutrition, and acclimatisation strategy in real time. The crew\'s porters sang as they overtook us on the trail each morning, which became the soundtrack to our entire expedition. Summit day was the hardest six hours of my life and the greatest achievement. When I touched the Uhuru Peak sign at dawn with tears I couldn\'t explain, Emmanuel was right beside me. That moment was everything. Absolutely book with Nelson — no comparison.',
  },
  {
    name: 'Amira Hassan',
    country: 'Dubai, UAE',
    peak: 'Uhuru Peak · Lemosho Route',
    stars: 5,
    text: 'As a solo female traveller attempting my first high-altitude summit, safety was paramount. The Nelson team briefed me so thoroughly before departure that I arrived at gate 1 feeling completely prepared. Every evening, the assistant guide checked my oxygen saturation and asked about headaches, appetite, and mood. The food on the mountain was genuinely spectacular — fresh avocado, pasta, soups, fruit — food I\'d be happy to eat in a restaurant. Summit night was brutal but the team\'s positivity carried me through. I cried at the crater rim. Thank you Nelson Tours for one of the most profound experiences of my life.',
  },
  {
    name: 'Carlos Mendes',
    country: 'São Paulo, Brazil',
    peak: 'Socialist Peak · Mount Meru',
    stars: 5,
    text: 'We did Mount Meru as acclimatisation before Kilimanjaro and it completely transformed our summit success. Our ranger-guided trek through Arusha National Park felt like a private expedition — we had a resident buffalo wander through camp on night two. The views from Socialist Peak of Kilimanjaro\'s snow cap floating above the clouds are among the most spectacular things I\'ve ever seen. Our guide Abraham was funny, knowledgeable, and pushed us just the right amount. I\'ll be back for Kilimanjaro next year — and I\'m booking with Nelson again without question.',
  },
  {
    name: 'Sophie Laroche',
    country: 'Paris, France',
    peak: 'Ol Doinyo Lengai · Night Hike',
    stars: 5,
    text: 'Nothing prepares you for the sheer otherworldliness of Ol Doinyo Lengai. We started the night hike at midnight, headtorches on, the temperature surprisingly cool in the Rift Valley. The gradient is brutal — nearly 60% in places — but Moses, our guide, kept the pace perfectly and stopped just long enough for us to catch breath and stargaze. At the crater rim at sunrise, we looked into an active volcano as the sky turned pink over Lake Natron. Then the Maasai village extension brought us into the real cultural soul of this landscape. Nothing I\'ve done before or since compares to that morning.',
  },
  {
    name: 'Michael Oduya',
    country: 'Nairobi, Kenya',
    peak: 'Uhuru Peak · Rongai Route',
    stars: 5,
    text: 'I grew up with Kilimanjaro on the horizon my whole life but I\'d never climbed it. Nelson Tours turned that lifelong dream into the most well-organised adventure I\'ve ever been part of. The Rongai route was quieter than I expected, giving us a real wilderness feel on the northern slopes. Our porter team was extraordinary — they set up camp before we even arrived each day, always with hot drinks waiting. Summit night, when I touched that yellow sign at 5,895m, something shifted inside me permanently. My guide Josephat didn\'t just get me up the mountain — he helped me believe I could do it in the first place.',
  },
]

const FAQS = [
  {
    q: 'When is the best time to climb Kilimanjaro or Mount Meru?',
    a: 'The two main climbing seasons are January–March and June–October. These months offer the clearest skies, most stable temperatures, and the lowest precipitation. January and February are particularly exceptional, with dry conditions and fewer climbers on the trails. The high season from July to October sees the most traffic. We do guide year-round, but November through mid-December brings the short rains and is our least recommended period.',
  },
  {
    q: 'Do I need prior mountaineering experience?',
    a: 'No technical mountaineering experience is required for Kilimanjaro or Mount Meru. Both peaks are non-technical trek climbs — meaning no ropes, crampons, or ice axes for standard ascents. What matters most is cardiovascular fitness, a positive mindset, and the willingness to go slowly. We recommend training with regular hiking and cardio for 2–3 months prior. Ol Doinyo Lengai requires slightly more agility due to extremely steep volcanic ash terrain, but no climbing experience is needed.',
  },
  {
    q: 'What is altitude sickness and how do you manage it?',
    a: 'Altitude sickness (AMS — Acute Mountain Sickness) occurs when the body doesn\'t acclimatize fast enough to reduced oxygen levels. Symptoms include headache, nausea, dizziness, and fatigue. Our guides monitor every climber twice daily using pulse oximeters and subjective health assessments. We follow the golden rule: if symptoms worsen at altitude, we descend. We carry supplemental oxygen and a portable hyperbaric (Gamow) bag on every expedition. We also recommend consulting your doctor about Diamox (acetazolamide) prior to climbing.',
  },
  {
    q: 'How many porters and guides will be on our climb?',
    a: 'KINAPA regulations require at least one licensed guide per group, but we go well beyond the minimum. A typical Nelson Tours expedition includes 1 lead guide, 1–2 assistant guides, 1 camp cook, and 4–7 porters per climber (depending on group size and route). This generous staffing means your gear is carried, your camp is established, your meals are prepared, and your safety is monitored at all times. Our porters are paid fairly, equipped properly, and are treated with full respect as the backbone of every expedition.',
  },
  {
    q: 'What gear and equipment do I need to bring?',
    a: 'We provide a detailed packing list upon booking. Essentials include: layered clothing system (base layer, fleece mid-layer, insulated jacket, waterproof shell), -15°C sleeping bag, trekking boots (worn in), trekking poles, headlamp with spare batteries, UV sunglasses, and high-SPF sunscreen. We provide tents, dining equipment, and cooking gear. High-quality sleeping bags and trekking poles are also available to rent through Nelson Tours for a modest daily fee.',
  },
  {
    q: 'What safety measures does Nelson Tours have in place?',
    a: 'Safety is our absolute priority. Every expedition includes: KINAPA-licensed lead guides with wilderness first aid certification, daily health monitoring with pulse oximetry, supplemental oxygen on all Kilimanjaro expeditions, hyperbaric bag carried from base camp upward, satellite communication device on high-altitude routes, comprehensive evacuation protocols with park rescue coordination, and a 24-hour support line for families. We have never lost a climber and maintain an impeccable safety record across thousands of guided ascents.',
  },
  {
    q: 'Which airport should I fly into?',
    a: 'For Kilimanjaro and Mount Meru, fly into Kilimanjaro International Airport (JRO) — it is the closest international gateway, with regular direct flights from Nairobi, Doha, Dubai, Amsterdam, and other hubs. For Ol Doinyo Lengai, fly into JRO or Arusha Airport (ARK) and we arrange ground transfer to Lake Natron (approximately 4–5 hours by 4WD). All Nelson Tours packages include full airport pickup and drop-off.',
  },
  {
    q: 'Can I combine a mountain climb with a Tanzania safari?',
    a: 'Absolutely — and many of our clients do exactly this. A popular combination is a 7-day Kilimanjaro climb followed by a 4–5 day Northern Tanzania safari covering Serengeti, Ngorongoro Crater, and Tarangire. We manage all logistics seamlessly as a single package. Post-climb, your body and soul will appreciate the contrast of game drives from a comfortable vehicle. We also offer Ol Doinyo Lengai combined with a Lake Natron flamingo experience and a Maasai cultural immersion day.',
  },
]

/* ─────────────────────── fade-in wrapper ─────────────────── */
function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────── main component ─────────────────── */
export default function KilimanjaroOverview() {
  const heroRef = useRef(null)
  const [showSticky, setShowSticky] = useState(false)
  const [faqOpen, setFaqOpen] = useState(null)
  const [testIdx, setTestIdx] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-[#faf8f3] min-h-screen">

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-end bg-green-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/sections/parallax-kilimanjaro.jpg"
            alt="Kilimanjaro summit above clouds"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/60 to-transparent" />
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-28 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-2 font-sans text-xs text-white/50">
              <Link to="/" className="hover:text-white/80 transition-colors">Home</Link>
              <ChevronRight size={11} />
              <span className="text-white/70">Mountain Climbing &amp; Trekking</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20 pt-40">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
            Nelson Tours &amp; Safari · Tanzania
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-6 max-w-4xl">
            Mountain Climbing &amp; Trekking in Tanzania
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="font-sans text-lg sm:text-xl text-white/75 leading-relaxed mb-10 max-w-2xl">
            Conquer Africa's legendary peaks with expert local guides. From the glaciated summit of Kilimanjaro to the sacred fire of Ol Doinyo Lengai — your defining expedition begins here.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap gap-4">
            <Link to="/routes"
              className="inline-flex items-center gap-2 bg-gold hover:bg-[#b8935a] text-white font-sans font-semibold text-base px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-gold/30 hover:shadow-xl hover:-translate-y-1">
              Explore Kilimanjaro Routes <ArrowRight size={17} />
            </Link>
            <a href="https://wa.me/255750005973" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/25 hover:bg-white/20 text-white font-sans font-semibold text-base px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-sm">
              Talk to an Expert
            </a>
          </motion.div>

          {/* Hero trust pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap gap-3 mt-10">
            {['✓ KINAPA Licensed Guides', '✓ 4.9★ Verified Reviews', '✓ 24/7 Safety Monitoring'].map(t => (
              <span key={t} className="font-sans text-xs text-white/70 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">{t}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ STICKY CTA BAR ════════════════════════════════════════ */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -64, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed top-12 lg:top-14 left-0 right-0 z-[49] flex items-center justify-between gap-3 px-6 py-2.5 bg-green-950/97 backdrop-blur-md shadow-lg">
            <span className="hidden sm:block font-sans text-sm font-semibold text-white/80">Mountain Climbing &amp; Trekking · Nelson Tours</span>
            <div className="flex items-center gap-3 ml-auto">
              <Link to="/routes" className="inline-flex items-center gap-2 bg-gold hover:bg-[#b8935a] text-white font-sans font-semibold text-sm px-5 py-2 rounded-full transition-all">
                Explore Routes <ArrowRight size={13} />
              </Link>
              <a href="https://wa.me/255750005973" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 font-sans text-sm px-5 py-2 rounded-full transition-all">
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ OVERVIEW INTRO ═══════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-4">Tanzania's Volcanic Giants</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-green-950 leading-tight mb-6">
                The World's Most Spectacular Trekking Destination
              </h2>
              <p className="font-sans text-base text-gray-600 leading-relaxed mb-4">
                Tanzania is home to some of the most dramatic volcanic landscapes on Earth. Rising in solitary grandeur above the vast savannahs of East Africa, her mountains are more than geographic landmarks — they are transformative experiences that rewrite the story of everyone who climbs them.
              </p>
              <p className="font-sans text-base text-gray-600 leading-relaxed mb-4">
                Mount Kilimanjaro, Africa's rooftop at 5,895 metres, draws adventurers from every corner of the world — yet with the right guide, remains accessible to any determined trekker. Mount Meru, standing proud at 4,566 metres within Arusha National Park, offers a wild and intimate high-altitude experience with far fewer crowds and extraordinary wildlife encounters along the trail. And Ol Doinyo Lengai, the sacred "Mountain of God" of the Maasai, provides a raw, spiritual, and technically demanding night ascent to an active carbonatite volcano perched above the turquoise waters of Lake Natron.
              </p>
              <p className="font-sans text-base text-gray-600 leading-relaxed">
                At Nelson Tours &amp; Safari, our mountain guides were born in the shadow of these peaks. They understand every altitude challenge, weather pattern, and hidden wonder. From your first step through rainforest to your final summit push in the dark hours before dawn — we are with you at every altitude.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: '5,895m', label: 'Kilimanjaro Summit', sub: 'Highest peak in Africa' },
                  { val: '6', label: 'Kili Routes', sub: 'Expert-guided ascents' },
                  { val: '4,566m', label: 'Mount Meru', sub: '2nd highest in Tanzania' },
                  { val: '2,962m', label: 'Ol Doinyo Lengai', sub: 'Sacred active volcano' },
                ].map(s => (
                  <div key={s.label} className="bg-[#faf8f3] rounded-2xl p-6 border border-[#e8e0d0]">
                    <p className="font-serif text-3xl font-bold text-green-950 leading-none mb-1">{s.val}</p>
                    <p className="font-sans text-sm font-semibold text-gray-800 mb-0.5">{s.label}</p>
                    <p className="font-sans text-xs text-gray-500">{s.sub}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ MOUNTAIN 1 — KILIMANJARO ══════════════════════════════ */}
      <section className="py-24 bg-[#faf8f3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <FadeIn className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
                <img src="/images/sections/parallax-kilimanjaro.jpg" alt="Mount Kilimanjaro" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-sans text-xs uppercase tracking-widest text-gold mb-1">Africa's Highest Summit</p>
                  <h3 className="font-serif text-3xl text-white font-bold">Mount Kilimanjaro</h3>
                  <p className="font-sans text-sm text-white/70 mt-1">5,895m · Uhuru Peak · Tanzania</p>
                </div>
              </div>
              {/* Badge */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gold rounded-full flex flex-col items-center justify-center shadow-lg">
                <span className="font-serif text-sm font-bold text-white leading-none">5,895</span>
                <span className="font-sans text-[9px] text-white/80 uppercase tracking-wide">metres</span>
              </div>
            </FadeIn>

            {/* Content */}
            <FadeIn delay={0.1}>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">Expedition 01</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-green-950 leading-tight mb-4">
                Mount Kilimanjaro Climb
              </h2>
              <p className="font-sans text-base text-gray-600 leading-relaxed mb-4">
                Kilimanjaro is the world's highest freestanding mountain and Africa's undisputed crown. Rising 5,895 metres above the savannah plains of northern Tanzania, it is one of the Seven Summits — yet uniquely, it requires no technical mountaineering skills. What it demands is commitment, physical preparation, and the wisdom to ascend slowly.
              </p>
              <p className="font-sans text-base text-gray-600 leading-relaxed mb-6">
                Your journey unfolds across five extraordinary ecological zones: lush equatorial rainforest alive with colobus monkeys and hornbills; moorland painted with giant heather and lobelia; high-altitude alpine desert of volcanic rock and silence; arctic summit glaciers of ancient ice that have witnessed millennia. Each zone is a world within a world — a complete transformation in just a few days of walking.
              </p>

              {/* Key facts grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Mountain,     label: 'Elevation',   val: '5,895m' },
                  { icon: Clock,        label: 'Duration',    val: '5 – 10 Days' },
                  { icon: Calendar,     label: 'Best Season', val: 'Jan–Feb & Jun–Oct' },
                  { icon: Activity,     label: 'Difficulty',  val: 'Challenging' },
                  { icon: MapPin,       label: 'Location',    val: 'Kili National Park' },
                  { icon: Compass,      label: 'Summit',      val: 'Uhuru Peak' },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 flex items-start gap-2.5">
                    <Icon size={15} className="text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="font-sans text-sm font-semibold text-gray-800">{val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-950/5 border border-green-950/10 rounded-2xl p-5 mb-6">
                <p className="font-sans text-sm text-gray-700 leading-relaxed italic">
                  "Standing at Uhuru Peak at sunrise, watching the shadow of the world's greatest freestanding mountain stretch across Tanzania's dawn sky — this is a moment that redefines what you believe is possible."
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/kilimanjaro"
                  className="inline-flex items-center gap-2 bg-green-950 hover:bg-green-900 text-white font-sans font-semibold text-sm px-6 py-3 rounded-full transition-all">
                  Kilimanjaro Overview <ArrowRight size={14} />
                </Link>
                <Link to="/routes"
                  className="inline-flex items-center gap-2 border border-green-950/20 text-green-950 hover:bg-green-950 hover:text-white font-sans font-semibold text-sm px-6 py-3 rounded-full transition-all">
                  View All Routes
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ MOUNTAIN 2 — MOUNT MERU ═══════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Content — left */}
            <FadeIn>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">Expedition 02</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-green-950 leading-tight mb-4">
                Mount Meru Climb
              </h2>
              <p className="font-sans text-base text-gray-600 leading-relaxed mb-4">
                Tanzania's second-highest peak is a masterpiece of wild mountain trekking. Rising 4,566 metres inside Arusha National Park, Mount Meru is everything Kilimanjaro is not: intimate, wildlife-rich, uncrowded, and bracingly real. Its volcanic crater, sheer inner walls, and dramatic ash cone make for a visually arresting landscape unlike anywhere else in East Africa.
              </p>
              <p className="font-sans text-base text-gray-600 leading-relaxed mb-6">
                Uniquely among major African peaks, a Mount Meru climb is accompanied by an armed park ranger — not for ceremony, but because Cape buffalo, elephant, giraffe, and colobus monkey inhabit the trail corridor. This is genuine African wilderness at altitude. The crater rim walk to Socialist Peak offers a jaw-dropping aerial view of Kilimanjaro's snow-capped summit floating above the clouds — a photograph that will define your mantelpiece for decades.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Mountain,     label: 'Elevation',   val: '4,566m' },
                  { icon: Clock,        label: 'Duration',    val: '3 – 4 Days' },
                  { icon: Calendar,     label: 'Best Season', val: 'Jun–Oct & Dec–Feb' },
                  { icon: Activity,     label: 'Difficulty',  val: 'Moderate–Hard' },
                  { icon: MapPin,       label: 'Location',    val: 'Arusha National Park' },
                  { icon: Compass,      label: 'Summit',      val: 'Socialist Peak' },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="bg-[#faf8f3] rounded-xl p-3 border border-gray-100 flex items-start gap-2.5">
                    <Icon size={15} className="text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="font-sans text-sm font-semibold text-gray-800">{val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
                <p className="font-sans text-sm font-semibold text-amber-800 mb-1">🏔 Ideal Kilimanjaro Acclimatisation</p>
                <p className="font-sans text-sm text-amber-700 leading-relaxed">
                  Most serious Kilimanjaro climbers do Mount Meru first. The altitude exposure at 4,566m dramatically improves your body's oxygen efficiency, significantly boosting your Kilimanjaro summit success rate.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/meru"
                  className="inline-flex items-center gap-2 bg-green-950 hover:bg-green-900 text-white font-sans font-semibold text-sm px-6 py-3 rounded-full transition-all">
                  Mount Meru Overview <ArrowRight size={14} />
                </Link>
                <Link to="/contact?interest=Meru+Kilimanjaro+Combo"
                  className="inline-flex items-center gap-2 border border-green-950/20 text-green-950 hover:bg-green-950 hover:text-white font-sans font-semibold text-sm px-6 py-3 rounded-full transition-all">
                  Meru + Kilimanjaro Combo
                </Link>
              </div>
            </FadeIn>

            {/* Image — right */}
            <FadeIn delay={0.1} className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
                <img src="/images/sections/parallax-kilimanjaro.jpg" alt="Mount Meru" className="w-full h-full object-cover object-right" />
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-sans text-xs uppercase tracking-widest text-gold mb-1">Tanzania's Wild Summit</p>
                  <h3 className="font-serif text-3xl text-white font-bold">Mount Meru</h3>
                  <p className="font-sans text-sm text-white/70 mt-1">4,566m · Socialist Peak · Arusha</p>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-green-950 rounded-full flex flex-col items-center justify-center shadow-lg">
                <span className="font-serif text-sm font-bold text-white leading-none">4,566</span>
                <span className="font-sans text-[9px] text-white/80 uppercase tracking-wide">metres</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ MOUNTAIN 3 — OL DOINYO LENGAI ════════════════════════ */}
      <section className="py-24 bg-[#faf8f3]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <FadeIn className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-orange-900 via-red-900 to-black flex items-center justify-center">
                  <div className="text-center text-white/20">
                    <Mountain size={80} />
                    <p className="font-serif text-lg mt-4">Ol Doinyo Lengai</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-sans text-xs uppercase tracking-widest text-orange-300 mb-1">The Mountain of God</p>
                  <h3 className="font-serif text-3xl text-white font-bold">Ol Doinyo Lengai</h3>
                  <p className="font-sans text-sm text-white/70 mt-1">2,962m · Active Volcano · Lake Natron</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-600 rounded-full flex flex-col items-center justify-center shadow-lg">
                <span className="font-serif text-sm font-bold text-white leading-none">2,962</span>
                <span className="font-sans text-[9px] text-white/80 uppercase tracking-wide">metres</span>
              </div>
            </FadeIn>

            {/* Content */}
            <FadeIn delay={0.1} className="order-1 lg:order-2">
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-orange-500 mb-3">Expedition 03</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-green-950 leading-tight mb-4">
                Ol Doinyo Lengai Volcano Trek
              </h2>
              <p className="font-sans text-base text-gray-600 leading-relaxed mb-4">
                There is no mountain in Tanzania — perhaps no mountain in the world — quite like Ol Doinyo Lengai. Rising steeply from the floor of the Great Rift Valley above the flamingo-pink shores of Lake Natron, this is the only active carbonatite volcano on Earth. Sacred to the Maasai people who call it the "Mountain of God," it erupts black lava that turns brilliant white on contact with air — a volcanic phenomenon found nowhere else on the planet.
              </p>
              <p className="font-sans text-base text-gray-600 leading-relaxed mb-6">
                The standard ascent is a night hike beginning around midnight, tackling impossibly steep ash slopes and volcanic rock at a gradient approaching 60% in places. It is raw, demanding, and deeply visceral. When you arrive at the crater rim as the first gold of dawn breaks over the Rift Valley escarpment and Lake Natron turns crimson and pink below — every burning step was worth it. For the culturally curious, we extend this adventure with a Maasai village visit and the Engare Sero waterfall hike.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Mountain,     label: 'Elevation',   val: '2,962m' },
                  { icon: Clock,        label: 'Duration',    val: '1 – 2 Days' },
                  { icon: Activity,     label: 'Style',       val: 'Night Hike' },
                  { icon: Thermometer,  label: 'Lava Type',   val: 'Carbonatite' },
                  { icon: MapPin,       label: 'Location',    val: 'Lake Natron Rift' },
                  { icon: Camera,       label: 'Extension',   val: 'Cultural Tour' },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 flex items-start gap-2.5">
                    <Icon size={15} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="font-sans text-sm font-semibold text-gray-800">{val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6">
                <p className="font-sans text-sm font-semibold text-orange-800 mb-1">🌋 The Only Active Carbonatite Volcano on Earth</p>
                <p className="font-sans text-sm text-orange-700 leading-relaxed">
                  Lengai erupts natrocarbonatite lava — the coolest erupting lava on Earth at just 500°C, appearing black when fluid but turning blindingly white as it oxidises. A geological wonder unlike anything else on the planet.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/oldoinyo-lengai"
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-sans font-semibold text-sm px-6 py-3 rounded-full transition-all">
                  Ol Doinyo Lengai Overview <ArrowRight size={14} />
                </Link>
                <Link to="/contact?interest=Oldoinyo+Lengai"
                  className="inline-flex items-center gap-2 border border-orange-600/20 text-orange-700 hover:bg-orange-600 hover:text-white font-sans font-semibold text-sm px-6 py-3 rounded-full transition-all">
                  Request a Quote
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ WHY NELSON ════════════════════════════════════════════ */}
      <section className="py-24 bg-green-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img src="/images/sections/parallax-kilimanjaro.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">Why Choose Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">Why Climb With Nelson Tours</h2>
            <p className="font-sans text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
              Every guide, every decision, every preparation is built on one principle: getting you safely to the summit and safely back down, with every moment between being extraordinary.
            </p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_NELSON.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 0.07}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300">
                  <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-gold" />
                  </div>
                  <h3 className="font-sans text-base font-bold text-white mb-2">{title}</h3>
                  <p className="font-sans text-sm text-white/55 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TREK TIMELINE ════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">Your Expedition Flow</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-green-950 mb-4">What to Expect on Our Treks</h2>
            <p className="font-sans text-base text-gray-500 max-w-xl mx-auto">Every expedition is different, but this is the journey arc that shapes every Nelson Tours climb from airport to summit certificate.</p>
          </FadeIn>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-green-950/20 to-transparent" />
            <div className="space-y-8">
              {TIMELINE.map((step, i) => (
                <FadeIn key={step.day} delay={i * 0.06}>
                  <div className="relative flex gap-8 pl-20">
                    <div className="absolute left-5 top-1 w-6 h-6 rounded-full bg-gold border-4 border-white shadow flex items-center justify-center" style={{ transform: 'translateX(-50%)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex-1 bg-[#faf8f3] rounded-2xl p-5 border border-[#e8e0d0]">
                      <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold mb-1">{step.day}</p>
                      <h3 className="font-sans text-base font-bold text-green-950 mb-2">{step.title}</h3>
                      <p className="font-sans text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════ */}
      <section className="py-24 bg-[#faf8f3] border-t border-[#e8e0d0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">Real Climbers · Real Summits</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-green-950 mb-3">Stories From the Summit</h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#c9a96e" className="text-gold" />)}
              <span className="font-sans text-sm font-semibold text-gray-700 ml-2">4.9 · Over 2,000 Reviews</span>
            </div>
          </FadeIn>

          {/* Featured testimonial */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={testIdx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 lg:p-10 max-w-4xl mx-auto"
              >
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(TESTIMONIALS[testIdx].stars)].map((_, i) => <Star key={i} size={16} fill="#c9a96e" className="text-gold" />)}
                </div>
                <blockquote className="font-sans text-base text-gray-700 leading-relaxed mb-6 italic">
                  "{TESTIMONIALS[testIdx].text}"
                </blockquote>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="font-sans text-sm font-bold text-green-950">{TESTIMONIALS[testIdx].name}</p>
                    <p className="font-sans text-xs text-gray-500">{TESTIMONIALS[testIdx].country}</p>
                    <p className="font-sans text-xs text-gold font-semibold mt-0.5">{TESTIMONIALS[testIdx].peak}</p>
                  </div>
                  <div className="flex gap-2">
                    {TESTIMONIALS.map((_, i) => (
                      <button key={i} onClick={() => setTestIdx(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${i === testIdx ? 'bg-gold scale-125' : 'bg-gray-200 hover:bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setTestIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-green-950 flex items-center justify-center transition-colors">
                <ChevronRight size={16} className="rotate-180 text-gray-500" />
              </button>
              <button onClick={() => setTestIdx(i => (i + 1) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-green-950 flex items-center justify-center transition-colors">
                <ChevronRight size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════════ */}
      <section id="packing-list" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-3">Common Questions</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-green-950 mb-4">Frequently Asked Questions</h2>
            <p className="font-sans text-base text-gray-500">Everything you need to know before your Tanzania mountain expedition.</p>
          </FadeIn>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div className="bg-[#faf8f3] border border-[#e8e0d0] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="font-sans text-sm font-semibold text-green-950 pr-4 leading-snug">{faq.q}</span>
                    <ChevronDown size={18} className={`text-gold flex-shrink-0 transition-transform duration-300 ${faqOpen === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {faqOpen === i && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        transition={{ duration: 0.25 }} className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 border-t border-[#e8e0d0]">
                          <p className="font-sans text-sm text-gray-600 leading-relaxed pt-4">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════ */}
      <section className="relative py-28 bg-green-950 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/sections/parallax-kilimanjaro.jpg" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-green-950/80 to-green-950/60" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">Begin Your Expedition</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
              Your Summit Starts Here
            </h2>
            <p className="font-sans text-lg text-white/70 leading-relaxed mb-10 max-w-2xl mx-auto">
              Whether you're dreaming of Uhuru Peak, Socialist Peak, or the crater rim of Ol Doinyo Lengai — your expedition begins with a single conversation. Let our mountain specialists craft your perfect Tanzania trekking adventure.
            </p>

            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-xl mx-auto mb-8">
              <div className="grid grid-cols-3 gap-6 mb-6">
                {[
                  { val: '2,400+', label: 'Guided Summits' },
                  { val: '4.9★', label: 'Average Rating' },
                  { val: '94%', label: 'Summit Rate' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="font-serif text-2xl font-bold text-gold">{s.val}</p>
                    <p className="font-sans text-xs text-white/60 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/contact?interest=Mountain+Trekking"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gold hover:bg-[#b8935a] text-white font-sans font-bold text-base py-4 rounded-2xl transition-all shadow-lg">
                  Plan My Expedition <ArrowRight size={16} />
                </Link>
                <a href="https://wa.me/255750005973" target="_blank" rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-sans font-semibold text-base py-4 rounded-2xl transition-all">
                  <Phone size={15} /> WhatsApp Us
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: CheckCircle, label: 'No booking fees' },
                { icon: CheckCircle, label: 'Free itinerary planning' },
                { icon: CheckCircle, label: '24hr expert response' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/60 font-sans text-sm">
                  <Icon size={14} className="text-gold" /> {label}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  )
}
