import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ArrowRight, Rss } from 'lucide-react'

const SAMPLE_POSTS = [
  {
    id: 1,
    title: 'Best Time to Climb Kilimanjaro',
    excerpt: 'Planning your Kilimanjaro summit? Here\'s everything you need to know about weather windows, crowds, and the ideal months to attempt Africa\'s highest peak.',
    category: 'Kilimanjaro',
    date: 'March 2025',
    image: 'https://images.unsplash.com/photo-1621414050345-53db43f7e7ab?w=800&q=80&auto=format&fit=crop',
    readTime: '6 min read',
  },
  {
    id: 2,
    title: 'The Great Migration: A Season-by-Season Guide',
    excerpt: 'Witness one of nature\'s most dramatic spectacles. We break down exactly when and where to find the wildebeest migration throughout the year.',
    category: 'Wildlife',
    date: 'February 2025',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80&auto=format&fit=crop',
    readTime: '8 min read',
  },
  {
    id: 3,
    title: 'Zanzibar Island Hopping: The Complete Guide',
    excerpt: 'From Stone Town\'s spice markets to the pristine sands of Mnemba Atoll — discover every corner of the Spice Islands with our insider guide.',
    category: 'Beach & Island',
    date: 'January 2025',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&q=80&auto=format&fit=crop',
    readTime: '7 min read',
  },
  {
    id: 4,
    title: 'Packing for a Tanzania Safari: The Ultimate List',
    excerpt: 'Don\'t let packing stress ruin your adventure. Our experienced guides share exactly what to bring — and what to leave at home.',
    category: 'Travel Tips',
    date: 'December 2024',
    image: 'https://images.unsplash.com/photo-1568017388877-13bff411e1b5?w=800&q=80&auto=format&fit=crop',
    readTime: '5 min read',
  },
  {
    id: 5,
    title: 'Ngorongoro Crater: Africa\'s Garden of Eden',
    excerpt: 'Descend into the world\'s largest intact volcanic caldera, home to the densest concentration of wildlife on the planet — including the endangered black rhino.',
    category: 'Destinations',
    date: 'November 2024',
    image: 'https://images.unsplash.com/photo-1551244072-5d12893278bc?w=800&q=80&auto=format&fit=crop',
    readTime: '6 min read',
  },
  {
    id: 6,
    title: 'Hot-Air Balloon Safari: What to Expect',
    excerpt: 'Floating silently over the Serengeti at dawn is a bucket-list experience like no other. Here\'s everything you need to know before you go.',
    category: 'Experiences',
    date: 'October 2024',
    image: 'https://images.unsplash.com/photo-1502920514313-52581002a659?w=800&q=80&auto=format&fit=crop',
    readTime: '4 min read',
  },
]

const categoryColors = {
  'Kilimanjaro':   'bg-blue-50 text-blue-700',
  'Wildlife':      'bg-amber-50 text-amber-700',
  'Beach & Island':'bg-cyan-50 text-cyan-700',
  'Travel Tips':   'bg-purple-50 text-purple-700',
  'Destinations':  'bg-green-50 text-green-700',
  'Experiences':   'bg-orange-50 text-orange-700',
}

export default function Blog() {
  const [featured, ...rest] = SAMPLE_POSTS

  return (
    <div className="bg-[#faf8f3] min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-green-950 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1a5c42_0%,_#0f3d2e_60%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-sans text-[11px] font-semibold text-[#c9a96e] uppercase tracking-[0.25em] mb-3"
          >
            Stories &amp; Guides
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5"
          >
            The Nelson Safari Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-base text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Travel guides, wildlife insights, destination spotlights, and stories from the field — everything you need to plan your perfect Tanzania adventure.
          </motion.p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Featured post */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100 mb-12 grid md:grid-cols-2"
          >
            <div className="relative h-64 md:h-auto overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className={`font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${categoryColors[featured.category]}`}>
                  {featured.category}
                </span>
                <span className="font-sans text-xs text-gray-400">{featured.date} · {featured.readTime}</span>
              </div>
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-green-950 mb-4 group-hover:text-green-700 transition-colors leading-tight">
                {featured.title}
              </h2>
              <p className="font-sans text-sm text-gray-500 leading-relaxed mb-6 line-clamp-3">
                {featured.excerpt}
              </p>
              <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-green-800 hover:text-green-600 transition-colors cursor-pointer">
                Read Article <ArrowRight size={14} />
              </span>
            </div>
          </motion.div>

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {rest.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${categoryColors[post.category]}`}>
                      {post.category}
                    </span>
                    <span className="font-sans text-[11px] text-gray-400">{post.readTime}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-green-950 mb-2 group-hover:text-green-700 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="font-sans text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs text-gray-400">{post.date}</span>
                    <span className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-green-800 group-hover:text-green-600 transition-colors">
                      Read <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming soon notice */}
          <div className="mt-14 text-center">
            <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
              <Rss size={16} className="text-amber-600 flex-shrink-0" />
              <p className="font-sans text-sm text-amber-800">
                <strong>More articles coming soon.</strong> Subscribe to stay updated on new guides and stories.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Newsletter CTA ────────────────────────────────────────────────── */}
      <section className="bg-green-950 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <BookOpen size={32} className="text-[#c9a96e] mx-auto mb-4" />
          <h2 className="font-serif text-3xl font-bold text-white mb-3">
            Never Miss a Story
          </h2>
          <p className="font-sans text-white/60 mb-8 text-sm leading-relaxed">
            Get travel tips, wildlife guides, and exclusive offers straight to your inbox.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-[#c9a96e] text-white font-sans font-semibold text-sm px-8 py-3 rounded-full hover:bg-[#b8935a] transition-colors shadow-lg"
          >
            Get in Touch <ArrowRight size={15} />
          </Link>
        </div>
      </section>

    </div>
  )
}
