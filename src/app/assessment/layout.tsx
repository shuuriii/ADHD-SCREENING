"use client";

import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { MotionConfig } from "framer-motion";
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
      <MotionConfig reducedMotion="user">
        <AssessmentProvider>
          <SoundProvider>
            <CursorGlow />
            <AnswerBurst />
            <Header />
            <main id="main-content" className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-calm-neutral">
              {children}
            </main>
            <SoundToggle />
          </SoundProvider>
        </AssessmentProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
