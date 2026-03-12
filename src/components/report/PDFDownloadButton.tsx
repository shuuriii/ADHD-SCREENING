"use client";

import { useState, type RefObject } from "react";
import { Download, Loader2 } from "lucide-react";

interface PDFDownloadButtonProps {
  targetRef: RefObject<HTMLDivElement | null>;
}

export default function PDFDownloadButton({ targetRef }: PDFDownloadButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    const element = targetRef.current;
    if (!element || generating) return;

    console.log("[PDF] clicked, element:", element.tagName, element.children.length);
    setGenerating(true);
    try {
      const mod = await import("html2pdf.js");
      console.log("[PDF] module loaded:", mod, "default:", mod.default, "keys:", Object.keys(mod));
      const html2pdf = mod.default ?? mod;
      const fileName = `adhd-screening-report-${new Date().toISOString().split("T")[0]}.pdf`;

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
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="inline-flex items-center justify-center rounded-xl font-medium px-6 py-3 text-base min-h-[44px] bg-[#fbbf24] text-foreground border-2 border-foreground shadow-[3px_3px_0_#1a2410] hover:shadow-[4px_4px_0_#1a2410] hover:-translate-x-px hover:-translate-y-px active:shadow-[1px_1px_0_#1a2410] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    >
      {generating ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : (
        <Download size={16} className="mr-2" />
      )}
      {generating ? "Generating PDF..." : "Download Report (PDF)"}
    </button>
  );
}
