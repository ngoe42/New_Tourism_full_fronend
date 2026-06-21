import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const PRODUCTION_URL = import.meta.env.VITE_PRODUCTION_URL || 'https://nelsontoursandsafaris.com'

const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'msclkid',
  'ref', 'source', 'si', 's_kwcid',
]

function normalizePath(path) {
  let normalized = path.toLowerCase()
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.replace(/\/+$/, '')
  }
  return normalized
}

export default function SEO({ title, description, canonicalPath, noindex }) {
  const { pathname, search } = useLocation()
  const isStaging = typeof window !== 'undefined' && window.location.hostname.includes('.up.railway.app')
  const shouldNoindex = noindex !== undefined ? noindex : isStaging

  const cleanParams = new URLSearchParams(search)
  TRACKING_PARAMS.forEach(p => cleanParams.delete(p))
  const cleanSearch = cleanParams.toString()
  const queryString = cleanSearch ? `?${cleanParams.toString()}` : ''

  const path = normalizePath(canonicalPath || pathname)

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={`${PRODUCTION_URL}${path}${queryString}`} />
      {shouldNoindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
