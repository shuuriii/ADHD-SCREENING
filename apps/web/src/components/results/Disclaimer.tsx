"use client";

import { AlertTriangle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={20}
          className="text-amber-600 mt-0.5 shrink-0"
        />
        <div>
          <h3 className="font-semibold text-amber-800 mb-1">
            Important Disclaimer
          </h3>
          <p className="text-sm text-amber-700 leading-relaxed">
            This is a screening tool, not a diagnosis. Only a qualified
            healthcare professional can diagnose ADHD. Please share these
            results with your doctor for proper evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}
