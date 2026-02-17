"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Shield, Lock, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center z-10">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Could it be{" "}
          <span className="text-primary-600">ADHD</span>?
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-muted leading-relaxed max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          If you&apos;ve ever wondered why focusing feels impossible, why your
          mind races when you need it to be still, or why simple tasks feel
          overwhelming — you&apos;re not alone.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <span className="flex items-center gap-1.5">
            <Shield size={16} className="text-primary-500" />
            DSM-5 Validated
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            <Lock size={16} className="text-primary-500" />
            Completely Private
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-primary-500" />
            Free
          </span>
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.7,
            type: "spring",
            stiffness: 200,
          }}
        >
          <Link href="/assessment/intake">
            <Button size="lg" className="text-lg px-10">
              Start Screening
            </Button>
          </Link>
        </motion.div>

        <motion.p
          className="mt-4 text-xs text-muted/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Takes 5-10 minutes. No account required.
        </motion.p>
      </div>
    </section>
  );
}
