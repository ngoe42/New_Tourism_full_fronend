import { lazy, Suspense } from 'react'
import { useInView } from 'react-intersection-observer'
import Hero from '../components/Hero'
import WondersSection from '../components/WondersSection'
import TrustStrip from '../components/TrustStrip'
import FeaturedTours from '../components/FeaturedTours'
import StorySection from '../components/StorySection'
import WhyChooseUs from '../components/WhyChooseUs'
import CTASection from '../components/CTASection'

// Testimonials pulls in Swiper and its own API call — neither is needed
// until the user scrolls near the bottom of the homepage, so it's code-split
// out of the initial bundle and only mounted once it approaches the viewport.
const Testimonials = lazy(() => import('../components/Testimonials'))

function TestimonialsPlaceholder() {
  return <div className="py-14 sm:py-24 lg:py-32 bg-green-950 min-h-[420px]" aria-hidden="true" />
}

export default function Home() {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '400px 0px' })

  return (
    <main>
      <Hero />
      <WondersSection />
      <TrustStrip />
      <FeaturedTours />
      <StorySection />
      <WhyChooseUs />
      <div ref={ref}>
        {inView ? (
          <Suspense fallback={<TestimonialsPlaceholder />}>
            <Testimonials />
          </Suspense>
        ) : (
          <TestimonialsPlaceholder />
        )}
      </div>
      <CTASection />
    </main>
  )
}
