"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="text-amber-600 mt-0.5 shrink-0"
            />
            <div className="text-left">
              <h3 className="font-semibold text-amber-800 mb-1">
                Important Disclaimer
              </h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                This is a screening tool, not a diagnosis. Only a qualified
                healthcare professional can diagnose ADHD. This assessment helps
                you understand your symptoms and provides a report you can bring
                to your doctor.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to understand your mind better?
          </h2>
          <p className="text-muted mb-8">
            Take the screening now and download a detailed report of your
            results.
          </p>
          <Link href="/assessment/intake">
            <Button size="lg" className="text-lg px-10">
              Begin Assessment
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
