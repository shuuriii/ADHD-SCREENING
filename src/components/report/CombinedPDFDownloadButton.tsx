"use client";

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
  const bundle = getBundle();

  if (!bundle || !bundle.questionnaire) {
    return (
      <Button disabled>
        <Download size={16} className="mr-2" />
        Complete the questionnaire first
      </Button>
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
