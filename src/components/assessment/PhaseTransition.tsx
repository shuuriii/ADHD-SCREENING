"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface PhaseTransitionProps {
  title: string;
  subtitle: string;
  onComplete: () => void;
}

export default function PhaseTransition({
  title,
  subtitle,
  onComplete,
}: PhaseTransitionProps) {
  const onCompleteRef = useRef(onComplete);
  const calledRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onCompleteRef.current();
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    if (!calledRef.current) {
      calledRef.current = true;
      onCompleteRef.current();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dismiss();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-white cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={dismiss}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-label={title}
    >
      <div className="text-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-primary-700 mb-3">
            {title}
          </h2>
          <p className="text-muted text-lg">{subtitle}</p>
          <p className="text-xs text-muted/50 mt-6">
            Tap or press Enter to continue
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
