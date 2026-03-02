"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#a855f7", "#c084fc", "#60a5fa", "#5eead4", "#fbbf24"];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  angle: number;
  distance: number;
}

export default function MilestoneAnimation() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      size: 4 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: (i / 24) * 360 + Math.random() * 15,
      distance: 60 + Math.random() * 100,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;

        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 0.3 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
