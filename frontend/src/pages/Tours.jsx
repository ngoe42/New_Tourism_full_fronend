import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import TourCard from '../components/TourCard'
import { toursApi } from '../api/tours'
import { categories } from '../data/tours'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { resolveImageUrl } from '../utils/imageUrl'

export default function Tours() {
  const { showPrices, toursHeroLabel, toursHeroTitle, toursHeroDescription, toursHeroImage } = useSiteSettings()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlCategory = searchParams.get('category')
  const [activeCategory, setActiveCategory] = useState(
    urlCategory && categories.includes(urlCategory) ? urlCategory : 'All'
  )
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (urlCategory && categories.includes(urlCategory)) {
      setActiveCategory(urlCategory)
    }
  }, [urlCategory])

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    if (cat === 'All') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', cat)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tours', activeCategory, debouncedSearch, sortBy],
    queryFn: () =>
      toursApi.list({
        q: debouncedSearch || undefined,
        category: activeCategory !== 'All' ? activeCategory : undefined,
        per_page: 50,
      }),
  })

  const allTours = data?.items ?? []

  const filtered = [...allTours].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    if (sortBy === 'rating') return b.rating - a.rating
    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
  })

  return (
    <main className="min-h-screen">
      {/* Page Hero */}
      <section className="relative pt-28 sm:pt-36 pb-14 sm:pb-20 bg-green-950 overflow-hidden">
        <div className="absolute inset-0 opacity-60">
          <img
            src={toursHeroImage ? resolveImageUrl(toursHeroImage) : '/images/hero-bg.jpg'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/30 to-green-950/70" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-gold font-sans text-sm font-medium tracking-[0.2em] uppercase block mb-3"
          >
            {toursHeroLabel || 'All Experiences'}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-semibold leading-tight mb-4"
          >
            {toursHeroTitle || 'Safari Tours & Expeditions'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-white/60 text-lg max-w-xl mx-auto"
          >
            {toursHeroDescription || `${data?.total ?? '…'} carefully curated journeys across Tanzania's most iconic landscapes.`}
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="Search tours, locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-full pl-10 pr-10 py-2.5 font-sans text-sm text-gray-700 focus:outline-none focus:border-gold transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible scrollbar-none -mx-6 px-6 lg:mx-0 lg:px-0" style={{scrollbarWidth:'none'}}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`font-sans text-xs font-medium px-4 py-2 rounded-full transition-all duration-200 flex-shrink-0 ${
                    activeCategory === cat
                      ? 'bg-green-950 text-white shadow-sm'
                      : 'bg-beige text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <SlidersHorizontal size={14} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-sans text-sm text-gray-600 border-none bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="rating">Top Rated</option>
                {showPrices && <option value="price-asc">Price: Low to High</option>}
                {showPrices && <option value="price-desc">Price: High to Low</option>}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 bg-beige min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <p className="font-sans text-sm text-gray-500">
              {isLoading ? 'Loading tours…' : <>Showing <span className="font-semibold text-green-950">{filtered.length}</span> tours{activeCategory !== 'All' && ` in ${activeCategory}`}</>}
            </p>
          </div>

          {isError && (
            <div className="text-center py-16">
              <p className="font-sans text-red-500 mb-4">Unable to load tours. Is the backend running?</p>
              <p className="font-sans text-gray-400 text-sm">Make sure the API is running at {import.meta.env.VITE_API_URL || 'http://localhost:8002'}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-24">
              <Loader2 size={40} className="animate-spin text-gold" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isLoading && !isError && filtered.length > 0 ? (
              <motion.div
                key={activeCategory + search + sortBy}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filtered.map((tour, i) => (
                  <TourCard key={tour.id} tour={tour} index={i} />
                ))}
              </motion.div>
            ) : !isLoading && !isError ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="text-6xl mb-4">🦁</div>
                <h3 className="font-serif text-2xl text-green-950 mb-2">No tours found</h3>
                <p className="font-sans text-gray-500 text-sm mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => { setSearch(''); setActiveCategory('All') }}
                  className="btn-outline-dark text-sm"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}
