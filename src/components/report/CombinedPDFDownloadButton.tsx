"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getBundle } from "@/lib/report-bundle";
import Button from "@/components/ui/Button";
import { Download } from "lucide-react";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button disabled>
        <Download size={16} className="mr-2" />
        Preparing report...
      </Button>
    ),
  }
);

const CombinedPDFReport = dynamic(() => import("./CombinedPDFReport"), { ssr: false });

export default function CombinedPDFDownloadButton() {
  const [bundle, setBundle] = useState<ReturnType<typeof getBundle>>(null);

  useEffect(() => {
    setBundle(getBundle());
  }, []);

  if (!bundle) {
    return (
      <Button disabled>
        <Download size={16} className="mr-2" />
        Loading...
      </Button>
    );
  }

  if (!bundle.questionnaire) {
    return (
      <Button disabled>
        <Download size={16} className="mr-2" />
        Complete the questionnaire first
      </Button>
    );
  }

  const hasGame =
    !!bundle.games.gonogo ||
    !!bundle.games.chronos ||
    !!bundle.games.focusQuest;

  if (!hasGame) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button disabled>
          <Download size={16} className="mr-2" />
          Complete a cognitive game to unlock PDF
        </Button>
        <p className="text-xs text-muted/60 text-center">
          Add objective behavioral data with Go/No-Go, Chronos Sort, or Focus Quest.
        </p>
      </div>
    );
  }

  const fileName = `fayth-full-report-${new Date().toISOString().split("T")[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<CombinedPDFReport bundle={bundle} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button disabled={loading}>
          <Download size={16} className="mr-2" />
          {loading ? "Generating PDF..." : "Download Full Report (PDF)"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
