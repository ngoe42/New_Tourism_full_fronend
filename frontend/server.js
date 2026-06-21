import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { extname, join, resolve } from 'path'

const PORT = process.env.PORT || 3000
const DIST = resolve('dist')
const PRODUCTION_DOMAIN = 'nelsontoursandsafaris.com'
const INDEX = join(DIST, 'index.html')
const NOT_FOUND = join(DIST, '404.html')

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

const server = createServer((req, res) => {
  const host = (req.headers.host || '').split(':')[0].toLowerCase()
  const [pathPart, queryString] = req.url.split('?')
  let path = pathPart

  // Railway staging → production
  if (host.includes('.up.railway.app')) {
    const url = `https://${PRODUCTION_DOMAIN}${req.url}`
    res.writeHead(301, { Location: url })
    res.end()
    return
  }

  let redirectUrl = null

  // www → non-www
  if (host === `www.${PRODUCTION_DOMAIN}`) {
    redirectUrl = `https://${PRODUCTION_DOMAIN}${path}`
  }

  // Force lowercase path
  if (!redirectUrl && path !== path.toLowerCase()) {
    redirectUrl = `https://${host}${path.toLowerCase()}`
  }

  // Remove trailing slash (except root)
  if (!redirectUrl && path.length > 1 && path.endsWith('/')) {
    redirectUrl = `https://${host}${path.replace(/\/+$/, '')}`
  }

  if (redirectUrl) {
    if (queryString) redirectUrl += `?${queryString}`
    res.writeHead(301, { Location: redirectUrl })
    res.end()
    return
  }

  // SPA — serve index.html with canonical tag injected for SEO
  const isSPARoute = path === '/' || !hasFileExtension(path)
  if (isSPARoute) {
    try {
      const indexContent = readFileSync(INDEX, 'utf-8')
      const canonicalUrl = `https://${PRODUCTION_DOMAIN}${path}${queryString ? '?' + queryString : ''}`
      const modified = indexContent.replace(
        '</head>',
        `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`
      )
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(modified)
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
