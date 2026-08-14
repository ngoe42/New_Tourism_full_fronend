import Skeleton from '../Skeleton'

/**
 * Mirrors the real TourDetail/RouteDetail layout (hero → price bar →
 * content cards + sticky sidebar) so the page structure is visible
 * immediately instead of a blank screen behind a spinner, and so nothing
 * jumps when the real data arrives.
 */
export default function DetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-beige animate-pulse" aria-hidden="true">
      {/* Hero */}
      <div className="relative min-h-[60vh] sm:min-h-[75vh] flex flex-col justify-end bg-green-950/90 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-14 w-full">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-4 w-40 bg-white/10" />
            <Skeleton className="h-10 sm:h-14 w-full max-w-xl bg-white/15" />
            <Skeleton className="h-4 w-2/3 bg-white/10" />
            <div className="flex flex-wrap gap-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-32 rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Price action bar */}
      <div className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content cards */}
          <div className="lg:col-span-2 space-y-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            ))}
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
