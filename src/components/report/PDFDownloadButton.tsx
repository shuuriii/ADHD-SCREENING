"use client";

import dynamic from "next/dynamic";
import type { AssessmentResult } from "@/questionnaire/types";
import Button from "@/components/ui/Button";
import { Download } from "lucide-react";
import PDFReport from "./PDFReport";

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

interface PDFDownloadButtonProps {
  results: AssessmentResult;
}

export default function PDFDownloadButton({ results }: PDFDownloadButtonProps) {
  const fileName = `adhd-screening-report-${new Date(results.completedAt).toISOString().split("T")[0]}.pdf`;

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
