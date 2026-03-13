"use client";

import { AlertTriangle } from "lucide-react";

interface DisclaimerProps {
  compact?: boolean;
}

export default function Disclaimer({ compact = false }: DisclaimerProps) {
  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
        This is a screening tool, not a diagnosis. Only a qualified healthcare
        professional can diagnose ADHD. Please share your results with your doctor.
      </div>
    );
  }

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
          <p className="text-sm text-amber-700 leading-relaxed mb-2">
            This is a screening tool, not a diagnosis. Only a qualified
            healthcare professional (psychiatrist, psychologist, or physician) can
            diagnose ADHD. The cognitive tasks are research-informed but are not
            FDA-approved diagnostic devices.
          </p>
          <p className="text-sm text-amber-700 leading-relaxed mb-2">
            Please share these results with your doctor for proper evaluation.
            Do not make medication or treatment decisions based solely on these results.
          </p>
          <p className="text-xs text-amber-600 leading-relaxed">
            <strong>In crisis?</strong> Contact your local emergency services, call{" "}
            <strong>988</strong> (Suicide &amp; Crisis Lifeline, US), or go to your
            nearest emergency room.
          </p>
        </div>
      </div>
    </div>
  );
}
