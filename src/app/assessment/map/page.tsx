"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import type { InstrumentType } from "@/questionnaire/types";
import { FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { getBundle, type ReportBundle } from "@/lib/report-bundle";

/* ── Node definitions ─────────────────────────────────────────────── */

type NodeType = "questionnaire" | "game" | "locked";

interface MapNode {
  id: string;
  emoji: string;
  category: string;
  title: string;
  desc: string;
  time: string;
  type: NodeType;
  instrument?: InstrumentType;
  href: string;
  color: string;
  rotate: string;
  offsetY?: string;
  bundleKey?: string;
}

const NODES: MapNode[] = [
  {
    id: "dsm5",
    emoji: "📋",
    category: "Questionnaire",
    title: "DSM-5 Full Screen",
    desc: "30 questions across inattention & hyperactivity domains",
    time: "~15 min",
    type: "questionnaire",
    instrument: "dsm5",
    href: "/assessment/questionnaire",
    color: "#46a83c",
    rotate: "-2deg",
    offsetY: "0px",
    bundleKey: "dsm5",
  },
  {
    id: "asrs",
    emoji: "⚡",
    category: "Questionnaire",
    title: "ASRS Quick Screen",
    desc: "18 questions — the WHO-validated short screener",
    time: "~10 min",
    type: "questionnaire",
    instrument: "asrs",
    href: "/assessment/questionnaire",
    color: "#d97706",
    rotate: "1.5deg",
    offsetY: "32px",
    bundleKey: "asrs",
  },
  {
    id: "gonogo",
    emoji: "⬛",
    category: "Cognitive Task",
    title: "Go / No-Go",
    desc: "Flash grid — tap yellow, hold on dark. Measures impulse control.",
    time: "~15 min",
    type: "game",
    href: "/assessment/gonogo",
    color: "#2c6e25",
    rotate: "-1deg",
    offsetY: "0px",
    bundleKey: "gonogo",
  },
  {
    id: "chronos",
    emoji: "⏱",
    category: "Cognitive Task",
    title: "Chronos Sort",
    desc: "Hold until it feels charged — no timer. Measures time blindness.",
    time: "~5 min",
    type: "game",
    href: "/assessment/chronos-task",
    color: "#0891b2",
    rotate: "2deg",
    offsetY: "32px",
    bundleKey: "chronos",
  },
  {
    id: "focus-quest",
    emoji: "🌊",
    category: "Cognitive Task",
    title: "Focus Quest",
    desc: "Sea creatures swim past — tap all except the red jellyfish.",
    time: "~20 min",
    type: "game",
    href: "/assessment/focus-quest",
    color: "#0284c7",
    rotate: "-1.5deg",
    offsetY: "0px",
    bundleKey: "focusQuest",
  },
  {
    id: "coming1",
    emoji: "🔒",
    category: "Coming Soon",
    title: "Working Memory",
    desc: "A new task measuring short-term memory and distraction resistance.",
    time: "TBA",
    type: "locked",
    href: "#",
    color: "#9ca3af",
    rotate: "1deg",
    offsetY: "32px",
  },
];

/* ── Completion helpers ───────────────────────────────────────────── */

function isNodeComplete(node: MapNode, bundle: ReportBundle | null): boolean {
  if (!bundle || !node.bundleKey) return false;
  if (node.type === "questionnaire") {
    return bundle.questionnaire?.instrument === node.instrument;
  }
  const key = node.bundleKey as keyof ReportBundle["games"];
  return Boolean(bundle.games[key]);
}

function suggestNextNode(bundle: ReportBundle | null): MapNode | null {
  if (!bundle) return null;
  const ordered = ["dsm5", "asrs", "gonogo", "chronos", "focus-quest"]
    .map(id => NODES.find(n => n.id === id)!);
  // If no questionnaire done, suggest the first questionnaire
  if (!bundle.questionnaire) return ordered[0];
  // Otherwise suggest first incomplete non-locked node
  return ordered.find(n => !isNodeComplete(n, bundle)) ?? null;
}

/* ── NodeCard ─────────────────────────────────────────────────────── */

function NodeCard({
  node,
  index,
  completed,
  suggested,
  onSelect,
}: {
  node: MapNode;
  index: number;
  completed: boolean;
  suggested: boolean;
  onSelect: (node: MapNode) => void;
}) {
  const locked = node.type === "locked";
  const DONE_GREEN = "#46a83c";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
      style={{ marginTop: node.offsetY }}
    >
      <button
        onClick={() => !locked && onSelect(node)}
        disabled={locked}
        className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-150 group relative overflow-hidden
          ${locked
            ? "border-border bg-white/60 opacity-60 cursor-not-allowed"
            : completed
            ? "bg-[#f3faf1] border-[#46a83c] shadow-[2px_2px_0_#c3eab6] cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#46a83c]"
            : suggested
            ? "bg-white border-amber-300 ring-2 ring-amber-300/50 ring-offset-1 hover:border-[var(--node-color)] hover:-translate-y-1 hover:shadow-[3px_3px_0_var(--node-color)] cursor-pointer shadow-sm"
            : "bg-white border-transparent hover:border-[var(--node-color)] hover:-translate-y-1 hover:shadow-[3px_3px_0_var(--node-color)] cursor-pointer shadow-sm"
          }`}
        style={{ "--node-color": node.color } as React.CSSProperties}
      >
        {/* Colour stripe */}
        {!locked && (
          <div
            className="absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl"
            style={{ background: completed ? DONE_GREEN : node.color }}
          />
        )}

        {/* Category pill */}
        <span
          className="inline-block text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full mb-3"
          style={{
            background: locked ? "#f3f4f6" : completed ? "#dcfce7" : `${node.color}18`,
            color: locked ? "#9ca3af" : completed ? DONE_GREEN : node.color,
          }}
        >
          {node.category}
        </span>

        {/* Emoji + title row */}
        <div className="flex items-start gap-3 mb-2">
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: locked ? "#f3f4f6" : completed ? "#dcfce7" : `${node.color}15` }}
          >
            {node.emoji}
          </span>
          <div>
            <p
              className="font-bold text-sm leading-tight"
              style={{ color: locked ? "#9ca3af" : completed ? DONE_GREEN : node.color }}
            >
              {node.title}
            </p>
            {node.time && (
              <p className="text-[11px] text-muted mt-0.5">{node.time}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-muted leading-relaxed pl-14">
          {node.desc}
        </p>

        {/* Done badge */}
        {completed && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-[#46a83c] bg-[#dcfce7] px-2 py-0.5 rounded-full">
            <CheckCircle2 size={10} />
            Done
          </span>
        )}

        {/* Next up badge */}
        {suggested && !completed && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            <ChevronRight size={10} />
            Next up
          </span>
        )}

        {/* Coming soon badge */}
        {locked && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold text-muted bg-gray-100 px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        )}
      </button>
    </motion.div>
  );
}

/* ── MapPage ──────────────────────────────────────────────────────── */

const AVATAR_EMOJI: Record<string, string> = {
  fox: "🦊", panda: "🐼", frog: "🐸", bunny: "🐰",
};

export default function AssessmentMapPage() {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const { name, petPreference } = state.userData;
  const [bundle, setBundle] = useState<ReportBundle | null>(null);

  useEffect(() => {
    setBundle(getBundle());
  }, []);

  const avatar = petPreference ? AVATAR_EMOJI[petPreference] : "🧠";
  const firstName = name && name !== "Anonymous" ? name.split(" ")[0] : null;

  const suggested = suggestNextNode(bundle);
  const completedCount = bundle
    ? NODES.filter(n => isNodeComplete(n, bundle)).length
    : 0;

  const handleSelect = (node: MapNode) => {
    if (node.instrument) {
      dispatch({ type: "SET_INSTRUMENT", payload: node.instrument });
    }
    router.push(node.href);
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Greeting */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-4xl mb-3">{avatar}</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {firstName ? `Hey ${firstName}, where do we start?` : "Where do we start?"}
          </h1>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            Pick a questionnaire, a cognitive task, or jump into both.
            Every path adds a new layer to your report.
          </p>
          {completedCount > 0 && (
            <p className="mt-2 text-xs font-medium text-[#46a83c]">
              {completedCount} of 5 sections complete
            </p>
          )}
        </motion.div>

        {/* Suggested next banner — shown after at least 1 section done */}
        {suggested && completedCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={() => handleSelect(suggested)}
            className="w-full mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 hover:bg-amber-100 transition-colors text-left group"
          >
            <span className="text-2xl">{suggested.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest uppercase text-amber-600 mb-0.5">
                Suggested next step
              </p>
              <p className="text-sm font-semibold text-amber-900 truncate">{suggested.title}</p>
              <p className="text-xs text-amber-700/70">{suggested.time}</p>
            </div>
            <ChevronRight size={18} className="text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        )}

        {/* Parchment map container */}
        <div
          className="relative rounded-3xl p-6 sm:p-8"
          style={{
            background: "#fdf6e3",
            backgroundImage: "radial-gradient(circle, rgba(139,90,43,0.07) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            border: "2.5px solid #c9a96e",
            boxShadow: "inset 0 0 40px rgba(139,90,43,0.06), 4px 4px 0 #c9a96e",
          }}
        >
          {/* Corner doodles */}
          <svg className="absolute top-3 left-3 opacity-20" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M2 14 Q14 2 26 14 Q14 26 2 14Z" stroke="#8B5A2B" strokeWidth="1.5" fill="none"/>
          </svg>
          <svg className="absolute top-3 right-3 opacity-20" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#8B5A2B" strokeWidth="1.5" strokeDasharray="3 2"/>
          </svg>
          <svg className="absolute bottom-3 left-3 opacity-20" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 18 L10 2 L18 18Z" stroke="#8B5A2B" strokeWidth="1.5" fill="none"/>
          </svg>
          <svg className="absolute bottom-3 right-3 opacity-20" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L14 9 L22 9 L16 14 L18 21 L12 16 L6 21 L8 14 L2 9 L10 9Z" stroke="#8B5A2B" strokeWidth="1.5" fill="none"/>
          </svg>

          {/* Section label: Questionnaires */}
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#8B5A2B]/60 mb-3">
            📜 Questionnaires
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {NODES.filter(n => n.type === "questionnaire").map((node, i) => (
              <NodeCard
                key={node.id}
                node={node}
                index={i}
                completed={isNodeComplete(node, bundle)}
                suggested={suggested?.id === node.id}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Dashed divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t-2 border-dashed border-[#c9a96e]/50" />
            <span className="text-[#8B5A2B]/40 text-sm">✦</span>
            <div className="flex-1 border-t-2 border-dashed border-[#c9a96e]/50" />
          </div>

          {/* Section label: Cognitive Tasks */}
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#8B5A2B]/60 mb-3">
            🎮 Cognitive Tasks
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {NODES.filter(n => n.type === "game" || n.type === "locked").map((node, i) => (
              <NodeCard
                key={node.id}
                node={node}
                index={i + 2}
                completed={isNodeComplete(node, bundle)}
                suggested={suggested?.id === node.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Link
            href="/assessment/my-report"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#46a83c] border border-[#c3eab6] bg-[#f3faf1] rounded-xl px-4 py-2 hover:bg-[#e2f5db] transition-colors"
          >
            <FileText size={14} />
            View &amp; Download My Report
          </Link>
        </div>
        <p className="text-center text-xs text-muted/50 mt-3">
          More tasks and tools are on the way — we&apos;re building as we go.
        </p>
      </div>
    </div>
  );
}
