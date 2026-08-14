/** Base pulsing placeholder block. Compose into layout-specific skeletons so
 * loading states reserve the same space the real content will occupy. */
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200/80 rounded ${className}`} aria-hidden="true" />
}
