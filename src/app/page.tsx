import { HeroSection } from '@/components/sections/HeroSection';
import { HighlightsSection } from '@/components/sections/HighlightsSection';
import { WorkSection } from '@/components/sections/WorkSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { VenturesSection } from '@/components/sections/VenturesSection';

/**
 * Home. Sections are keyed by id (`hero`, `highlights`, `work`, `about`,
 * `ventures`; `contact` is the Footer in the root layout) so the command
 * palette and single-key shortcuts can scroll to them.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HighlightsSection />
      <WorkSection />
      <AboutSection />
      <VenturesSection />
    </>
  );
}
