import { createClient, supabaseConfigured } from "./client";

const BUCKET = "reports";

/**
 * Upload a PDF blob to Supabase Storage and return the public URL.
 * Files are stored at: reports/{sessionId}/{filename}
 */
export async function uploadReportPDF(
  sessionId: string,
  fileName: string,
  pdfBlob: Blob
): Promise<string | null> {
  if (!supabaseConfigured) return null;
  const supabase = createClient();

  const path = `${sessionId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, pdfBlob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("[Supabase Storage] Failed to upload PDF:", error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Save the PDF URL back to the questionnaire_results row.
 */
export async function savePdfUrl(
  sessionId: string,
  pdfUrl: string
): Promise<void> {
  if (!supabaseConfigured) return;
  const supabase = createClient();

  const { error } = await supabase
    .from("questionnaire_results")
    .update({ pdf_url: pdfUrl })
    .eq("session_id", sessionId);

  if (error) {
    console.error("[Supabase] Failed to save PDF URL:", error.message);
  }
}
