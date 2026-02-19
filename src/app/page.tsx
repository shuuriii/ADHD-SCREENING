import FluidBackground from "@/components/landing/FluidBackground";
import HeroSection from "@/components/landing/HeroSection";
import JourneySection from "@/components/landing/JourneySection";
import ValueProposition from "@/components/landing/ValueProposition";
import GamesSection from "@/components/landing/GamesSection";
import CTASection from "@/components/landing/CTASection";
import Header from "@/components/ui/Header";
import SoundToggleWrapper from "@/components/landing/SoundToggleWrapper";
import CursorGlow from "@/components/ui/CursorGlow";

export default function LandingPage() {
  return (
    <main className="min-h-screen relative">
      <FluidBackground />
      <CursorGlow />
      <Header />
      <HeroSection />
      <JourneySection />
      <ValueProposition />
      <GamesSection />
      <CTASection />
      <SoundToggleWrapper />
    </main>
  );
}
