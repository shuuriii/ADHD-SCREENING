"use client";

import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { SoundProvider } from "@/contexts/SoundContext";
import Header from "@/components/ui/Header";
import SoundToggle from "@/components/ui/SoundToggle";
import AnswerBurst from "@/components/assessment/AnswerBurst";
import CursorGlow from "@/components/ui/CursorGlow";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <AssessmentProvider>
        <SoundProvider>
          <CursorGlow />
          <AnswerBurst />
          <Header />
          <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-calm-neutral">
            {children}
          </div>
          <SoundToggle />
        </SoundProvider>
      </AssessmentProvider>
    </ErrorBoundary>
  );
}
