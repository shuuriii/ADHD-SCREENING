import { uploadReportPDF, savePdfUrl } from "@/lib/supabase/storage";
import { supabaseConfigured } from "@/lib/supabase/client";
import type { AssessmentResult, ASRSResult } from "@/questionnaire/types";

/**
 * Generate a PDF blob from the assessment result and upload it to
 * Supabase Storage. Runs client-side only.
 *
 * Uses dynamic imports so @react-pdf/renderer is only loaded when needed.
 */
export async function generateAndUploadPDF(
  result: AssessmentResult | ASRSResult,
  sessionId: string
): Promise<string | null> {
  if (!supabaseConfigured) return null;

  try {
    // Dynamic imports — keeps @react-pdf/renderer out of SSR bundles
    const { pdf } = await import("@react-pdf/renderer");
    const { createElement } = await import("react");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let document: any;

    if (result.instrument === "asrs") {
      const { default: ASRSPDFReport } = await import(
        "@/components/report/ASRSPDFReport"
      );
      document = createElement(ASRSPDFReport, {
        results: result as ASRSResult,
      });
    } else {
      const { default: PDFReport } = await import(
        "@/components/report/PDFReport"
      );
      document = createElement(PDFReport, {
        results: result as AssessmentResult,
      });
    }

    const blob = await pdf(document).toBlob();

    const dateStr = new Date(result.completedAt).toISOString().split("T")[0];
    const fileName = `adhd-screening-${result.instrument}-${dateStr}.pdf`;

    const publicUrl = await uploadReportPDF(sessionId, fileName, blob);

    if (publicUrl) {
      await savePdfUrl(sessionId, publicUrl);
    }

    return publicUrl;
  } catch (err) {
    console.error("[PDF Upload] Failed to generate and upload PDF:", err);
    return null;
  }
}
