"use client";

import { motion } from "framer-motion";
import { Layers, Sparkles, HeartHandshake } from "lucide-react";
import IllustratedHeading from "@/components/ui/IllustratedHeading";

const WHATSAPP_URL =
  "https://wa.me/918925912683?text=" +
  encodeURIComponent("Hi Dr. Sunshine, I'd like to chat about fayth.life");

const pillars = [
  {
    icon: Layers,
    title: "14 levels, one module at a time",
    description:
      "Not another 10-hour course you'll never finish. Small, manageable steps designed for how our brains actually work.",
  },
  {
    icon: Sparkles,
    title: "An AI companion that checks in daily",
    description:
      "Nudges you through worksheets, helps when life derails, notices when you're stuck.",
  },
  {
    icon: HeartHandshake,
    title: "A real psychologist reviews your progress",
    description:
      "Weekly, asynchronously. You're never doing this alone — but you're also not paying ₹2,000 a session.",
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const cardContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function FounderLetter() {
  return (
    <section className="py-20 px-4 relative z-10">
      <div className="max-w-2xl mx-auto">
        {/* Opening hook */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="font-display text-3xl sm:text-4xl leading-tight mb-6">
            <IllustratedHeading text="I'm a doctor. I have ADHD." />
          </h1>
          <p className="text-lg sm:text-xl text-muted leading-relaxed">
            Therapy and medication weren&apos;t enough. So I&apos;m building what I wish existed.
          </p>
        </motion.div>

        {/* Why */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl sm:text-3xl mb-5">Why</h2>
          <div className="space-y-4 text-muted leading-relaxed">
            <p>When I was diagnosed, I thought I had access to everything.</p>
            <p>
              As a doctor, I had the best referrals, the newest medications, informed psychiatrists. What I didn&apos;t have was the thing that actually rewires an ADHD brain — structured, daily, behavioural work.
            </p>
            <p>
              Weekly CBT in India costs around ₹1 lakh a year. Most of us can&apos;t sustain it. I couldn&apos;t either.
            </p>
            <p>
              Medication took the edge off. It didn&apos;t teach me how to plan my week, finish what I started, or stop hating myself for struggling at things other doctors seemed to do effortlessly.
            </p>
          </div>
        </motion.div>

        {/* What it is */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10"
        >
          <h2 className="font-display text-2xl sm:text-3xl mb-5">What it is</h2>
          <div className="space-y-4 text-muted leading-relaxed">
            <p>fayth.life is the programme I wish I&apos;d had.</p>
            <p>
              Built on the Young–Bramham protocol — the CBT programme used in NHS clinics, considered a gold standard for adult ADHD. Restructured as levels you move through at your own pace.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Three pillars — wider container */}
      <div className="max-w-5xl mx-auto mb-16">
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              variants={sectionVariants}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-border/50 ${
                i === 0 ? "-rotate-1" : i === 2 ? "rotate-1" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#fef3c7] flex items-center justify-center mb-4">
                <pillar.icon size={20} className="text-[#d97706]" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {pillar.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Who it's for */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl sm:text-3xl mb-5">Who it&apos;s for</h2>
          <div className="space-y-4 text-muted leading-relaxed">
            <p>Indian adults who know something is off — and want a way forward.</p>
            <p>
              Whether you&apos;ve been diagnosed, are mid-diagnosis, or just recognise yourself in this — fayth.life is for you if weekly therapy isn&apos;t financially sustainable and you&apos;re tired of doing this alone.
            </p>
          </div>
        </motion.div>

        {/* Closed beta + WhatsApp CTA */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-sm"
        >
          <p className="font-display text-xl sm:text-2xl mb-3">We&apos;re in closed beta.</p>
          <p className="text-muted leading-relaxed mb-6">
            Before we invite you in, I&apos;d love to hear from you — 20 minutes on WhatsApp or a call. I want to know what&apos;s worked, what hasn&apos;t, and whether this would actually help.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 bg-[#25D366] text-white border-2 border-foreground shadow-[3px_3px_0_#1a2410] hover:shadow-[4px_4px_0_#1a2410] hover:-translate-x-px hover:-translate-y-px active:shadow-[1px_1px_0_#1a2410] active:translate-x-0.5 active:translate-y-0.5 px-8 py-4 text-lg min-h-[52px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.463 3.488" />
            </svg>
            Message me on WhatsApp
          </a>
        </motion.div>

        {/* Signature */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-sm text-muted"
        >
          <p className="font-semibold text-foreground">Dr. Sunshine, MBBS</p>
          <p>Founder, fayth.life</p>
        </motion.div>
      </div>
    </section>
  );
}
