"use client";

import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { SoundProvider } from "@/contexts/SoundContext";
import Header from "@/components/ui/Header";
import SoundToggle from "@/components/ui/SoundToggle";

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AssessmentProvider>
      <SoundProvider>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-calm-neutral">
          {children}
        </div>
        <SoundToggle />
      </SoundProvider>
    </AssessmentProvider>
  );
}
