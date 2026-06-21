import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { extname, join, resolve } from 'path'

const PORT = process.env.PORT || 3000
const DIST = resolve('dist')
const PRODUCTION_DOMAIN = 'nelsontoursandsafaris.com'
const INDEX = join(DIST, 'index.html')

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
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function serveFile(res, filePath) {
  try {
    const content = readFileSync(filePath)
    const ext = extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
    res.end(content)
  } catch {
    return false
  }
  return true
}

const server = createServer((req, res) => {
  const host = req.headers.host || ''

  // 301 redirect if accessing via Railway staging domain
  if (host.includes('railway.app')) {
    const url = `https://${PRODUCTION_DOMAIN}${req.url}`
    res.writeHead(301, { Location: url })
    res.end()
    return
  }

  let path = req.url.split('?')[0]

  // SPA: try exact file, then index.html fallback
  const filePath = join(DIST, path === '/' ? 'index.html' : path)
  if (!serveFile(res, filePath)) {
    serveFile(res, INDEX)
  }
})

server.listen(PORT, () => {
  console.log(`[server] listening on 0.0.0.0:${PORT}`)
  if (process.env.VITE_API_URL) {
    console.log(`[server] API → ${process.env.VITE_API_URL}`)
  }
})
