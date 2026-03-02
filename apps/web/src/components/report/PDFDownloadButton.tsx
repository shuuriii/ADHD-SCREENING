"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { AssessmentResult } from "@adhd/types";
import Button from "@/components/ui/Button";
import { Download } from "lucide-react";
import { getBundle } from "@/lib/report-bundle";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button disabled>
        <Download size={16} className="mr-2" />
        Preparing PDF...
      </Button>
    ),
  }
);

const PDFReport = dynamic(() => import("./PDFReport"), { ssr: false });

interface PDFDownloadButtonProps {
  results: AssessmentResult;
}

export default function PDFDownloadButton({ results }: PDFDownloadButtonProps) {
  const [gameDone, setGameDone] = useState(false);

  useEffect(() => {
    const bundle = getBundle();
    if (bundle) {
      const hasGame =
        !!bundle.games.gonogo ||
        !!bundle.games.chronos ||
        !!bundle.games.focusQuest;
      setGameDone(hasGame);
    }
  }, []);

  const fileName = `adhd-screening-report-${new Date(results.completedAt).toISOString().split("T")[0]}.pdf`;

  if (!gameDone) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button disabled>
          <Download size={16} className="mr-2" />
          Complete a cognitive game to unlock PDF
        </Button>
        <p className="text-xs text-muted/60 text-center max-w-sm">
          Try the Go/No-Go, Chronos Sort, or Focus Quest to add objective
          behavioral data to your assessment.
        </p>
      </div>
    );
  }

  return (
    <PDFDownloadLink
      document={<PDFReport results={results} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button disabled={loading}>
          <Download size={16} className="mr-2" />
          {loading ? "Generating PDF..." : "Download Report (PDF)"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
