/**
 * Suspense fallback for lazy-loaded routes. A slim indeterminate progress
 * bar (not a spinner, not a blank page) — the surrounding layout (Navbar,
 * Footer) stays mounted and interactive while the route's code chunk
 * downloads, which is typically well under what it takes to notice.
 */
export default function RouteLoadingBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-[100] overflow-hidden bg-transparent" aria-hidden="true">
      <div className="h-full w-1/3 bg-gold animate-route-bar" />
    </div>
  )
}
