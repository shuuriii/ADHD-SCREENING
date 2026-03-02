"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, ShieldCheck, UserCheck } from "lucide-react";
import IllustratedHeading from "@/components/ui/IllustratedHeading";

const features = [
  {
    icon: ClipboardCheck,
    title: "Clinically Validated",
    description:
      "30-item DSM-5 based assessment covering inattention, hyperactivity, and impulsivity — the same criteria our doctors use. We checked.",
  },
  {
    icon: ShieldCheck,
    title: "Completely Private",
    description:
      "Our data stays on our devices. No account needed, nothing sent to servers. We were too paranoid to do it any other way.",
  },
  {
    icon: UserCheck,
    title: "Gamified, Not Boring",
    description:
      "We couldn't sit through another boring test, so we made games instead. They measure real attention and time perception — ours included.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function ValueProposition() {
  return (
    <section className="py-20 px-4 relative z-10 bg-white/60 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-2xl sm:text-3xl text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <IllustratedHeading text="Evidence-based screening built for the ADHD brain" />
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-border/50 ${
                i === 0 ? "-rotate-1" : i === 2 ? "rotate-1" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#fef3c7] flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-[#d97706]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
