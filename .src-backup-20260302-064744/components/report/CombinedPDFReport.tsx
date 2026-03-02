import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { severityColors, presentationBorderColors } from "./pdf-styles";
import type { ReportBundle } from "@/lib/report-bundle";
import type { GoNoGoScores } from "@/lib/gonogo-scoring";
import type { ChronosScores } from "@/lib/chronos-scoring";
import type { FocusQuestScores } from "@/lib/focus-quest-scoring";
import type { DomainScore, DSM5Criteria, Interpretation } from "@/questionnaire/types";

// ─── Styles ────────────────────────────────────────────────────────────────

const PRIMARY = "#46a83c";

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11, color: "#1e2010" },
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: PRIMARY, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1a2410" },
  subtitle: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  userInfo: { fontSize: 10, color: "#6b7280", marginTop: 6 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 8, color: "#374151", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 4 },
  gameSection: { marginTop: 16 },
  gameSectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 6, color: PRIMARY },
  domainCard: { padding: 12, backgroundColor: "#f9fafb", borderRadius: 4, marginBottom: 8 },
  domainRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  domainLabel: { fontSize: 12, fontWeight: "bold" },
  severityBadge: { fontSize: 9, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, color: "#ffffff" },
  scoreBar: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, marginTop: 6, marginBottom: 4 },
  scoreFill: { height: 8, borderRadius: 4 },
  scoreText: { fontSize: 9, color: "#6b7280" },
  criteriaRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  criteriaIcon: { width: 14, height: 14, borderRadius: 7, marginRight: 8, justifyContent: "center", alignItems: "center" },
  criteriaText: { fontSize: 10, flex: 1 },
  insightItem: { fontSize: 10, marginBottom: 4, paddingLeft: 10, color: "#2c6e25" },
  recommendationItem: { fontSize: 10, marginBottom: 6, paddingLeft: 8, lineHeight: 1.5 },
  recommendationNumber: { fontWeight: "bold", color: PRIMARY },
  presentationBox: { padding: 12, borderLeftWidth: 4, backgroundColor: "#f9fafb", borderRadius: 4, marginBottom: 8 },
  presentationLabel: { fontSize: 16, fontWeight: "bold", color: "#1a2410" },
  presentationDesc: { fontSize: 10, color: "#6b7280", marginTop: 4 },
  metricRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  metricLabel: { fontSize: 10, color: "#374151", flex: 1 },
  metricValue: { fontSize: 10, fontWeight: "bold", color: "#1a2410", width: 50, textAlign: "right" },
  metricBar: { height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, marginTop: 2, width: 80 },
  metricFill: { height: 6, borderRadius: 3, backgroundColor: PRIMARY },
  interpretNote: { fontSize: 9, color: "#6b7280", marginTop: 8, paddingLeft: 4, lineHeight: 1.5 },
  disclaimer: { marginTop: 24, padding: 12, backgroundColor: "#FEF3C7", borderRadius: 4, fontSize: 9, color: "#92400e", lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#9ca3af", textAlign: "center" },
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0) {
  return n.toFixed(decimals);
}

function scoreColor(score: number) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

// ─── Sub-components ────────────────────────────────────────────────────────

function MetricRow({ label, value, unit = "", bar }: { label: string; value: number; unit?: string; bar?: boolean }) {
  const display = `${fmt(value, value % 1 === 0 ? 0 : 1)}${unit}`;
  return (
    <View style={s.metricRow}>
      <Text style={s.metricLabel}>{label}</Text>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.metricValue}>{display}</Text>
        {bar && (
          <View style={s.metricBar}>
            <View style={[s.metricFill, { width: `${Math.min(100, value)}%`, backgroundColor: scoreColor(value) }]} />
          </View>
        )}
      </View>
    </View>
  );
}

function InterpretNote({ text }: { text: string }) {
  return <Text style={s.interpretNote}>{text}</Text>;
}

// ─── Questionnaire section ─────────────────────────────────────────────────

function QuestionnaireSection({ q }: { q: NonNullable<ReportBundle["questionnaire"]> }) {
  // Both AssessmentResult and ASRSResult share these fields with identical types.
  // Use explicit picks to avoid the union narrowing issue on `instrument`/`presentationType`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = q.result as any;
  const domainA = r.domainA as DomainScore;
  const domainB = r.domainB as DomainScore;
  const criteria = r.dsm5Criteria as DSM5Criteria;
  const interpretation = r.interpretation as Interpretation;
  const presentationType = r.presentationType as { type: string; label: string; description: string };
  const isASRS = q.instrument === "asrs";

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>
        {isASRS ? "ASRS v1.1 Screener Results" : "DSM-5 Assessment Results"}
      </Text>

      {/* Presentation type */}
      <View style={[s.presentationBox, { borderLeftColor: presentationBorderColors[presentationType.type] ?? PRIMARY }]}>
        <Text style={s.presentationLabel}>{presentationType.label}</Text>
        <Text style={s.presentationDesc}>{presentationType.description}</Text>
      </View>

      {/* Domain cards */}
      {[domainA, domainB].map((domain) => (
        <View key={domain.domain} style={s.domainCard}>
          <View style={s.domainRow}>
            <Text style={s.domainLabel}>{domain.domainName}</Text>
            <View style={[s.severityBadge, { backgroundColor: severityColors[domain.severity] ?? "#6b7280" }]}>
              <Text>{domain.severity.toUpperCase()}</Text>
            </View>
          </View>
          <View style={s.scoreBar}>
            <View style={[s.scoreFill, { width: `${domain.percentage}%`, backgroundColor: severityColors[domain.severity] ?? PRIMARY }]} />
          </View>
          <Text style={s.scoreText}>
            {domain.clinicalCount}/{domain.totalQuestions} clinical symptoms · score {domain.totalScore}/{domain.maxScore} · {fmt(domain.percentage)}% · Meets threshold: {domain.meetsCriteria ? "Yes" : "No"}
          </Text>
        </View>
      ))}

      {/* Criteria */}
      {criteria && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>DSM-5 Context Criteria</Text>
          {[
            { label: "5+ symptoms in at least one domain", met: criteria.meetsSymptomThreshold },
            { label: "Symptoms present in multiple settings", met: criteria.multipleSettings },
            { label: "Symptoms evident before age 12", met: criteria.beforeAge12 },
            { label: "Significant impact on daily functioning", met: criteria.significantImpact },
          ].map(({ label, met }) => (
            <View key={label} style={s.criteriaRow}>
              <View style={[s.criteriaIcon, { backgroundColor: met ? "#22c55e" : "#e5e7eb" }]}>
                <Text style={{ fontSize: 7, color: "#fff" }}>{met ? "Y" : "N"}</Text>
              </View>
              <Text style={s.criteriaText}>{label}</Text>
            </View>
          ))}
          {interpretation.clinicalNote && (
            <Text style={s.interpretNote}>{interpretation.clinicalNote}</Text>
          )}
        </View>
      )}

      {/* Gender insights */}
      {interpretation.genderInsights?.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Gender-Specific Insights</Text>
          {interpretation.genderInsights.map((insight: string, i: number) => (
            <Text key={i} style={s.insightItem}>• {insight}</Text>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {interpretation.recommendations?.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Recommendations</Text>
          {interpretation.recommendations.map((rec: string, i: number) => (
            <Text key={i} style={s.recommendationItem}>
              <Text style={s.recommendationNumber}>{i + 1}. </Text>{rec}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Go/No-Go section ──────────────────────────────────────────────────────

function GoNoGoSection({ scores }: { scores: GoNoGoScores }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Cognitive Task: Go / No-Go</Text>
      <Text style={{ fontSize: 9, color: "#6b7280", marginBottom: 8 }}>
        Measures visual attention, impulse control, and reaction time consistency
      </Text>
      <MetricRow label="Visual Attention Quotient (AQvis)" value={scores.aqvis} bar />
      <MetricRow label="Response Control Quotient (RCQvis)" value={scores.rcqvis} bar />
      <MetricRow label="RT Consistency (ICV — lower is better)" value={scores.icv} unit="%" />
      <MetricRow label="Mean Reaction Time" value={scores.meanRT} unit=" ms" />
      <MetricRow label="Omissions (missed targets)" value={scores.omissionPct} unit="%" />
      <MetricRow label="False Alarms (impulse errors)" value={scores.commissionPct} unit="%" />
      <InterpretNote
        text={
          scores.aqvis >= 75 && scores.rcqvis >= 75
            ? "Attention and impulse control appear within typical range."
            : scores.aqvis < 50 || scores.rcqvis < 50
            ? "Scores suggest possible difficulty with sustained attention or impulse control. Consider discussing with a clinician."
            : "Scores show some variability — borderline range. Context from the questionnaire is important."
        }
      />
    </View>
  );
}

// ─── Chronos Sort section ──────────────────────────────────────────────────

function ChronosSection({ scores }: { scores: ChronosScores }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Cognitive Task: Chronos Sort</Text>
      <Text style={{ fontSize: 9, color: "#6b7280", marginBottom: 8 }}>
        Measures time perception, patience, and adaptation — areas often affected by ADHD
      </Text>
      <MetricRow label="Temporal Memory Index (cIM)" value={scores.cIM} bar />
      <MetricRow label="Patience Index (cHR)" value={scores.cHR} bar />
      <MetricRow label="Adaptation Index (cIE)" value={scores.cIE} bar />
      <MetricRow label="Mean Timing Error" value={scores.meanErrorPct} unit="%" />
      <MetricRow label="Premature Releases" value={scores.prematureRate} unit="%" />
      <InterpretNote
        text={
          scores.cIM >= 70 && scores.cHR >= 70
            ? "Time perception and patience scores are in the typical range."
            : scores.cIM < 50 || scores.cHR < 50
            ? "Low scores may reflect time blindness or impulsivity — common in ADHD. Discuss with a clinician."
            : "Borderline scores. The pattern across all tasks provides the clearest picture."
        }
      />
    </View>
  );
}

// ─── Focus Quest section ───────────────────────────────────────────────────

function FocusQuestSection({ scores }: { scores: FocusQuestScores }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Cognitive Task: Focus Quest</Text>
      <Text style={{ fontSize: 9, color: "#6b7280", marginBottom: 8 }}>
        Dual continuous performance task measuring impulse control and working memory
      </Text>
      <MetricRow label="Impulse Control Score (cCPT-X)" value={scores.cCPT_X} bar />
      <MetricRow label="Working Memory Score (cCPT-AX)" value={scores.cCPT_AX} bar />
      <MetricRow label="Inattention Index (cIA)" value={scores.cIA} bar />
      <MetricRow label="Impulsivity Index (cHI)" value={scores.cHI} bar />
      <MetricRow label="Signal Sensitivity (d′)" value={scores.dPrime} unit="" />
      <MetricRow label="Mean Reaction Time" value={scores.xMeanRT} unit=" ms" />
      <MetricRow label="RT Variability (ICV)" value={scores.xICV} unit="%" />
      <InterpretNote
        text={
          scores.cIA >= 70 && scores.cHI >= 70
            ? "Inattention and impulsivity indices are in the typical range."
            : scores.cIA < 50 || scores.cHI < 50
            ? "Scores suggest elevated inattention or impulsivity. This aligns with possible ADHD — discuss with a clinician."
            : "Scores fall in the borderline range. Review alongside questionnaire results for a fuller picture."
        }
      />
    </View>
  );
}

// ─── Main Document ─────────────────────────────────────────────────────────

interface Props {
  bundle: ReportBundle;
}

export default function CombinedPDFReport({ bundle }: Props) {
  const { userData, questionnaire, games } = bundle;
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const gonogoScores = games.gonogo?.scores as GoNoGoScores | undefined;
  const chronosScores = games.chronos?.scores as ChronosScores | undefined;
  const focusQuestScores = games.focusQuest?.scores as FocusQuestScores | undefined;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>ADHD Screening Report</Text>
          <Text style={s.subtitle}>fayth.life — Full Screening Report</Text>
          <Text style={s.userInfo}>
            {userData.name}{userData.age ? `, age ${userData.age}` : ""}
            {userData.gender ? ` · ${userData.gender}` : ""}
            {questionnaire ? ` · ${questionnaire.instrument.toUpperCase()}` : ""}
          </Text>
          <Text style={s.userInfo}>Generated {date}</Text>
        </View>

        {/* Questionnaire */}
        {questionnaire && <QuestionnaireSection q={questionnaire} />}

        {/* Go/No-Go */}
        {gonogoScores && <GoNoGoSection scores={gonogoScores} />}

        {/* Chronos */}
        {chronosScores && <ChronosSection scores={chronosScores} />}

        {/* Focus Quest */}
        {focusQuestScores && <FocusQuestSection scores={focusQuestScores} />}

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Text>
            This report is for informational purposes only and does not constitute a medical diagnosis.
            ADHD can only be formally diagnosed by a qualified clinician following a comprehensive evaluation.
            Please share this report with your doctor or mental health professional.
          </Text>
        </View>

        {/* Footer */}
        <Text style={s.footer}>Generated by fayth.life · {date} · fayth.life/assessment</Text>

      </Page>
    </Document>
  );
}
