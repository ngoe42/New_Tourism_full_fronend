import Hero from '../components/Hero'
import TrustStrip from '../components/TrustStrip'
import FeaturedTours from '../components/FeaturedTours'
import ExperiencesSlider from '../components/ExperiencesSlider'
import StorySection from '../components/StorySection'
import ParallaxBreak from '../components/ParallaxBreak'
import WhyChooseUs from '../components/WhyChooseUs'
import Testimonials from '../components/Testimonials'
import StatsSection from '../components/StatsSection'
import CTASection from '../components/CTASection'

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <FeaturedTours />
      <ExperiencesSlider />
      <StorySection />
      <ParallaxBreak
        image="/images/sections/parallax-serengeti.jpg"
        subtitle="The Serengeti Awaits"
        title={"Where the Wild\nRoams Free"}
        cta="Discover Serengeti Tours"
        ctaHref="/tours"
        height="h-[70vh]"
      />
      <WhyChooseUs />
      <Testimonials />
      <StatsSection />
      <ParallaxBreak
        image="/images/sections/parallax-kilimanjaro.jpg"
        subtitle="Summit Tanzania"
        title={"Kilimanjaro —\nRoof of Africa"}
        cta="Explore Kilimanjaro Treks"
        ctaHref="/tours"
        overlay="from-black/60 to-green-950/75"
        height="h-[55vh]"
      />
      <CTASection />
    </main>
  )
}
