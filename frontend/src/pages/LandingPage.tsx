import { CtaBanner } from '@/components/landing/CtaBanner'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { Hero } from '@/components/landing/Hero'
import { ParcelsSection } from '@/components/landing/ParcelsSection'
import { RoutesSection } from '@/components/landing/RoutesSection'

export function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturesSection />
      <RoutesSection />
      <ParcelsSection />
      <CtaBanner />
    </>
  )
}
