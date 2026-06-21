import { Helmet } from 'react-helmet-async'

const PRODUCTION_URL = import.meta.env.VITE_PRODUCTION_URL || 'https://nelsontoursandsafaris.com'

export default function SEO({ title, description, canonicalPath, noindex }) {
  const isStaging = typeof window !== 'undefined' && window.location.hostname.includes('.up.railway.app')
  const shouldNoindex = noindex !== undefined ? noindex : isStaging
  const path = canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/')

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={`${PRODUCTION_URL}${path}`} />
      {shouldNoindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
