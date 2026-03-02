"use client";

import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import { Download, X } from "lucide-react";

interface QuitModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onQuit: () => void;
  questionnaireDone: boolean;
  gameDone: boolean;
}

export default function QuitModal({
  isOpen,
  onContinue,
  onQuit,
  questionnaireDone,
  gameDone,
}: QuitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">👋</div>
              <button
                onClick={onQuit}
                className="text-muted hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              Hold on!
            </h2>
            <p className="text-sm text-muted mb-6">
              You're almost there! Get your free assessment PDF that you can
              share with your healthcare provider.
            </p>

            <div className="space-y-3 mb-6">
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  questionnaireDone
                    ? "border-[#46a83c]/30 bg-[#f3faf1]"
                    : "border-border/30 bg-gray-50"
                }`}
              >
                <div
                  className={`flex-shrink-0 text-lg ${
                    questionnaireDone ? "text-[#46a83c]" : "text-muted"
                  }`}
                >
                  {questionnaireDone ? "✓" : "○"}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      questionnaireDone
                        ? "text-foreground"
                        : "text-muted"
                    }`}
                  >
                    Questionnaire
                  </p>
                  <p className="text-xs text-muted/70">
                    DSM-5 or ASRS assessment
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  gameDone
                    ? "border-[#46a83c]/30 bg-[#f3faf1]"
                    : "border-border/30 bg-gray-50"
                }`}
              >
                <div
                  className={`flex-shrink-0 text-lg ${
                    gameDone ? "text-[#46a83c]" : "text-muted"
                  }`}
                >
                  {gameDone ? "✓" : "○"}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      gameDone ? "text-foreground" : "text-muted"
                    }`}
                  >
                    Cognitive Game
                  </p>
                  <p className="text-xs text-muted/70">
                    Go/No-Go, Chronos Sort, or Focus Quest
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted/70 mb-6">
              {!questionnaireDone && !gameDone && (
                "Complete the questionnaire and at least one cognitive game to unlock your assessment PDF."
              )}
              {questionnaireDone && !gameDone && (
                "Great! Now complete one cognitive game to generate your complete assessment PDF."
              )}
              {!questionnaireDone && gameDone && (
                "Complete the questionnaire to generate your assessment PDF."
              )}
              {questionnaireDone && gameDone && (
                "You're all set! You can now download your complete assessment PDF."
              )}
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={onQuit}
                className="flex-1"
              >
                Exit Anyway
              </Button>
              <Button
                size="sm"
                onClick={onContinue}
                className="flex-1 gap-2"
              >
                <Download size={16} />
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
