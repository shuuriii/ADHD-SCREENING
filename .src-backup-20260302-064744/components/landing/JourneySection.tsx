"use client";

import { motion } from "framer-motion";
import IllustratedHeading from "@/components/ui/IllustratedHeading";

const STEPS = [
  {
    emoji: "🔑",
    title: "Sign In",
    desc: "Quick and private — no personal data required",
  },
  {
    emoji: "📋",
    title: "Take the Questionnaire",
    desc: "DSM-5 or ASRS — clinically validated, ~10 min",
  },
  {
    emoji: "🎮",
    title: "Play the Games",
    desc: "Cognitive tasks that measure real attention patterns",
  },
  {
    emoji: "📄",
    title: "Get Your Free Report",
    desc: "Detailed PDF you can bring straight to your doctor",
  },
  {
    emoji: "🧑‍⚕️",
    title: "Consult ADHD Experts",
    desc: "Connect with specialists who truly understand ADHD",
  },
  {
    emoji: "🤖",
    title: "CBT + AI",
    desc: "Evidence-based therapy, adapted with AI in the loop",
  },
  {
    emoji: "✨",
    title: "Personalised Insights",
    desc: "Ongoing tracking and strategies tailored to you",
  },
];

export default function JourneySection() {
  return (
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-2xl mx-auto">

        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl">
            <IllustratedHeading text="Our journey starts here" />
          </h2>
          <p className="mt-2 text-sm text-muted">
            From first question to personalised support — here&apos;s the path we walked, and we&apos;re walking it with you.
          </p>
        </motion.div>

        {/* ── Vertical roadmap ── */}
        <div className="relative">
            {/* Vertical line through step nodes */}
            <div className="absolute left-6 top-3 bottom-3 border-l-2 border-dashed border-[#96d888]" />

            <div className="flex flex-col gap-0">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  className="relative flex items-start gap-5 pb-8 last:pb-0"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                >
                  {/* Step node — sits on the vertical line */}
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center text-xl">
                    {step.emoji}
                    {/* Step number badge */}
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#fbbf24] text-[#1a2410] text-[10px] font-bold flex items-center justify-center shadow">
                      {i + 1}
                    </span>
                  </div>

                  {/* Step text */}
                  <div className="pt-1.5">
                    <p className="text-[15px] font-semibold text-foreground leading-tight">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-muted leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      </div>
    </section>
  );
}
