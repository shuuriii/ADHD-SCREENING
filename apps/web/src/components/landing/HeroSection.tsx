"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Shield, Lock, Sparkles, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ── Intrusive Thoughts box ─────────────────────────────────────── */

const ALL_THOUGHTS = [
  "did i lock the door? 🚪",
  "wait, what was i saying?",
  "hyperfocus activated 🔥",
  "lost my keys AGAIN 🔑",
  "3am thoughts ⚡",
  "oh look a butterfly 🦋",
  "am i annoying?",
  "forgot to reply 😬",
  "brain go brrr 🧠",
  "why can't i just focus",
  "actually that tracks...",
  "time blindness 😵",
  "is this ADHD or just me?",
  "i was just about to do that",
  "rejection sensitivity rn",
  "seven tabs open, zero done",
  "wait no i had a great idea",
  "paralysed by the easy stuff",
];

type Thought = { id: number; text: string; x: number; y: number };

function IntrusiveThoughtsBox() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    counter.current = 3;
    setThoughts([
      { id: 0, text: ALL_THOUGHTS[0],  x: 6,  y: 12 },
      { id: 1, text: ALL_THOUGHTS[3],  x: 32, y: 48 },
      { id: 2, text: ALL_THOUGHTS[6],  x: 10, y: 70 },
    ]);

    const iv = setInterval(() => {
      counter.current += 1;
      const cid = counter.current;
      setThoughts((prev) => {
        const trimmed = prev.length >= 5 ? prev.slice(1) : prev;
        return [
          ...trimmed,
          {
            id: cid,
            text: ALL_THOUGHTS[Math.floor(Math.random() * ALL_THOUGHTS.length)],
            x: 4 + Math.random() * 54,
            y: 8 + Math.random() * 72,
          },
        ];
      });
    }, 1300);

    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative w-[210px] h-[190px] rounded-2xl bg-white/85 border border-border shadow-lg overflow-hidden backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-7 bg-primary-50/80 border-b border-border/60 flex items-center px-3 gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-300" />
        <span className="w-2 h-2 rounded-full bg-yellow-300" />
        <span className="w-2 h-2 rounded-full bg-primary-300" />
        <span className="ml-1.5 text-[9px] text-muted/70 font-medium tracking-tight">
          intrusive-thoughts.exe
        </span>
      </div>
      <div className="absolute inset-0 top-7">
        <AnimatePresence>
          {thoughts.map((t) => (
            <motion.span
              key={t.id}
              className="absolute text-[9px] font-medium bg-white border border-border/80 rounded-full px-2 py-0.5 shadow-sm text-foreground whitespace-nowrap"
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 480, damping: 20 }}
            >
              {t.text}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Unfinished Tasks box ────────────────────────────────────────── */

const ALL_TASKS = [
  "reply to that email 📧",
  "start the report",
  "call them back 📞",
  "15 min task (3hrs later…)",
  "drink some water 💧",
  "finish the thing",
  "respond to Slack",
  "eat something??",
  "the laundry 🧺",
  "that thing from 2 weeks ago",
  "book the appointment",
  "clean the desk",
  "just one more tab…",
  "reply to mum",
  "exercise (tomorrow maybe)",
  "where did the day go",
  "write it down. no seriously.",
  "the thing i forgot",
];

type Task = { id: number; text: string };

function UnfinishedTasksBox() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    counter.current = 3;
    setTasks([
      { id: 0, text: ALL_TASKS[0] },
      { id: 1, text: ALL_TASKS[2] },
      { id: 2, text: ALL_TASKS[5] },
    ]);

    const iv = setInterval(() => {
      counter.current += 1;
      const cid = counter.current;
      setTasks((prev) => {
        const trimmed = prev.length >= 6 ? prev.slice(1) : prev;
        return [
          ...trimmed,
          {
            id: cid,
            text: ALL_TASKS[Math.floor(Math.random() * ALL_TASKS.length)],
          },
        ];
      });
    }, 1600);

    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative w-[210px] h-[190px] rounded-2xl bg-white/85 border border-border shadow-lg overflow-hidden backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-7 bg-yellow-50/90 border-b border-border/60 flex items-center px-3 gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-300" />
        <span className="w-2 h-2 rounded-full bg-yellow-300" />
        <span className="w-2 h-2 rounded-full bg-primary-300" />
        <span className="ml-1.5 text-[9px] text-muted/70 font-medium tracking-tight">
          today&apos;s-tasks.txt
        </span>
      </div>
      <div className="absolute inset-0 top-7 px-3 py-2 flex flex-col gap-1.5 overflow-hidden">
        <AnimatePresence initial={false}>
          {tasks.map((t) => (
            <motion.div
              key={t.id}
              className="flex items-center gap-2 flex-shrink-0"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Unchecked box — never gets checked */}
              <span className="w-3 h-3 rounded border border-border/70 flex-shrink-0" />
              <span className="text-[10px] text-foreground truncate leading-tight">
                {t.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Illustrated ADHD headline ───────────────────────────────────── */

const LETTERS = [
  { char: "A", color: "#46a83c", rotate: "-4deg",  outline: false },
  { char: "D", color: "#2c6e25", rotate:  "1deg",  outline: true  },
  { char: "H", color: "#2c6e25", rotate: "-1.5deg",outline: false },
  { char: "D", color: "#65c058", rotate:  "2.5deg", outline: false },
  { char: "?", color: "#d97706", rotate:  "7deg",  outline: false, small: true },
];

function ADHDHeadline() {
  return (
    <motion.div
      className="relative -mt-1"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
      aria-label="ADHD?"
    >
      {/* ── Doodles above ── */}
      <div className="absolute -top-7 left-0 w-full pointer-events-none" aria-hidden="true">
        <svg width="100%" height="52" viewBox="0 0 500 52" fill="none" preserveAspectRatio="none">
          {/* Lightning bolt */}
          <path d="M28 4 L19 26 L27 26 L16 50" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* 4-point star */}
          <path d="M178 18 L181 26 L189 26 L183 31 L185 39 L178 34 L171 39 L173 31 L167 26 L175 26 Z" fill="#bbf7d0"/>
          {/* Dot cluster */}
          <circle cx="118" cy="10" r="5" fill="#86efac" opacity="0.75"/>
          <circle cx="132" cy="20" r="3" fill="#4ade80" opacity="0.5"/>
          {/* Squiggle arc */}
          <path d="M248 44 Q263 34 278 44 Q293 54 308 44" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round"/>
          {/* Spiral */}
          <path d="M442 8 Q452 0 460 8 Q468 16 460 24 Q452 30 446 24" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" fill="none"/>
          {/* X doodle */}
          <path d="M340 10 L350 22 M350 10 L340 22" stroke="#86efac" strokeWidth="2.2" strokeLinecap="round"/>
          {/* Dot right */}
          <circle cx="388" cy="8" r="4" fill="#fde68a" opacity="0.8"/>
        </svg>
      </div>

      {/* ── Letter row ── */}
      <div className="flex items-end" style={{ gap: "1px" }}>
        {LETTERS.map((l, i) => (
          <span
            key={i}
            className="font-display font-black leading-none"
            style={{
              fontSize: l.small
                ? "clamp(52px, 8.5vw, 88px)"
                : "clamp(72px, 11vw, 128px)",
              color: l.outline ? "transparent" : l.color,
              WebkitTextStroke: l.outline ? `3px ${l.color}` : undefined,
              display: "inline-block",
              transform: `rotate(${l.rotate})`,
              lineHeight: 1,
              transformOrigin: "bottom center",
            }}
          >
            {l.char}
          </span>
        ))}
      </div>

      {/* ── Wavy underline ── */}
      <div className="mt-1 w-full pointer-events-none" aria-hidden="true">
        <svg width="100%" height="10" viewBox="0 0 500 10" fill="none" preserveAspectRatio="none">
          <path
            d="M0 5 Q25 0 50 5 Q75 10 100 5 Q125 0 150 5 Q175 10 200 5 Q225 0 250 5 Q275 10 300 5 Q325 0 350 5 Q375 10 400 5 Q425 0 450 5 Q475 10 500 5"
            stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}

/* ── HeroSection ─────────────────────────────────────────────────── */

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-5xl w-full mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 z-10">

        {/* ── Left: Text column ── */}
        <div className="flex-1 text-center lg:text-left">
          <motion.p
            className="text-base sm:text-lg text-muted font-medium"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Could it be
          </motion.p>

          <ADHDHeadline />

          <motion.p
            className="mt-5 text-lg sm:text-xl text-muted leading-relaxed max-w-md mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            We&apos;ve wondered why focusing feels impossible, why our minds
            race when we need them to be still, why simple tasks feel
            overwhelming. We built this because we&apos;ve been there too.
          </motion.p>

          <motion.div
            className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {[
              { icon: Shield,   label: "DSM-5 Validated",       color: "#46a83c", rotate: "-2deg"   },
              { icon: Lock,     label: "Completely Private",     color: "#2c6e25", rotate:  "1.5deg" },
              { icon: Zap,      label: "Gamified, Personalised", color: "#65c058", rotate: "-1deg"   },
              { icon: Sparkles, label: "Free",                   color: "#d97706", rotate:  "2.5deg" },
            ].map(({ icon: Icon, label, color, rotate }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 font-medium"
                style={{ color, display: "inline-flex", transform: `rotate(${rotate})`, transformOrigin: "bottom center" }}
              >
                <Icon size={13} />
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, type: "spring", stiffness: 200 }}
          >
            <Link href="/assessment/intake">
              <Button size="lg" className="text-lg px-10">
                Start Screening
              </Button>
            </Link>
          </motion.div>

          <motion.p
            className="mt-3 text-xs text-muted/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Results are free.
          </motion.p>
        </div>

        {/* ── Right: Two animated windows ── */}
        <motion.div
          className="flex-shrink-0 flex flex-row gap-3 items-start justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          <IntrusiveThoughtsBox />
          {/* Second box slightly offset for depth */}
          <div className="mt-6">
            <UnfinishedTasksBox />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
