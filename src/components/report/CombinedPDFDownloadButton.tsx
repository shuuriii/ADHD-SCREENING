"use client";

import { useState, type RefObject } from "react";
import Button from "@/components/ui/Button";
import { Download, Loader2 } from "lucide-react";
import { getBundle } from "@/lib/report-bundle";

interface CombinedPDFDownloadButtonProps {
  targetRef?: RefObject<HTMLDivElement | null>;
}

export default function CombinedPDFDownloadButton({ targetRef }: CombinedPDFDownloadButtonProps) {
  const [generating, setGenerating] = useState(false);
  const bundle = getBundle();

  if (!bundle || !bundle.questionnaire) {
    return (
      <Button disabled>
        <Download size={16} className="mr-2" />
        Complete the questionnaire first
      </Button>
    );
  }

  const handleDownload = async () => {
    const element = targetRef?.current;
    if (!element || generating) return;

    setGenerating(true);
    try {
      const mod = await import("html2pdf.js");
      const html2pdf = mod.default ?? mod;
      const fileName = `fayth-full-report-${new Date().toISOString().split("T")[0]}.pdf`;

      await html2pdf()
        .set({
          margin: 10,
          filename: fileName,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={generating || !targetRef}>
      {generating ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : (
        <Download size={16} className="mr-2" />
      )}
      {generating ? "Generating PDF..." : "Download Full Report (PDF)"}
    </Button>
  );
}
