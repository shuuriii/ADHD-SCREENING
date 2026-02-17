"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  opacity: number;
}

const COLORS = [
  "bg-primary-300",
  "bg-primary-400",
  "bg-primary-500",
  "bg-calm-blue",
  "bg-calm-teal",
];

export default function FloatingParticles({ count = 25 }: { count?: number }) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 4 + Math.random() * 16,
      duration: 10 + Math.random() * 12,
      delay: Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.15 + Math.random() * 0.25,
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.color}`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            opacity: p.opacity,
            filter: `blur(${p.size > 12 ? 2 : 1}px)`,
          }}
          initial={{ y: "110vh", x: 0 }}
          animate={{
            y: "-10vh",
            x: [0, 30, -20, 15, 0],
          }}
          transition={{
            y: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            },
            x: {
              duration: p.duration * 0.8,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            },
          }}
        />
      ))}
    </div>
  );
}
