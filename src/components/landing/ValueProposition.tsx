"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, ShieldCheck, UserCheck } from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Clinically Validated",
    description:
      "30-item DSM-5 based assessment covering inattention, hyperactivity, and impulsivity — the same criteria used by professionals.",
  },
  {
    icon: ShieldCheck,
    title: "Completely Private",
    description:
      "All your data stays on your device. No account needed, no data sent to servers. Your responses are yours alone.",
  },
  {
    icon: UserCheck,
    title: "Personalized Insights",
    description:
      "Gender-specific follow-up questions recognize that ADHD presents differently in men and women, giving you more relevant results.",
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
    <section className="py-20 px-4 bg-calm-neutral/50">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Evidence-based screening you can trust
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-sm border border-border/50"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-primary-600" />
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
