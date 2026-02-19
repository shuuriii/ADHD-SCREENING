"use client";

import { useEffect, useRef } from "react";

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Pastel yellow-green palette
    const blobs = [
      { x: 0.3, y: 0.3, r: 0.35, color: [134, 239, 172, 0.18], speedX: 0.15, speedY: 0.1,  phaseX: 0,   phaseY: 0.5 },
      { x: 0.7, y: 0.6, r: 0.3,  color: [253, 224, 71,  0.14], speedX: 0.12, speedY: 0.18, phaseX: 1,   phaseY: 0   },
      { x: 0.5, y: 0.8, r: 0.4,  color: [187, 247, 208, 0.12], speedX: 0.1,  speedY: 0.14, phaseX: 2,   phaseY: 1.5 },
      { x: 0.2, y: 0.5, r: 0.25, color: [254, 240, 138, 0.13], speedX: 0.18, speedY: 0.12, phaseX: 3,   phaseY: 2   },
      { x: 0.8, y: 0.2, r: 0.3,  color: [74,  222, 128, 0.11], speedX: 0.08, speedY: 0.16, phaseX: 1.5, phaseY: 3   },
      { x: 0.85, y: 0.7, r: 0.22, color: [253, 230, 138, 0.12], speedX: 0.11, speedY: 0.09, phaseX: 4,  phaseY: 2.5 },
    ];

    // Caustic light rays
    const rays = Array.from({ length: 8 }, (_, i) => ({
      x: (i / 8) + Math.random() * 0.1,
      speed: 0.3 + Math.random() * 0.4,
      width: 0.02 + Math.random() * 0.04,
      opacity: 0.015 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2,
    }));

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;

      // Base gradient — warm cream to soft mint
      const bg = ctx!.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#fffef8");
      bg.addColorStop(0.5, "#f8fdf4");
      bg.addColorStop(1, "#f3faf1");
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, w, h);

      // Flowing blobs — underwater feel
      for (const blob of blobs) {
        const cx = (blob.x + Math.sin(time * blob.speedX + blob.phaseX) * 0.15) * w;
        const cy = (blob.y + Math.cos(time * blob.speedY + blob.phaseY) * 0.12) * h;
        const r = blob.r * Math.max(w, h);

        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        const [cr, cg, cb, ca] = blob.color;
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${ca})`);
        grad.addColorStop(0.6, `rgba(${cr},${cg},${cb},${ca * 0.4})`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, w, h);
      }

      // Caustic light rays — underwater sun shafts
      ctx!.save();
      for (const ray of rays) {
        const rx = (ray.x + Math.sin(time * ray.speed + ray.phase) * 0.08) * w;
        const rw = ray.width * w;
        const grad = ctx!.createLinearGradient(rx - rw, 0, rx + rw, 0);
        const op = ray.opacity * (0.7 + 0.3 * Math.sin(time * 0.5 + ray.phase));
        grad.addColorStop(0, `rgba(74,222,128,0)`);
        grad.addColorStop(0.3, `rgba(74,222,128,${op})`);
        grad.addColorStop(0.5, `rgba(255,255,230,${op * 2})`);
        grad.addColorStop(0.7, `rgba(74,222,128,${op})`);
        grad.addColorStop(1, `rgba(74,222,128,0)`);

        ctx!.fillStyle = grad;
        ctx!.fillRect(rx - rw * 3, 0, rw * 6, h);
      }
      ctx!.restore();

      // Subtle ripple distortion overlay
      const rippleCount = 3;
      for (let i = 0; i < rippleCount; i++) {
        const rx = (0.3 + i * 0.2 + Math.sin(time * 0.2 + i) * 0.1) * w;
        const ry = (0.4 + Math.cos(time * 0.15 + i * 2) * 0.2) * h;
        const rr = (80 + Math.sin(time * 0.3 + i) * 30);

        ctx!.beginPath();
        ctx!.arc(rx, ry, rr, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(74,222,128,${0.03 + 0.015 * Math.sin(time + i)})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(rx, ry, rr * 1.5, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(253,224,71,${0.02 + 0.01 * Math.sin(time * 0.7 + i)})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      time += 0.008;
      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
