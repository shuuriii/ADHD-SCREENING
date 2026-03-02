"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import IllustratedHeading from "@/components/ui/IllustratedHeading";

const games = [
  {
    emoji: "⬛",
    name: "Go / No-Go",
    subtitle: "Visual Attention & Impulse Control",
    description:
      "A 4×4 grid flashes squares. Tap yellow ones as fast as you can — hold still for dark ones. Measures how well your brain filters impulses over time.",
    metrics: [
      "AQvis — sustained attention quality",
      "RCQvis — response inhibition",
      "ICV — reaction time consistency",
    ],
    accent: "#d4a200",
    bgAccent: "#fffbeb",
    borderAccent: "#fde68a",
    href: "/assessment/gonogo",
    duration: "~15 min",
  },
  {
    emoji: "⏱",
    name: "Chronos Sort",
    subtitle: "Time Estimation & Adaptation",
    description:
      "Hold a button until you feel an item is charged — no timer shown. Halfway through, the hold times shift. Measures time blindness and executive adaptability.",
    metrics: [
      "cIM — temporal memory index",
      "cHR — patience / hyperactivity index",
      "cIE — adaptation after rule change",
    ],
    accent: "#0891b2",
    bgAccent: "#f0fdfa",
    borderAccent: "#99f6e4",
    href: "/assessment/chronos-task",
    duration: "~5 min",
  },
  {
    emoji: "🌊",
    name: "Focus Quest",
    subtitle: "Impulse Control & Working Memory",
    description:
      "Sea creatures swim past — tap all except the red jellyfish. Then: tap a gold coin only when it follows a starfish. A gold-standard CPT measuring sustained attention and working memory.",
    metrics: [
      "CPT-X — impulse control composite",
      "CPT-AX — working memory composite",
      "cIA / cHI — inattention & hyperactivity indices",
    ],
    accent: "#0284c7",
    bgAccent: "#f0f9ff",
    borderAccent: "#bae6fd",
    href: "/assessment/focus-quest",
    duration: "~20 min",
  },
];

export default function GamesSection() {
  return (
    <section className="py-20 px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#358a2d] bg-[#f3faf1] border border-[#c3eab6] px-3 py-1 rounded-full mb-4">
            Free Cognitive Tasks
          </span>
          <h2 className="text-2xl sm:text-3xl mb-4">
            <IllustratedHeading text="Go beyond self-report" />
          </h2>
          <p className="text-muted max-w-lg mx-auto leading-relaxed">
            Questionnaires tell us what we think. These tasks measure what
            our brains actually do — helping us identify our ADHD presentation
            type with real data, not just gut feeling.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {games.map((game, i) => (
            <motion.div
              key={game.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Link
                href={game.href}
                className="block group bg-white rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-primary-200 transition-all h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{game.emoji}</div>
                  <span className="text-xs font-medium text-muted bg-gray-50 border border-border/70 px-2.5 py-1 rounded-full shrink-0">
                    {game.duration} · Free
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-0.5" style={{ color: game.accent }}>
                  {game.name}
                </h3>
                <p className="text-xs font-medium text-muted mb-3">{game.subtitle}</p>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {game.description}
                </p>

                <ul className="space-y-1.5 mb-5">
                  {game.metrics.map((m) => (
                    <li key={m} className="text-xs text-muted flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: game.accent }}
                      />
                      {m}
                    </li>
                  ))}
                </ul>

                <div
                  className="text-xs font-semibold group-hover:underline"
                  style={{ color: game.accent }}
                >
                  Play now →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
