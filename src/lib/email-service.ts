import type { AssessmentResult, ASRSResult, UserData } from "@/questionnaire/types";

/**
 * Sends an assessment report email to the user
 * This is a placeholder that can be integrated with your email service (SendGrid, Resend, etc.)
 */
export async function sendAssessmentReportEmail(
  email: string,
  userData: UserData,
  reportType: "dsm5" | "asrs",
  reportTitle: string,
  reportContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // This would integrate with your email service
    // For now, we'll log it and show success
    console.log("Email would be sent to:", email);
    console.log("Report Type:", reportType);
    console.log("User:", userData.name);

    // In production, you would call an API endpoint:
    // const response = await fetch('/api/email/send-report', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     email,
    //     userData,
    //     reportType,
    //     reportTitle,
    //     reportContent,
    //   }),
    // });

    // For now, return success
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Generate email template for assessment report
 */
export function generateReportEmailTemplate(
  userData: UserData,
  reportType: "dsm5" | "asrs",
  reportTitle: string
): string {
  return `
Dear ${userData.name || "User"},

Thank you for completing the ADHD Screening Assessment. We have prepared a comprehensive report based on your responses.

Report Type: ${reportType === "asrs" ? "ASRS v1.1 Screener" : "DSM-5 Assessment"}
Date: ${new Date().toLocaleDateString()}

${userData.age ? `Age: ${userData.age}` : ""}
${userData.gender ? `Gender: ${userData.gender}` : ""}

---

${reportTitle}

This report has been generated based on your assessment responses. Please note that this is a screening tool and not a clinical diagnosis. For professional evaluation and diagnosis, please consult with a qualified healthcare professional.

---

Next Steps:
1. Review your assessment results in the attached report
2. Share this report with your healthcare provider if appropriate
3. Consider scheduling a consultation with a mental health professional for further evaluation

Important Notes:
- This is a self-assessment screening tool
- Results should not replace professional medical advice
- If you have concerns about ADHD, please consult with a healthcare provider

Thank you for using our ADHD Screening Tool.

Best regards,
ADHD Screening Team
  `;
}
