"use client";

import dynamic from "next/dynamic";
import type { LikertValue, UserData } from "@/questionnaire/types";
import Button from "@/components/ui/Button";
import { Download } from "lucide-react";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const PartialPDFReport = dynamic(() => import("./PartialPDFReport"), {
  ssr: false,
});

interface PartialPDFDownloadButtonProps {
  completedPhases: string;
  responses: Record<string, LikertValue>;
  contextResponses: Record<string, string>;
  userData: UserData;
  instrument: string;
}

export default function PartialPDFDownloadButton({
  completedPhases,
  responses,
  contextResponses,
  userData,
  instrument,
}: PartialPDFDownloadButtonProps) {
  const fileName = `adhd-screening-partial-report-${new Date().toISOString().split("T")[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <PartialPDFReport
          completedPhases={completedPhases}
          responses={responses}
          contextResponses={contextResponses}
          userData={userData}
          instrument={instrument}
        />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <Button disabled={loading}>
          <Download size={16} className="mr-2" />
          {loading ? "Generating PDF..." : "Download Partial Report (PDF)"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
