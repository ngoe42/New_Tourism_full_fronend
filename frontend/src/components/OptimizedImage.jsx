import { useState } from 'react'
import { ImageOff } from 'lucide-react'

const CLOUDINARY_WIDTHS = [400, 800, 1200, 1600]

/** Detects Cloudinary-hosted URLs so we can request auto format (WebP/AVIF)
 * and resized variants purely via URL transforms — no backend changes needed.
 * Local/S3 URLs pass through unchanged (no transform support available). */
function isCloudinaryUrl(src) {
  return typeof src === 'string' && src.includes('res.cloudinary.com') && src.includes('/upload/')
}

function optimizedSrc(src) {
  if (!isCloudinaryUrl(src)) return src
  return src.replace('/upload/', '/upload/f_auto,q_auto/')
}

function buildSrcSet(src) {
  if (!isCloudinaryUrl(src)) return undefined
  return CLOUDINARY_WIDTHS
    .map((w) => `${src.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`)} ${w}w`)
    .join(', ')
}

/**
 * Drop-in <img> replacement that reserves layout space (no CLS), shows a
 * skeleton while downloading, fades the image in once loaded, falls back to
 * a neutral placeholder on error, and — for Cloudinary-hosted photos — asks
 * for an auto-format, appropriately-sized variant instead of the full-size
 * original.
 *
 * `priority`: true for the LCP/above-the-fold image on a page (eager +
 * fetchpriority=high); false (default) for everything else (lazy).
 */
export default function OptimizedImage({
  src,
  alt,
  aspectRatio,
  priority = false,
  sizes,
  className = '',
  containerClassName = '',
  onLoad,
}) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const wrapperStyle = aspectRatio ? { aspectRatio } : undefined

  if (!src || errored) {
    return (
      <div
        className={`relative overflow-hidden bg-beige-dark flex items-center justify-center ${containerClassName}`}
        style={wrapperStyle}
      >
        <ImageOff className="text-gray-300" size={28} strokeWidth={1.5} aria-hidden="true" />
      </div>
    )
  }

  const srcSet = buildSrcSet(src)

  return (
    <div className={`relative overflow-hidden ${containerClassName}`} style={wrapperStyle}>
      {!loaded && <div className="absolute inset-0 bg-gray-100 animate-pulse" aria-hidden="true" />}
      <img
        src={optimizedSrc(src)}
        srcSet={srcSet}
        sizes={srcSet ? (sizes || '(max-width: 768px) 100vw, 50vw') : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={(e) => { setLoaded(true); onLoad?.(e) }}
        onError={() => setErrored(true)}
        className={`w-full h-full object-cover transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </div>
  )
}
