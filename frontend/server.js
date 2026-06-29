import { createServer, request as httpRequest } from 'http'
import { request as httpsRequest } from 'https'
import { readFileSync } from 'fs'
import { extname, join, resolve } from 'path'

const PORT = process.env.PORT || 3000
const DIST = resolve('dist')
const PRODUCTION_DOMAIN = 'nelsontoursandsafaris.com'
const INDEX = join(DIST, 'index.html')
const NOT_FOUND = join(DIST, '404.html')

// Backend API base — derive from VITE_API_URL or default to api subdomain
const API_HOST = (process.env.VITE_API_URL || 'https://api.nelsontoursandsafaris.com/api/v1')
  .replace(/^https?:\/\//, '')
  .split('/')[0]
  .split(':')[0]
const API_PROTOCOL = (process.env.VITE_API_URL || 'https://api.nelsontoursandsafaris.com/api/v1')
  .startsWith('http://') ? 'http' : 'https'

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
}

const ASSET_EXTENSIONS = new Set(Object.keys(MIME_TYPES))

function serveFile(res, filePath, statusCode = 200) {
  try {
    const content = readFileSync(filePath)
    const ext = extname(filePath)
    res.writeHead(statusCode, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
    res.end(content)
    return true
  } catch {
    return false
  }
}

function hasFileExtension(urlPath) {
  const base = urlPath.split('/').pop() || ''
  return base.includes('.')
}

const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'msclkid',
  'ref', 'source', 'si', 's_kwcid',
])

function stripTrackingParams(query) {
  if (!query) return ''
  const params = new URLSearchParams(query)
  for (const key of TRACKING_PARAMS) params.delete(key)
  const clean = params.toString()
  return clean ? `?${clean}` : ''
}

function fallbackStatic(path, res) {
  serveFile(res, join(DIST, path), 200)
}

// Route metadata for SEO (mirrors App.jsx routes)
const ROUTE_META = {
  '/':                        { title: 'Nelson Tour and Safari — Luxury Tanzania Experiences',          description: 'World-class luxury safari experiences in Tanzania. Crafted by local experts for unforgettable adventures.' },
  '/tours':                   { title: 'Tours — Nelson Tour and Safari',                               description: 'Explore our curated selection of luxury safari tours and mountain trekking adventures in Tanzania.' },
  '/routes':                  { title: 'Climbing Routes — Nelson Tour and Safari',                     description: 'Discover the best climbing routes for Kilimanjaro, Meru, and other Tanzanian peaks.' },
  '/experiences':             { title: 'Experiences — Nelson Tour and Safari',                         description: 'Curated luxury experiences across Tanzania — from wildlife safaris to cultural immersions.' },
  '/blog':                    { title: 'Blog — Nelson Tour and Safari',                                description: 'Travel guides, tips, and stories from Tanzania\'s premier safari and trekking experts.' },
  '/about':                   { title: 'About Us — Nelson Tour and Safari',                            description: 'Meet the local experts behind Nelson Tour and Safari — your trusted guide to Tanzania.' },
  '/kilimanjaro':             { title: 'Mount Kilimanjaro — Nelson Tour and Safari',                   description: 'Climb Mount Kilimanjaro with expert local guides. Choose from multiple routes for the adventure of a lifetime.' },
  '/trekking':                { title: 'Trekking — Nelson Tour and Safari',                            description: 'Trekking adventures across Tanzania\'s most breathtaking landscapes with experienced guides.' },
  '/meru':                    { title: 'Mount Meru — Nelson Tour and Safari',                          description: 'Climb Mount Meru — Tanzania\'s second-highest peak and the perfect warm-up for Kilimanjaro.' },
  '/oldoinyo-lengai':         { title: 'Oldoinyo Lengai — Nelson Tour and Safari',                     description: 'Trek the sacred Mountain of God — an active volcanic climb in the Great Rift Valley.' },
  '/safari':                  { title: 'Tanzania Safaris — Nelson Tour and Safari',                    description: 'Luxury safari experiences in Tanzania\'s most iconic national parks — Serengeti, Ngorongoro, and beyond.' },
  '/contact':                 { title: 'Contact Us — Nelson Tour and Safari',                          description: 'Get in touch with Nelson Tour and Safari. Plan your dream Tanzanian adventure today.' },
  '/login':                   { title: 'Login — Nelson Tour and Safari',                               description: '' },
  '/login/admin':             { title: 'Admin Login — Nelson Tour and Safari',                          description: '' },
  '/login/admin/forgot':      { title: 'Forgot Password — Nelson Tour and Safari',                      description: '' },
  '/payment/callback':        { title: 'Payment — Nelson Tour and Safari',                              description: '' },
  '/payment/resume':          { title: 'Resume Payment — Nelson Tour and Safari',                        description: '' },
  '/reset-password':          { title: 'Reset Password — Nelson Tour and Safari',                        description: '' },
  // Specific tour pages (in order of priority for Google indexing)
  '/tours/1-day-arusha-to-arusha-national-park':
                              { title: '1-Day Arusha National Park Tour — Nelson Tour and Safari',        description: 'Experience Arusha National Park in one day. Game drives, canopy walk, and stunning views of Mount Meru with expert guides.' },
  '/tours/tarangire-national-park-day-trip':
                              { title: 'Tarangire National Park Day Trip — Nelson Tour and Safari',       description: 'Day trip to Tarangire National Park. Witness massive elephant herds, baobab trees, and incredible birdlife just hours from Arusha.' },
  '/tours/5-day-exclusive-mafia-island-experience':
                              { title: '5-Day Mafia Island Luxury Experience — Nelson Tour and Safari',   description: 'Escape to Mafia Island for 5 days of pristine beaches, world-class snorkeling, whale sharks, and luxury coastal relaxation in Tanzania.' },
}

const SITE_LOGO_URL = 'https://nelsontoursandsafaris.com/images/logo/logo.png'

function seoMetaForPath(path) {
  if (ROUTE_META[path]) return ROUTE_META[path]
  if (path.startsWith('/tours/')) return { title: 'Tour Details — Nelson Tour and Safari', description: 'Explore this luxury safari tour in Tanzania.' }
  if (path.startsWith('/routes/')) return { title: 'Climbing Route — Nelson Tour and Safari', description: 'Detailed information about this Kilimanjaro climbing route.' }
  if (path.startsWith('/booking/')) return { title: 'Booking Confirmation — Nelson Tour and Safari', description: '' }
  return null
}

function h1ForPath(path) {
  if (path === '/') return 'Nelson Tour and Safari'
  const meta = seoMetaForPath(path)
  if (meta) return meta.title.replace(/ —.*$/, '')
  return 'Nelson Tour and Safari'
}

const server = createServer((req, res) => {
  const host = (req.headers.host || '').split(':')[0].toLowerCase()
  const [pathPart, rawQuery] = req.url.split('?')
  let path = pathPart
  const queryString = stripTrackingParams(rawQuery)
  const isStaging = host.includes('.up.railway.app')

  let redirectUrl = null

  // Normalise path first (lowercase, strip trailing slash)
  let normalised = path
  if (!hasFileExtension(normalised)) {
    normalised = normalised.toLowerCase()
  }
  if (normalised.length > 1 && normalised.endsWith('/')) {
    normalised = normalised.replace(/\/+$/, '')
  }

  // www → non-www
  if (host === `www.${PRODUCTION_DOMAIN}`) {
    redirectUrl = `https://${PRODUCTION_DOMAIN}${normalised}`
  }

  // Railway staging → production (server-side 301 for Googlebot)
  if (!redirectUrl && isStaging) {
    redirectUrl = `https://${PRODUCTION_DOMAIN}${normalised}`
  }

  // Path normalisation (only if no other redirect already set)
  if (!redirectUrl && normalised !== path) {
    redirectUrl = `https://${host}${normalised}`
  }

  if (redirectUrl) {
    redirectUrl += queryString
    res.writeHead(301, { Location: redirectUrl })
    res.end()
    return
  }

  // Proxy sitemap and robots to the backend (includes dynamic tour/route pages)
  if (path === '/sitemap.xml' || path === '/robots.txt') {
    const backendPath = `${path}`
    const opts = {
      hostname: API_HOST,
      port: 443,
      path: backendPath,
      method: req.method,
      headers: { ...req.headers, host: API_HOST },
    }
    const proxyReq = (API_PROTOCOL === 'http' ? httpRequest : httpsRequest)(opts, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res)
    })
    proxyReq.on('error', () => fallbackStatic(path, res))
    proxyReq.end()
    return
  }

  // SPA — serve index.html with full SEO metadata injected for Google's Wave 1 crawl
  const isSPARoute = path === '/' || !hasFileExtension(path)
  if (isSPARoute) {
    try {
      let indexContent = readFileSync(INDEX, 'utf-8')
      const canonicalUrl = `https://${PRODUCTION_DOMAIN}${path}${queryString}`
      const meta = seoMetaForPath(path)
      const title = meta ? meta.title : 'Nelson Tour and Safari'
      const description = meta ? meta.description : ''

      const safe = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

      // Add noindex for Railway staging (Google ignores X-Robots-Tag on 3xx, so serve 200 with noindex)
      if (isStaging) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow')
        indexContent = indexContent.replace(
          '</head>',
          '  <meta name="robots" content="noindex, nofollow" />\n</head>'
        )
      }

      // Replace SEO marker placeholders
      indexContent = indexContent.replace('<!--SEO:title-->', safe(title))
      indexContent = indexContent.replace('<!--SEO:description-->', safe(description))

      // Inject canonical + Open Graph + Twitter Card tags
      const seoHead = [
        `  <link rel="canonical" href="${canonicalUrl}" />`,
        `  <meta property="og:type" content="website" />`,
        `  <meta property="og:url" content="${safe(canonicalUrl)}" />`,
        `  <meta property="og:title" content="${safe(title)}" />`,
        `  <meta property="og:description" content="${safe(description)}" />`,
        `  <meta property="og:image" content="${SITE_LOGO_URL}" />`,
        `  <meta name="twitter:card" content="summary_large_image" />`,
        `  <meta name="twitter:title" content="${safe(title)}" />`,
        `  <meta name="twitter:description" content="${safe(description)}" />`,
        `  <meta name="twitter:image" content="${SITE_LOGO_URL}" />`,
      ].join('\n')
      indexContent = indexContent.replace('</head>', seoHead + '\n</head>')

      // Inject JSON-LD structured data for homepage (TravelAgency schema)
      if (path === '/') {
        const jsonLd = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'TravelAgency',
          name: 'Nelson Tour and Safari',
          url: 'https://nelsontoursandsafaris.com',
          logo: SITE_LOGO_URL,
          description: 'World-class luxury safari experiences in Tanzania.',
          image: SITE_LOGO_URL,
          address: { '@type': 'PostalAddress', addressCountry: 'TZ' },
          sameAs: [
            'https://www.facebook.com/nelson.michael.39',
            'https://www.instagram.com/nelson_tour_and_safari',
            'https://twitter.com/nelsonsafari',
            'https://youtube.com/@nelsonsafari',
          ],
        })
        indexContent = indexContent.replace(
          '</head>',
          `  <script type="application/ld+json">${jsonLd}</script>\n</head>`
        )
      }

      // Inject visible content inside #root so Google's first wave sees real content
      // React will replace this when JS loads, but Google reads it during wave-1 crawl
      if (path === '/') {
        const heroHtml = [
          '<div style="max-width:1200px;margin:0 auto;padding:100px 24px;color:#1a1a2e">',
          '  <h1 style="font-size:2.5rem;font-weight:700;margin-bottom:1rem">Explore Tanzania Like Never Before</h1>',
          '  <p style="font-size:1.125rem;line-height:1.6;margin-bottom:1.5rem;max-width:600px">Designed by local experts to create unforgettable journeys, from the wild beauty of the Serengeti National Park to the majestic heights of Mount Kilimanjaro.</p>',
          '  <p><a href="/tours" style="display:inline-block;padding:10px 28px;background:#c8a97e;color:#fff;text-decoration:none;border-radius:4px">Explore Tours</a></p>',
          '  <p style="margin-top:2rem;font-size:0.875rem;color:#666">Nelson Tour and Safari — World-class luxury safari experiences in Tanzania. Crafted by local experts for unforgettable adventures.</p>',
          '</div>',
        ].join('\n')
        indexContent = indexContent.replace(
          '<div id="root"></div>',
          `<div id="root">${heroHtml}</div>`
        )
      } else {
        const heading = h1ForPath(path)
        indexContent = indexContent.replace(
          '<div id="root"></div>',
          `<div id="root"><h1>${safe(heading)}</h1></div>`
        )
      }

      const cacheControl = 'no-cache, no-store, must-revalidate'
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': cacheControl, 'Link': `<${canonicalUrl}>; rel="canonical"` })
      res.end(indexContent)
      return
    } catch {
      serveFile(res, INDEX, 200)
      return
    }
  }

  // Static asset with known extension → 404 (don't serve SPA HTML)
  if (serveFile(res, join(DIST, path), 200)) return
  if (serveFile(res, NOT_FOUND, 404)) return
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not Found')
})

server.listen(PORT, () => {
  console.log(`[server] listening on 0.0.0.0:${PORT}`)
  if (process.env.VITE_API_URL) {
    console.log(`[server] API → ${process.env.VITE_API_URL}`)
  }
})
