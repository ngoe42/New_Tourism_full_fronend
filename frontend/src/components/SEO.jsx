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

export default function SEO({ title, description, canonicalPath, noindex, image }) {
  const { pathname, search } = useLocation()
  const isStaging = typeof window !== 'undefined' && window.location.hostname.includes('.up.railway.app')
  const shouldNoindex = noindex !== undefined ? noindex : isStaging

  const cleanParams = new URLSearchParams(search)
  TRACKING_PARAMS.forEach(p => cleanParams.delete(p))
  const cleanSearch = cleanParams.toString()
  const queryString = cleanSearch ? `?${cleanParams.toString()}` : ''

  const path = normalizePath(canonicalPath || pathname)
  const url = `${PRODUCTION_URL}${path}${queryString}`
  const ogImage = image || `${PRODUCTION_URL}/favicon.png`

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />
      {shouldNoindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
