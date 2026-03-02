"use client";

import { useEffect, useState, useCallback } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  duration: number;
  shape: "circle" | "star" | "ring";
}

const COLORS = [
  "#a855f7", // purple
  "#c084fc", // light purple
  "#60a5fa", // blue
  "#5eead4", // teal
  "#fbbf24", // amber
  "#f472b6", // pink
];

let globalId = 0;

export default function AnswerBurst() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const burst = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // Only burst on Likert scale buttons and context option buttons
    if (!target.closest("[role='radio'], [role='radiogroup'] button, .context-option")) return;

    const rect = (target.closest("[role='radio'], .context-option") as HTMLElement)?.getBoundingClientRect();
    if (!rect) return;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const count = 10 + Math.floor(Math.random() * 6);
    const newParticles: Particle[] = Array.from({ length: count }, () => {
      const id = globalId++;
      return {
        id,
        x: cx,
        y: cy,
        angle: Math.random() * 360,
        distance: 30 + Math.random() * 60,
        size: 3 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        duration: 0.4 + Math.random() * 0.3,
        shape: (["circle", "star", "ring"] as const)[Math.floor(Math.random() * 3)],
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 800);
  }, []);

  useEffect(() => {
    window.addEventListener("click", burst);
    return () => window.removeEventListener("click", burst);
  }, [burst]);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;

        return (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              animation: `burstParticle ${p.duration}s ease-out forwards`,
              // @ts-expect-error CSS custom properties
              "--tx": `${tx}px`,
              "--ty": `${ty}px`,
            }}
          >
            {p.shape === "circle" && (
              <div
                className="w-full h-full rounded-full"
                style={{ background: p.color }}
              />
            )}
            {p.shape === "star" && (
              <svg viewBox="0 0 10 10" className="w-full h-full">
                <polygon
                  points="5,0 6.2,3.8 10,3.8 7,6.2 8.2,10 5,7.5 1.8,10 3,6.2 0,3.8 3.8,3.8"
                  fill={p.color}
                />
              </svg>
            )}
            {p.shape === "ring" && (
              <div
                className="w-full h-full rounded-full border-2"
                style={{ borderColor: p.color }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
