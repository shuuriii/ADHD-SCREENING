import FloatingParticles from "@/components/landing/FloatingParticles";
import HeroSection from "@/components/landing/HeroSection";
import ValueProposition from "@/components/landing/ValueProposition";
import CTASection from "@/components/landing/CTASection";
import Header from "@/components/ui/Header";
import SoundToggleWrapper from "@/components/landing/SoundToggleWrapper";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-calm-neutral">
      <Header />
      <FloatingParticles />
      <HeroSection />
      <ValueProposition />
      <CTASection />
      <SoundToggleWrapper />
    </main>
  );
}
