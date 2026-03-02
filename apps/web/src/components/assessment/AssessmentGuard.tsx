"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import QuitModal from "@/components/ui/QuitModal";
import { getBundle } from "@/lib/report-bundle";

export default function AssessmentGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [questionnaireDone, setQuestionnaireDone] = useState(false);
  const [gameDone, setGameDone] = useState(false);

  // Check completion status when pathname changes
  useEffect(() => {
    const bundle = getBundle();
    if (bundle) {
      setQuestionnaireDone(!!bundle.questionnaire);
      setGameDone(
        !!(
          bundle.games.gonogo ||
          bundle.games.chronos ||
          bundle.games.focusQuest
        )
      );
    }
  }, [pathname]);

  // Pages that should trigger the quit modal
  const shouldShowQuitModal = useCallback(() => {
    if (!pathname) return false;
    // Don't show on results or my-report pages
    if (pathname.includes("/results") || pathname.includes("/my-report")) {
      return false;
    }
    // Don't show on intake or map pages
    if (pathname.includes("/intake") || pathname.includes("/map")) {
      return false;
    }
    // Show on questionnaire and game pages
    return (
      pathname.includes("/questionnaire") ||
      pathname.includes("/focus-task") ||
      pathname.includes("/gonogo") ||
      pathname.includes("/chronos-task") ||
      pathname.includes("/focus-quest")
    );
  }, [pathname]);

  const isBothComplete = questionnaireDone && gameDone;

  // Handle page unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldShowQuitModal() && !isBothComplete) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldShowQuitModal, isBothComplete]);

  const handleNavigationStart = useCallback(
    (href: string) => {
      // Check if it's going outside assessment area
      const isExternalNavigation =
        !href.includes("/assessment") && href !== "/assessment/intake";

      if (isExternalNavigation && shouldShowQuitModal() && !isBothComplete) {
        setPendingNavigation(href);
        setShowQuitModal(true);
        return false;
      }
      return true;
    },
    [shouldShowQuitModal, isBothComplete]
  );

  const handleContinue = () => {
    setShowQuitModal(false);
    setPendingNavigation(null);
  };

  const handleQuit = () => {
    setShowQuitModal(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    } else {
      router.push("/");
    }
  };

  // Store function globally for SafeLink component to use
  useEffect(() => {
    (window as any).__assessmentNavigationGuard__ = handleNavigationStart;
  }, [handleNavigationStart]);

  return (
    <QuitModal
      isOpen={showQuitModal}
      onContinue={handleContinue}
      onQuit={handleQuit}
      questionnaireDone={questionnaireDone}
      gameDone={gameDone}
    />
  );
}
