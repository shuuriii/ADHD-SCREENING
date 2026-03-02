"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/hooks/useSound";

export default function SoundToggle() {
  const { enabled, toggle } = useSound();

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary-700/10 backdrop-blur-md border border-primary-200/50 flex items-center justify-center text-primary-700 hover:bg-primary-700/20 transition-colors cursor-pointer"
      aria-label={enabled ? "Mute ambient sound" : "Play ambient sound"}
    >
      <AnimatePresence mode="wait">
        {enabled ? (
          <motion.div
            key="on"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Volume2 size={20} />
          </motion.div>
        ) : (
          <motion.div
            key="off"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <VolumeX size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
