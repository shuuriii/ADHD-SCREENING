import FluidBackground from "@/components/landing/FluidBackground";
import FounderLetter from "@/components/landing/FounderLetter";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import SoundToggleWrapper from "@/components/landing/SoundToggleWrapper";
import CursorGlow from "@/components/ui/CursorGlow";

export default function LandingPage() {
  return (
    <main className="min-h-screen relative">
      <FluidBackground />
      <CursorGlow />
      <Header />
      <FounderLetter />
      <Footer />
      <SoundToggleWrapper />
    </main>
  );
}
