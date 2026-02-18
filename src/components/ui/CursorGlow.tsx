"use client";

import { useEffect, useRef, useState } from "react";

interface Trail {
  x: number;
  y: number;
  id: number;
}

export default function CursorGlow() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const idRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    // Don't show on touch devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      const now = Date.now();
      if (now - lastRef.current < 30) return;
      lastRef.current = now;

      const id = idRef.current++;
      setTrails((prev) => [...prev.slice(-12), { x: e.clientX, y: e.clientY, id }]);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Clean up old trails
  useEffect(() => {
    if (trails.length === 0) return;
    const timer = setTimeout(() => {
      setTrails((prev) => prev.slice(1));
    }, 150);
    return () => clearTimeout(timer);
  }, [trails]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Main glow that follows cursor */}
      <div
        className="absolute w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-100 ease-out"
        style={{
          left: pos.x,
          top: pos.y,
          background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0.03) 40%, transparent 70%)",
        }}
      />
      {/* Trail particles */}
      {trails.map((t, i) => {
        const age = (trails.length - i) / trails.length;
        const size = 4 + age * 4;
        return (
          <div
            key={t.id}
            className="absolute rounded-full"
            style={{
              left: t.x - size / 2,
              top: t.y - size / 2,
              width: size,
              height: size,
              background: `rgba(168,85,247,${0.2 * age})`,
              filter: `blur(${1 + (1 - age) * 2}px)`,
              transition: "opacity 0.3s ease-out",
              opacity: age,
            }}
          />
        );
      })}
    </div>
  );
}
