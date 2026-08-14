import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { breadcrumbSchema } from '../utils/schema'

/**
 * Visible breadcrumb trail + matching BreadcrumbList JSON-LD, so the
 * structured data always represents the same hierarchy shown on screen.
 * items: [{ name, path }] — path is site-relative; the last item is the
 * current page and renders as plain text (no link).
 */
export default function Breadcrumbs({ items, dark = false }) {
  if (!items || items.length < 2) return null
  const textColor = dark ? 'text-white/50' : 'text-gray-400'
  const linkHover = dark ? 'hover:text-white/80' : 'hover:text-green-800'
  const currentColor = dark ? 'text-white/70' : 'text-gray-600'

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema(items))}</script>
      </Helmet>
      <nav aria-label="Breadcrumb" className={`flex items-center flex-wrap gap-1.5 font-sans text-xs ${textColor}`}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <span key={item.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={11} className="flex-shrink-0" />}
              {isLast ? (
                <span className={currentColor} aria-current="page">{item.name}</span>
              ) : (
                <Link to={item.path} className={`transition-colors ${linkHover}`}>{item.name}</Link>
              )}
            </span>
          )
        })}
      </nav>
    </>
  )
}
