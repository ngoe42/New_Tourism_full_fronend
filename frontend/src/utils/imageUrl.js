/**
 * Resolves an image URL: local `/uploads/...` paths are prefixed with the
 * backend origin so the browser can load them from FastAPI's static mount.
 */
export function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('/uploads/')) {
    const base = (window.APP_CONFIG?.API_URL ?? '').replace('/api/v1', '')
    return `${base}${url}`
  }
  return url
}
