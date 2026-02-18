"use client";

import dynamic from "next/dynamic";
import type { ASRSResult } from "@/questionnaire/types";
import Button from "@/components/ui/Button";
import { Download } from "lucide-react";

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

const ASRSPDFReport = dynamic(() => import("./ASRSPDFReport"), { ssr: false });

interface ASRSPDFDownloadButtonProps {
  results: ASRSResult;
}

export default function ASRSPDFDownloadButton({ results }: ASRSPDFDownloadButtonProps) {
  const fileName = `adhd-screening-asrs-report-${new Date(results.completedAt).toISOString().split("T")[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<ASRSPDFReport results={results} />}
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
