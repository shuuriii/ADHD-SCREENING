import FluidBackground from "@/components/landing/FluidBackground";
import HeroSection from "@/components/landing/HeroSection";
import ValueProposition from "@/components/landing/ValueProposition";
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
      <ValueProposition />
      <CTASection />
      <SoundToggleWrapper />
    </main>
  );
}
