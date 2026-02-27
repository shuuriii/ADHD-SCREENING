import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { LikertValue, UserData, LIKERT_LABELS } from "@/questionnaire/types";
import { dsm5Questions } from "@/questionnaire/dsm5-questions";
import { asrsQuestions } from "@/questionnaire/asrs-questions";
import { contextQuestions } from "@/questionnaire/context-questions";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 4,
  },
  questionItem: {
    marginBottom: 12,
    paddingLeft: 10,
  },
  questionText: {
    fontSize: 11,
    marginBottom: 4,
    color: "#1f2937",
  },
  answer: {
    fontSize: 10,
    color: "#059669",
    fontWeight: "bold",
  },
  userInfo: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 3,
  },
  footer: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 20,
    textAlign: "center" as const,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  disclaimer: {
    fontSize: 9,
    color: "#ef4444",
    marginTop: 10,
    fontStyle: "italic",
    padding: 10,
    backgroundColor: "#fef2f2",
    borderLeftWidth: 3,
    borderLeftColor: "#ef4444",
  },
});

interface PartialPDFReportProps {
  completedPhases: string;
  responses: Record<string, LikertValue>;
  contextResponses: Record<string, string>;
  userData: UserData;
  instrument: string;
}

const LIKERT_LABELS_MAP: Record<LikertValue, string> = {
  0: "Never",
  1: "Rarely",
  2: "Sometimes",
  3: "Often",
  4: "Very Often",
};

export default function PartialPDFReport({
  completedPhases,
  responses,
  contextResponses,
  userData,
  instrument,
}: PartialPDFReportProps) {
  const questions =
    instrument === "asrs" ? asrsQuestions : dsm5Questions;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.title}>ADHD Screening - Partial Report</Text>
          <Text style={styles.subtitle}>
            {instrument === "asrs" ? "ASRS v1.1 Screener" : "DSM-5 Assessment"}
          </Text>
        </View>

        {/* User Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Information</Text>
          {userData.name && userData.name !== "Anonymous" && (
            <Text style={styles.userInfo}>Name: {userData.name}</Text>
          )}
          {userData.age && (
            <Text style={styles.userInfo}>Age: {userData.age}</Text>
          )}
          {userData.gender && (
            <Text style={styles.userInfo}>Gender: {userData.gender}</Text>
          )}
          <Text style={styles.userInfo}>
            Report Date: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Main Questions */}
        {Object.keys(responses).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Main Questionnaire Responses ({Object.keys(responses).length} answered)
            </Text>
            {questions.map((question) => {
              const answer = responses[question.id];
              if (answer === undefined) return null;

              const answerLabel = LIKERT_LABELS_MAP[answer];

              return (
                <View key={question.id} style={styles.questionItem}>
                  <Text style={styles.questionText}>
                    Q{question.questionNumber}: {question.text}
                  </Text>
                  <Text style={styles.answer}>Answer: {answerLabel}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Context Questions */}
        {Object.keys(contextResponses).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Context Questions ({Object.keys(contextResponses).length} answered)
            </Text>
            {contextQuestions.map((question) => {
              const answer = contextResponses[question.id];
              if (answer === undefined) return null;

              return (
                <View key={question.id} style={styles.questionItem}>
                  <Text style={styles.questionText}>
                    Q{question.questionNumber}: {question.text}
                  </Text>
                  <Text style={styles.answer}>
                    Answer: {question.options.find((o) => o.value === answer)?.label || answer}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text>
            ⚠️ IMPORTANT NOTICE: This is a partial assessment report. It contains only the
            sections you have completed. This is NOT a clinical diagnosis. Please consult with a
            healthcare professional for proper evaluation and diagnosis.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This report was auto-generated from a screening questionnaire.</Text>
          <Text>For professional evaluation, please consult a licensed clinician.</Text>
        </View>
      </Page>
    </Document>
  );
}
