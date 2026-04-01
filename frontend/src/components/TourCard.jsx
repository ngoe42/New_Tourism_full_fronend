import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Star, Clock, Users, MapPin, ArrowRight } from 'lucide-react'

export default function TourCard({ tour, index = 0 }) {
  const coverImage =
    tour.images?.find((i) => i.is_cover)?.url ??
    tour.images?.[0]?.url ??
    tour.image ??
    '/images/hero-bg.jpg'
  const groupSize = tour.group_size ?? tour.groupSize ?? ''
  const reviewCount = tour.review_count ?? tour.reviewCount ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={coverImage}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badge */}
        {tour.badge && (
          <div className="absolute top-4 left-4">
            <span className="bg-gold text-white font-sans text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide shadow-lg">
              {tour.badge}
            </span>
          </div>
        )}

        {/* Category */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm text-green-950 font-sans text-xs font-medium px-3 py-1.5 rounded-full">
            {tour.category}
          </span>
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          <Link
            to={`/tours/${tour.slug ?? tour.id}`}
            className="bg-white text-green-950 font-sans text-xs font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-gold hover:text-white transition-colors duration-300"
          >
            View Details <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Location */}
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={13} className="text-gold" />
          <span className="font-sans text-xs text-gray-400 tracking-wide">{tour.location}</span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-semibold text-green-950 leading-snug mb-1 group-hover:text-gold transition-colors duration-300">
          {tour.title}
        </h3>
        <p className="font-sans text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-2">
          {tour.subtitle}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 mb-4 text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock size={13} />
            <span className="font-sans text-xs">{tour.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} />
            <span className="font-sans text-xs">{groupSize}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-gold fill-gold" />
            <span className="font-sans text-sm font-semibold text-green-950">{tour.rating}</span>
            <span className="font-sans text-xs text-gray-400">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="font-sans text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">From</div>
            <div className="font-serif text-xl font-semibold text-green-950">
              ${(tour.price ?? 0).toLocaleString()}
            </div>
            <div className="font-sans text-[10px] text-gray-400">per person</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
