import Hero from '../components/Hero'
import TrustStrip from '../components/TrustStrip'
import FeaturedTours from '../components/FeaturedTours'
import StorySection from '../components/StorySection'
import WhyChooseUs from '../components/WhyChooseUs'
import Testimonials from '../components/Testimonials'
import CTASection from '../components/CTASection'

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <FeaturedTours />
      <StorySection />
      <WhyChooseUs />
      <Testimonials />
      <CTASection />
    </main>
  )
}
