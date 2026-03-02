"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode, MouseEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getBundle } from "@/lib/report-bundle";

interface SafeLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

export default function SafeLink({
  href,
  children,
  className,
  ...props
}: SafeLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const hrefStr = typeof href === "string" ? href : href.pathname || "";

    // Check if it's an external navigation (leaving assessment area)
    const isExternalNavigation =
      !hrefStr.includes("/assessment") && hrefStr !== "/assessment/intake";

    // Check if user is on an assessment page
    const isOnAssessmentPage =
      pathname?.includes("/questionnaire") ||
      pathname?.includes("/focus-task") ||
      pathname?.includes("/gonogo") ||
      pathname?.includes("/chronos-task") ||
      pathname?.includes("/focus-quest");

    if (isExternalNavigation && isOnAssessmentPage) {
      // Check if both tests are complete
      const bundle = getBundle();
      const questionnaireDone = !!bundle?.questionnaire;
      const gameDone =
        !!bundle?.games.gonogo ||
        !!bundle?.games.chronos ||
        !!bundle?.games.focusQuest;

      if (!questionnaireDone || !gameDone) {
        e.preventDefault();
        // Trigger the quit modal via global function
        const guard = (window as any).__assessmentNavigationGuard__;
        if (guard) {
          guard(hrefStr, e);
        }
        return;
      }
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
