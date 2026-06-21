/**
 * Resolves an image URL: local `/uploads/...` paths are prefixed with the
 * backend origin so the browser can load them from FastAPI's static mount.
 */
export function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('/uploads/')) {
    let base = (window.APP_CONFIG?.API_URL ?? '').replace('/api/v1', '')
    if (window.location.protocol === 'https:' && base.startsWith('http://')) {
      base = base.replace('http://', 'https://')
    }
    return `${base}${url}`
  }
  return url
}
