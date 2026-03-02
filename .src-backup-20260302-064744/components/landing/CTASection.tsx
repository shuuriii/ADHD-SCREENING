"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import IllustratedHeading from "@/components/ui/IllustratedHeading";
export default function CTASection() {
  return (
    <section className="py-20 px-4 relative z-10">
      <div className="max-w-2xl mx-auto text-center">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-3xl mb-3">
            <IllustratedHeading text="Ready to understand your mind better?" />
          </h2>
          <p className="text-muted mb-10">
            We built the questionnaire, the cognitive games, and the report — entirely free. Come figure this out with us.
          </p>

          <Link href="/assessment/intake">
            <Button size="lg" className="text-base px-10 py-4">
              Start your assessment here →
            </Button>
          </Link>

          <p className="mt-6 text-xs text-muted/50 leading-relaxed max-w-sm mx-auto">
            This is a screening tool, not a diagnosis. We made it to help us understand our own symptoms — and share it with everyone. Take the report to your doctor.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
