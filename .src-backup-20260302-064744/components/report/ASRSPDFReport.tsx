"use client";

import {
  Document,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ASRSResult } from "@/questionnaire/types";
import {
  styles,
  severityColors,
} from "./pdf-styles";

interface ASRSPDFReportProps {
  results: ASRSResult;
}

export default function ASRSPDFReport({ results }: ASRSPDFReportProps) {
  const { domainA, domainB, presentationType, interpretation, userData } =
    results;

  const riskColor = results.partAHighRisk ? "#ef4444" : "#22c55e";
  const riskLabel = results.partAHighRisk ? "HIGH RISK" : "LOW RISK";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ADHD Screening Report</Text>
          <Text style={styles.subtitle}>fayth.life — ASRS v1.1 Assessment</Text>
          <Text style={styles.userInfo}>
            {userData.name !== "Anonymous" ? `Name: ${userData.name} | ` : ""}
            Age: {userData.age} | Gender: {userData.gender} | Date:{" "}
            {new Date(results.completedAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Part A Quick Screen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part A — Quick Screener</Text>
          <View
            style={{
              ...styles.presentationBox,
              borderLeftColor: riskColor,
            }}
          >
            <Text style={styles.presentationLabel}>
              {riskLabel}
            </Text>
            <Text style={styles.presentationDesc}>
              {results.partAShadedCount} of 6 shaded items met threshold
              (4+ = high risk)
            </Text>
          </View>
        </View>

        {/* Presentation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
          <View
            style={{
              ...styles.presentationBox,
              borderLeftColor: results.partAHighRisk ? "#ef4444" : "#22c55e",
            }}
          >
            <Text style={styles.presentationLabel}>
              {presentationType.label}
            </Text>
            <Text style={styles.presentationDesc}>
              {presentationType.description}
            </Text>
          </View>
        </View>

        {/* Domain Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptom Domain Scores</Text>

          {[domainA, domainB].map((domain) => (
            <View key={domain.domain} style={styles.domainCard}>
              <View style={styles.domainRow}>
                <Text style={styles.domainLabel}>{domain.domainName}</Text>
                <Text
                  style={{
                    ...styles.severityBadge,
                    backgroundColor: severityColors[domain.severity],
                  }}
                >
                  {domain.severity.toUpperCase()}
                </Text>
              </View>
              <View style={styles.scoreBar}>
                <View
                  style={{
                    ...styles.scoreFill,
                    width: `${domain.percentage}%`,
                    backgroundColor: severityColors[domain.severity],
                  }}
                />
              </View>
              <Text style={styles.scoreText}>
                Clinical symptoms: {domain.clinicalCount}/
                {domain.totalQuestions} | Score: {domain.totalScore}/
                {domain.maxScore} ({domain.percentage}%) | Meets threshold:{" "}
                {domain.meetsCriteria ? "Yes" : "No"}
              </Text>
            </View>
          ))}
        </View>

        {/* Context Criteria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Context Criteria</Text>
          {[
            {
              met: results.partAHighRisk,
              label: "4+ shaded items in Part A quick screener",
            },
            {
              met: results.dsm5Criteria.multipleSettings,
              label: "Symptoms present in multiple settings",
            },
            {
              met: results.dsm5Criteria.beforeAge12,
              label: "Some symptoms present before age 12",
            },
            {
              met: results.dsm5Criteria.significantImpact,
              label: "Significant impact on daily functioning",
            },
          ].map((item) => (
            <View key={item.label} style={styles.criteriaRow}>
              <View
                style={{
                  ...styles.criteriaIcon,
                  backgroundColor: item.met ? "#dcfce7" : "#f3f4f6",
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    color: item.met ? "#16a34a" : "#9ca3af",
                    textAlign: "center",
                  }}
                >
                  {item.met ? "Y" : "N"}
                </Text>
              </View>
              <Text style={styles.criteriaText}>{item.label}</Text>
            </View>
          ))}
          <Text
            style={{ fontSize: 10, color: "#6b7280", marginTop: 8, lineHeight: 1.5 }}
          >
            {interpretation.clinicalNote}
          </Text>
        </View>

        {/* Gender Insights */}
        {interpretation.genderInsights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gender-Specific Insights</Text>
            {interpretation.genderInsights.map((insight) => (
              <Text key={insight} style={styles.insightItem}>
                • {insight}
              </Text>
            ))}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {interpretation.recommendations.map((rec, i) => (
            <Text key={rec} style={styles.recommendationItem}>
              <Text style={styles.recommendationNumber}>{i + 1}. </Text>
              {rec}
            </Text>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text>
            DISCLAIMER: This report is generated by an automated screening tool
            and is NOT a clinical diagnosis. It is based on self-reported
            responses to the ASRS v1.1 (Adult ADHD Self-Report Scale). Only a
            qualified healthcare professional (psychiatrist, psychologist, or
            physician) can diagnose ADHD through comprehensive clinical
            evaluation. Please share this report with your healthcare provider
            for proper assessment.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by fayth.life ADHD Screening Tool — This is a screening
          tool, not a diagnosis.
        </Text>
      </Page>
    </Document>
  );
}
