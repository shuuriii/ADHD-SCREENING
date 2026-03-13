"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

const CONSENT_KEY = "fayth-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (!consent) setVisible(true);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="max-w-xl mx-auto bg-white border border-border shadow-lg rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 text-sm text-foreground/80 leading-relaxed">
              We use only essential cookies for authentication. No tracking or analytics cookies.{" "}
              <Link href="/cookies" className="text-primary-600 underline">
                Learn more
              </Link>
            </div>
            <button
              onClick={accept}
              className="shrink-0 px-5 py-2 text-sm font-medium bg-foreground text-white rounded-lg hover:bg-foreground/90 transition-colors"
            >
              Got it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
