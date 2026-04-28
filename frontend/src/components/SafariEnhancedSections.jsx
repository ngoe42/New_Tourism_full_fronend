import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CheckCircle, ChevronDown, ArrowRight, MapPin, Calendar,
  Sun, Wind, Users, Star, Shield, Heart, Compass, Leaf,
  Camera, Clock, Backpack, Globe, Zap, AlertTriangle
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
        <ChevronDown size={18} className={`text-gold flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
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

const destinations = [
  {
    name: 'Serengeti National Park',
    tag: 'The Crown Jewel',
    desc: 'Tanzania\'s most iconic wilderness stretches across 14,750 square kilometres of unbroken savannah. Home to the Great Migration, where over 1.5 million wildebeest and 250,000 zebra follow ancient instincts across the plains, the Serengeti offers wildlife encounters of a magnitude found nowhere else on Earth. Lion prides patrol the grasslands. Cheetahs scan the horizon from termite mounds. And the silence between sightings is a profound gift in itself.',
    icon: Star,
  },
  {
    name: 'Ngorongoro Crater',
    tag: 'The Natural Amphitheatre',
    desc: 'Descending into the Ngorongoro Crater is one of the most dramatic wildlife experiences on the planet. The world\'s largest intact volcanic caldera shelters a permanent population of predators and prey within its 260 square kilometre floor — including rare black rhinos, dense lion populations, vast herds of buffalo, and flamingo-lined soda lakes. Every game drive here feels like stepping into a natural theatre where the drama never pauses.',
    icon: MapPin,
  },
  {
    name: 'Tarangire National Park',
    tag: "Africa's Elephant Sanctuary",
    desc: 'Defined by ancient baobab trees, the slow curves of the Tarangire River, and the largest elephant concentrations in northern Tanzania, Tarangire is a destination of profound, unhurried beauty. During the dry season, thousands of animals converge on the river — providing outstanding game viewing with far fewer visitors than the Serengeti. Our guides know its hidden channels and secret crossing points like old friends.',
    icon: Globe,
  },
  {
    name: 'Lake Manyara National Park',
    tag: 'The Flamingo Lake',
    desc: 'Compact but breathtakingly diverse, Lake Manyara rewards every visitor with layered landscapes — from its dense groundwater forest and acacia woodland to the shimmering alkaline lake fringed with flamingos. The park is famous for its tree-climbing lions and vast hippo pools. A morning here can deliver more biodiversity sightings per kilometre than almost anywhere else in Africa.',
    icon: Leaf,
  },
  {
    name: 'Arusha National Park',
    tag: 'The Hidden Gem',
    desc: 'Often overlooked in favour of its famous neighbours, Arusha National Park offers an extraordinarily accessible and varied safari experience with Kilimanjaro as its backdrop. Walking safaris, canoe trips on the alkaline lakes, giraffe encounters in the forest, and colobus monkey sightings make it an ideal first safari destination — or a peaceful add-on to a longer circuit.',
    icon: Compass,
  },
]

const experiences = [
  { icon: Camera, title: 'Hot Air Balloon Safari', desc: 'At first light, drift silently over the Serengeti in a private balloon, watching the plains come alive below. This once-in-a-lifetime experience ends with a champagne breakfast on the bush floor — a moment no photograph can fully capture.' },
  { icon: Users, title: 'Maasai Cultural Visits', desc: 'Step into a traditional Maasai boma and share time with one of East Africa\'s most iconic cultures. Learn about warrior traditions, cattle herding, beadwork, and the land-based spirituality that has guided the Maasai for centuries.' },
  { icon: Compass, title: 'Guided Walking Safaris', desc: 'There is a profound difference between observing wildlife from a vehicle and meeting the bush on foot. Our walking safaris — led by armed, experienced naturalists — bring an intimacy to the wilderness that game drives simply cannot replicate.' },
  { icon: Star, title: 'Night Game Drives', desc: 'The nocturnal Serengeti belongs to different rulers. Under the sweep of a spotlight, our guides reveal the secretive world of aardvarks, civets, genets, spring hares, and hunting leopards — creatures the daytime visitor never meets.' },
  { icon: Heart, title: 'Sundowner Experiences', desc: 'As the African sun melts into the horizon and the sky erupts in shades of amber and crimson, your guide stops the vehicle, the drinks are poured, and the Serengeti becomes your private gallery. Some moments define entire journeys.' },
  { icon: Leaf, title: 'Materuni Waterfalls & Coffee Tour', desc: 'On the slopes of Kilimanjaro, the Materuni Waterfalls cascade through lush rainforest while local families share the centuries-old tradition of Arabica coffee cultivation. A cultural and natural immersion unlike any other.' },
]

const faqs = [
  {
    q: 'Is a Tanzania safari suitable for first-time safari travelers?',
    a: 'Absolutely. Tanzania is one of the most welcoming safari destinations in the world for first-time travelers. No prior experience is required — your Nelson Tours and Safaris guide will take care of everything. From the moment we collect you from your hotel to the moment we return you, your only responsibility is to look, listen, and absorb the experience. We design every itinerary to gently introduce guests to the rhythms and rewards of the African bush.',
  },
  {
    q: 'What is the Great Migration and when is the best time to see it?',
    a: 'The Great Migration is the largest overland animal movement on Earth — more than 1.5 million wildebeest, 250,000 zebra, and hundreds of thousands of gazelle travel in a continuous circular loop between the Serengeti and Kenya\'s Masai Mara. The calving season (January–February) in the southern Serengeti is spectacular for predator action. The famous Mara River crossings take place from July to October in the northern Serengeti. Our team will help you plan your visit around the exact migration stage that interests you most.',
  },
  {
    q: 'How far in advance should I book a Tanzania safari?',
    a: 'We recommend booking your safari at least three to six months in advance — and up to twelve months ahead if you are planning to travel during peak season (July–October) or around major events. Premium lodge accommodation during the Great Migration is heavily sought after and fills quickly. Early booking also gives you maximum flexibility to customise your itinerary, adjust dates, and secure your preferred camp locations.',
  },
  {
    q: 'What is included in a Nelson Tours and Safaris safari package?',
    a: 'Our packages include all game drives in customised 4×4 Land Cruisers, accommodation at handpicked lodges or tented camps, a certified expert guide throughout, all park entry fees and conservation levies, full board meals during the safari, airport pick-up and drop-off, and seamless logistics coordination. We present clear, itemised inclusions with no hidden charges — so you know exactly what your investment covers before you confirm.',
  },
  {
    q: 'Is Tanzania safe for international travelers?',
    a: 'Tanzania is one of Africa\'s most politically stable and visitor-friendly destinations, with a well-established tourism infrastructure and a strong tradition of welcoming international guests. The national parks and reserves operate under professional management, and our guides are trained in field safety and emergency protocols. Standard travel precautions apply — and our pre-departure briefings cover everything you need to know before arrival.',
  },
  {
    q: 'Can children go on safari in Tanzania?',
    a: 'Yes — Tanzania is a wonderful family safari destination. We design child-friendly itineraries that balance game drive intensity with comfort, including shorter drives, interactive cultural visits, and accommodation with family rooms and private plunge pools. Children are naturally captivated by the animals, and our guides have a gift for engaging younger travelers with stories, tracking skills, and wildlife knowledge. We recommend a minimum age of around six years for full safari participation.',
  },
  {
    q: 'Do I need vaccinations or special health preparation for Tanzania?',
    a: 'We strongly recommend consulting a travel health clinic at least six to eight weeks before departure. Commonly advised vaccinations include yellow fever (required if arriving from certain countries), typhoid, and hepatitis A. Malaria prophylaxis is recommended for all safari destinations in Tanzania. Our pre-departure documentation covers health preparation in detail, and we partner with reputable travel health providers to ensure your preparation is complete and stress-free.',
  },
]

export default function SafariEnhancedSections() {
  return (
    <div className="bg-[#faf8f3]">

      {/* ── 1. INTRODUCTION ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Tanzania Safari</SectionLabel>
            <SectionHeading>Where the Wild World Comes Alive</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base sm:text-lg mb-5">
              There are destinations that impress you, and there are destinations that change you. Tanzania is unambiguously in the second category. This East African nation — home to the Serengeti, the Ngorongoro Crater, the Great Migration, and Mount Kilimanjaro — holds a permanent, unrivalled position at the summit of the world's great wildlife destinations. It is a place of staggering scale, ancient beauty, and encounters that make the ordinary noise of daily life seem very far away indeed.
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              At Nelson Tours and Safaris, we have spent years perfecting the craft of designing Tanzanian safari experiences that go beyond the itinerary. We are a locally rooted, Arusha-based team of naturalists, destination specialists, and passionate storytellers who believe that the greatest gift we can offer any traveler is genuine connection — with the land, its creatures, and the extraordinary communities that call this country home. Every safari we design carries that belief in every detail.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'No experience required — open to all ages and fitness levels',
                'Expert certified guides with deep field knowledge',
                'Handpicked lodges, tented camps, and luxury accommodations',
                'Customised private itineraries built around your interests',
                'All major parks and reserves covered: Serengeti, Ngorongoro, Tarangire & more',
                'Transparent pricing, seamless logistics, and 24/7 support',
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

      {/* ── 2. WHAT TO EXPECT ────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-beige">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>The Safari Experience</SectionLabel>
            <SectionHeading>What to Expect on Safari with Nelson Tours and Safaris</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-5">
              A safari with Nelson Tours and Safaris is a fully immersive, professionally guided journey into some of the most spectacular wildlife habitats on Earth. From the moment your 4×4 Land Cruiser rolls out of camp at first light — the sky shifting from indigo to gold, the air carrying the cool scent of the savannah — you are inside an experience that no screen, no documentary, and no photograph has ever adequately prepared anyone for.
            </p>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              Your guide is your compass, your interpreter, and your companion. They read the landscape with a lifetime of training and intuition — noticing the bent grass blade that means a lion passed here within the hour, the tree scratch that marks an elephant's regular path, the silence before a cheetah makes its move. Their knowledge transforms a game drive into a story. And every day on the Serengeti tells a different one.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Compass, title: 'Custom 4×4 Land Cruisers', desc: 'Every game drive uses a purpose-built safari vehicle with a pop-up roof, 360-degree views, charging ports, a cool box, and a first aid kit — designed for comfort on long game drive days.' },
                { icon: Star, title: 'Expert Certified Guides', desc: 'Our guides hold professional naturalist certifications and years of Tanzanian field experience. They speak excellent English and are gifted at reading both wildlife behaviour and guest emotion.' },
                { icon: Heart, title: 'Handpicked Accommodations', desc: 'Every lodge and tented camp in our portfolio has been personally visited and vetted — selected for location, comfort, cuisine, and the quality of its surrounding wildlife habitat.' },
                { icon: Shield, title: 'Full Safety Standards', desc: 'Park protocols, emergency communication systems, and our guides\' field training ensure your safety throughout. Every vehicle carries a first aid kit and emergency supplies.' },
                { icon: Users, title: 'Private, Personalised Service', desc: 'We do not mix guests from different bookings. Your safari vehicle is yours alone — which means departures when you choose, stops as long as you want, and a pace that suits you.' },
                { icon: Globe, title: 'Seamless End-to-End Logistics', desc: 'From Kilimanjaro airport arrival to your final departure transfer, every connection, park permit, and accommodation confirmation is handled by our operations team — invisibly and flawlessly.' },
              ].map((c) => {
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

      {/* ── 3. TOP DESTINATIONS ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-12">
            <SectionLabel>Where We Go</SectionLabel>
            <SectionHeading>Tanzania's Greatest Safari Destinations</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base">
              Tanzania's northern circuit contains some of the most celebrated wildlife habitats in Africa. Each destination has its own personality, its own rhythm, and its own irreplaceable encounters. Our safari circuits are carefully sequenced to give you the best of each park in its most rewarding seasonal state.
            </p>
          </motion.div>
          <div className="space-y-5">
            {destinations.map((d, i) => {
              const Icon = d.icon
              return (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="flex flex-col sm:flex-row gap-5 bg-beige/40 border border-gray-100 rounded-2xl p-6 hover:border-gold/30 transition-colors duration-300"
                >
                  <div className="flex-shrink-0 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                      <Icon size={18} className="text-gold" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-sans text-sm font-bold text-green-950">{d.name}</h3>
                      <span className="font-sans text-[10px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full">{d.tag}</span>
                    </div>
                    <p className="font-sans text-xs text-gray-500 leading-relaxed">{d.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 4. BEST TIME ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-green-950">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <SectionLabel>When to Visit</SectionLabel>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
              Best Time to Go on Safari in Tanzania
            </h2>
            <p className="font-sans text-white/60 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Tanzania offers rewarding safari experiences year-round. Understanding the seasons helps you design the journey that matches your wildlife priorities perfectly.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: Sun,
                title: 'Dry Season — June to October',
                badge: 'Peak Safari Season',
                badgeColor: 'text-green-300 bg-green-900/60',
                desc: 'The long dry season is the gold standard for wildlife viewing. Vegetation thins, animals concentrate around water sources, and the Serengeti\'s northern grasslands host the legendary Mara River crossings of the Great Migration. Visibility is exceptional and predator activity is at its highest. Accommodation fills quickly — early booking is essential.',
              },
              {
                icon: Star,
                title: 'Short Dry Season — January to March',
                badge: 'Calving Season',
                badgeColor: 'text-amber-300 bg-amber-900/40',
                desc: 'The southern Serengeti transforms into a nursery of life during the calving season. Wildebeest give birth to up to 8,000 calves per day, drawing every major predator in the ecosystem. January and February offer some of the most dramatic and emotionally charged wildlife encounters of the entire year — and with fewer tourists than the main dry season.',
              },
              {
                icon: Wind,
                title: 'Green Season — November & April–May',
                badge: 'Quiet & Lush',
                badgeColor: 'text-blue-300 bg-blue-900/40',
                desc: 'The rains bring the savannah back to vivid life. The landscape turns an almost implausible shade of green, migratory birds arrive in extraordinary numbers, and newborn animals appear across the parks. Accommodation rates drop significantly, park crowding is minimal, and the photographic quality of the light is extraordinary. A genuine alternative for the experienced traveler.',
              },
              {
                icon: Calendar,
                title: 'Year-Round Destination',
                badge: 'Always Rewarding',
                badgeColor: 'text-gold bg-gold/20',
                desc: 'Unlike some African destinations that close entirely during off-peak periods, Tanzania\'s major parks and reserves remain open year-round. The Ngorongoro Crater, Tarangire, and Lake Manyara offer outstanding wildlife encounters in every month. Our team will always recommend the optimal combination of parks based on your travel dates and interests.',
              },
            ].map((s) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-gold" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-sans text-sm font-bold text-white">{s.title}</h3>
                      <span className={`font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badgeColor}`}>{s.badge}</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-white/55 leading-relaxed">{s.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 5. PRIVATE VS GROUP ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Safari Types</SectionLabel>
            <SectionHeading>Private vs Group Safaris — Which Is Right for You?</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              The question of private versus group travel is the most important decision in your safari planning process — and at Nelson Tours and Safaris, we offer genuine flexibility to meet every traveler exactly where they are.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-green-600">
                <h3 className="font-sans text-base font-bold text-green-950 mb-3 flex items-center gap-2">
                  <Users size={18} className="text-gold" /> Private Safari
                  <span className="ml-auto font-sans text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Our Speciality</span>
                </h3>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-4">
                  A private safari is your personal expedition. The vehicle is yours. The schedule is yours. The stops are yours. If you want to spend three hours watching a leopard in a tree — you spend three hours watching a leopard in a tree. No other guests to consider, no group consensus, no compromise. Your guide becomes your personal naturalist and wilderness companion for the entire journey.
                </p>
                <ul className="space-y-2">
                  {[
                    'Total flexibility on departure times and pace',
                    'Ideal for couples, families, honeymoons, and special occasions',
                    'Deeper guide engagement and personalised storytelling',
                    'Choice of premium lodge or tented camp combinations',
                    'Better for wildlife photography with unobstructed angles',
                  ].map(p => (
                    <li key={p} className="flex items-start gap-2.5">
                      <CheckCircle size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="font-sans text-xs text-gray-600">{p}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="border-l-4 border-l-amber-400">
                <h3 className="font-sans text-base font-bold text-green-950 mb-3 flex items-center gap-2">
                  <Globe size={18} className="text-gold" /> Small Group Safari
                </h3>
                <p className="font-sans text-xs text-gray-500 leading-relaxed mb-4">
                  For solo travelers or those who enjoy sharing the experience with like-minded adventurers, our small-group departures offer an excellent balance of value, social connection, and quality. Groups are strictly limited to six guests maximum — preserving the intimacy and responsive guiding that defines the Nelson Tours and Safaris standard. You benefit from the full safari experience at a more accessible price point.
                </p>
                <ul className="space-y-2">
                  {[
                    'Maximum 6 guests per vehicle — never overcrowded',
                    'Excellent value for solo and budget-conscious travelers',
                    'Fixed departure dates — ideal for flexible planners',
                    'Same quality guides and lodge standards as private safaris',
                    'Great opportunity to share the experience with fellow travelers',
                  ].map(p => (
                    <li key={p} className="flex items-start gap-2.5">
                      <CheckCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="font-sans text-xs text-gray-600">{p}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 6. ACTIVITIES BEYOND GAME DRIVES ─────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-beige">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Beyond the Game Drive</SectionLabel>
            <SectionHeading>Safari Experiences That Go Further</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              A great Tanzanian safari is not defined by game drives alone. The most memorable journeys weave together wildlife, culture, landscape, and human connection in ways that make the experience genuinely irreplaceable. These are the signature additions that Nelson Tours and Safaris builds into your itinerary when the moments are right.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {experiences.map((e) => {
                const Icon = e.icon
                return (
                  <Card key={e.title}>
                    <div className="w-10 h-10 rounded-xl bg-beige flex items-center justify-center mb-4">
                      <Icon size={18} className="text-gold" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-sans text-sm font-bold text-green-950 mb-2">{e.title}</h3>
                    <p className="font-sans text-xs text-gray-500 leading-relaxed">{e.desc}</p>
                  </Card>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 7. DURATION ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Planning Your Trip</SectionLabel>
            <SectionHeading>How Long Should Your Safari Be?</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              The honest answer is: longer than you think. First-time visitors to Tanzania consistently say — when we speak with them after their trip — that they wished they had stayed another few days. The safari rhythm takes time to find. The first day is exciting but still slightly overwhelming. By day three, you are reading the landscape differently. By day five, the bush has become a familiar language. Give yourself the space to let that happen.
            </p>
            <div className="space-y-3">
              {[
                { days: '3–4 Days', title: 'The Introduction', badge: 'Short Break', badgeCol: 'bg-blue-50 text-blue-700', desc: 'A short but vivid introduction to the northern Tanzania circuit. Ideal for travelers with limited time who still want a genuine wildlife experience. We recommend Ngorongoro + Tarangire for a 3–4 day circuit — offering guaranteed wildlife density and manageable transfer distances.' },
                { days: '5–6 Days', title: 'The Classic Safari', badge: 'Most Popular', badgeCol: 'bg-green-50 text-green-700', desc: 'The sweet spot for most first-time Tanzania visitors. A 5–6 day itinerary allows for the Serengeti, Ngorongoro Crater, and one additional park — giving you the variety of landscapes and wildlife encounters that Tanzania is famous for. Long enough to find your rhythm. Short enough to feel action-packed.' },
                { days: '7–9 Days', title: 'The Full Northern Circuit', badge: 'Highly Recommended', badgeCol: 'bg-amber-50 text-amber-700', desc: 'With seven to nine days, you access the full grandeur of northern Tanzania — multiple Serengeti regions, the crater floor, Tarangire, Lake Manyara, and the option for a balloon safari or Maasai cultural experience. This is the itinerary length that produces the most extraordinary diversity of sightings and the most complete safari story.' },
                { days: '10+ Days', title: 'The Ultimate Expedition', badge: 'For the Discerning Traveler', badgeCol: 'bg-purple-50 text-purple-700', desc: 'For travelers who want everything — a full Serengeti crossing following the migration route, a beach extension in Zanzibar, Kilimanjaro at dawn, a walking safari, a balloon flight, and evenings at some of Tanzania\'s finest private conservancy camps — ten or more days begins to approach the full portrait of what this extraordinary country can offer.' },
              ].map((d, i) => (
                <motion.div
                  key={d.days}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="flex flex-col sm:flex-row gap-4 bg-beige/40 border border-gray-100 rounded-2xl px-6 py-5 hover:border-gold/30 transition-colors duration-300"
                >
                  <div className="flex-shrink-0 text-center sm:w-24">
                    <p className="font-serif text-xl font-bold text-gold">{d.days}</p>
                    <span className={`font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full ${d.badgeCol}`}>{d.badge}</span>
                  </div>
                  <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-200 sm:pl-5 pt-3 sm:pt-0">
                    <h3 className="font-sans text-sm font-bold text-green-950 mb-1">{d.title}</h3>
                    <p className="font-sans text-xs text-gray-500 leading-relaxed">{d.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 8. WHAT TO PACK ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-beige">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionLabel>Packing Guide</SectionLabel>
            <SectionHeading>What to Pack for a Tanzania Safari</SectionHeading>
            <p className="font-sans text-gray-600 leading-relaxed text-base mb-8">
              Packing for a safari is both simpler and more important than most first-timers expect. The goal is light, practical, and adaptable — clothing that keeps you comfortable from the cool pre-dawn game drive to the warm midday sun to the crisp night air of the Serengeti. Our pre-departure packing list is included with every booking confirmation.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Backpack, cat: 'Clothing', items: ['Neutral-toned shirts and trousers (khaki, olive, beige)', 'Warm fleece or light down jacket for mornings', 'Rain jacket or lightweight poncho', 'Comfortable walking shoes or light boots', 'Sun hat with a wide brim', 'Swimwear for lodge pools'] },
                { icon: Shield, cat: 'Health & Protection', items: ['High-SPF sunscreen (minimum SPF 50)', 'Insect repellent with DEET for evenings', 'Personal malaria prophylaxis as prescribed', 'Basic personal first aid kit', 'Hand sanitiser and wet wipes', 'Prescription medications (at least double supply)'] },
                { icon: Camera, cat: 'Photography', items: ['Camera with telephoto lens (200–400mm recommended)', 'Extra batteries and memory cards', 'Lens cleaning kit and dust protection', 'Binoculars (8×42 or 10×42 magnification)', 'Waterproof bag or dry sack for equipment', 'GoPro or compact camera for vehicle mounting'] },
                { icon: Zap, cat: 'Electronics & Essentials', items: ['Universal travel adaptor (Tanzania uses Type G)', 'Portable power bank', 'Headlamp or small torch for camp walks', 'E-reader or entertainment for lodge evenings', 'Travel insurance documents (physical and digital copies)', 'Passport with minimum 6 months validity'] },
                { icon: AlertTriangle, cat: 'Documents & Admin', items: ['Valid passport + Tanzania visa or e-visa confirmation', 'Travel and medical insurance certificate', 'Copy of your Nelson Tours booking confirmation', 'Emergency contact numbers (including ours)', 'Yellow fever certificate if required for your route', 'Credit card and small amount of USD cash for tips'] },
                { icon: Heart, cat: 'Comfort Items', items: ['Lightweight daypack for game drive essentials', 'Reusable water bottle (we refill at every camp)', 'Lip balm with SPF protection', 'Small notebook or safari journal', 'Any personal comfort items for bush camping', 'Warm socks for cold morning and evening temperatures'] },
              ].map((p) => {
                const Icon = p.icon
                return (
                  <div key={p.cat} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center">
                        <Icon size={15} className="text-gold" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-sans text-xs font-bold text-green-950">{p.cat}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {p.items.map(item => (
                        <li key={item} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                          <span className="font-sans text-[11px] text-gray-500 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 9. TRAVEL TIPS ───────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-green-950">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <SectionLabel>Practical Information</SectionLabel>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
              Travel Tips & Important Information
            </h2>
            <p className="font-sans text-white/60 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Every detail that matters before you land at Kilimanjaro International Airport — gathered from years of preparing international travelers for their Tanzanian adventure.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Globe, title: 'Entry & Visas', desc: 'Most nationalities require a visa to enter Tanzania. The East Africa Tourist Visa covers Tanzania, Kenya, and Uganda in one application. Apply online via the official Tanzania Immigration portal at least 2–3 weeks before departure. Our team provides a pre-departure checklist with the exact requirements for your nationality.' },
              { icon: Shield, title: 'Health & Vaccinations', desc: 'Consult a travel health clinic 6–8 weeks before departure. Yellow fever vaccination may be required depending on your routing. Malaria prophylaxis is strongly recommended for all safari areas. Tap water is not safe to drink — we provide filtered or bottled water at all times.' },
              { icon: Zap, title: 'Currency & Payments', desc: 'Tanzania uses the Tanzanian Shilling (TZS). US Dollars are widely accepted in lodges, shops, and for tipping. Carry clean, undamaged USD notes printed after 2006. ATMs are available in Arusha but rare inside national parks. We accept major international payment methods for bookings.' },
              { icon: Users, title: 'Tipping Culture', desc: 'Tipping is a meaningful part of safari culture and directly impacts the livelihoods of guides, camp staff, and porters. We provide a transparent tipping guide with every booking, with suggested ranges based on group size and service quality. Never feel pressured — but do know that a thoughtful tip is deeply appreciated.' },
              { icon: Clock, title: 'Flight & Transfer Info', desc: 'Kilimanjaro International Airport (JRO) is the gateway for all northern Tanzania safaris. Arusha town is approximately 45 minutes from the airport. We coordinate all arrival and departure transfers, including early morning and late-night flights. Dar es Salaam (DAR) is an alternative gateway for southern circuit additions.' },
              { icon: Leaf, title: 'Ethical Wildlife Etiquette', desc: 'Tanzania\'s wildlife deserves our deepest respect. Stay in the vehicle during game drives unless instructed otherwise. Never feed animals. Do not make loud noises near wildlife. Avoid single-use plastics inside national parks. Follow your guide\'s instructions at all times — they exist to protect both you and the animals.' },
            ].map((t) => {
              const Icon = t.icon
              return (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans text-sm font-bold text-white mb-2">{t.title}</h3>
                  <p className="font-sans text-xs text-white/55 leading-relaxed">{t.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 10. FAQs ─────────────────────────────────────────────────────────── */}
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

      {/* ── 11. CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 bg-green-950 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/images/sections/parallax-serengeti.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold mb-4">Begin Your Safari</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Tanzania Is Ready. <br className="hidden sm:block" />Are You?
            </h2>
            <p className="font-sans text-white/65 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              The Serengeti does not wait. The lions are out there right now — stretching in the morning sun, watching wildebeest on the horizon, living their extraordinary lives with complete indifference to the world beyond the grass. Nelson Tours and Safaris will take you there. We will show you Africa in a way that stays with you for the rest of your life. All you have to do is decide that this is the year you go.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/tours"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold/90 text-white font-sans font-semibold text-base px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Explore Safari Tours <ArrowRight size={16} />
              </Link>
              <a
                href="https://wa.me/255750005973"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-sans font-semibold text-base px-8 py-4 rounded-full transition-all duration-300"
              >
                Chat with an Expert
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
