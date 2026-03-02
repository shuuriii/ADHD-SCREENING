import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1e1b4b",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#7c3aed",
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e1b4b",
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  userInfo: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 6,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#374151",
  },
  domainCard: {
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    marginBottom: 8,
  },
  domainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  domainLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  severityBadge: {
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    color: "#ffffff",
  },
  scoreBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  scoreFill: {
    height: 8,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 9,
    color: "#6b7280",
  },
  criteriaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  criteriaIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  criteriaText: {
    fontSize: 10,
    flex: 1,
  },
  insightItem: {
    fontSize: 10,
    marginBottom: 4,
    paddingLeft: 10,
    color: "#4c1d95",
  },
  recommendationItem: {
    fontSize: 10,
    marginBottom: 6,
    paddingLeft: 8,
    lineHeight: 1.5,
  },
  recommendationNumber: {
    fontWeight: "bold",
    color: "#7c3aed",
  },
  disclaimer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 4,
    fontSize: 9,
    color: "#92400e",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
  presentationBox: {
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#7c3aed",
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    marginBottom: 8,
  },
  presentationLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e1b4b",
  },
  presentationDesc: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },
});

export const severityColors: Record<string, string> = {
  high: "#ef4444",
  moderate: "#f59e0b",
  mild: "#eab308",
  low: "#22c55e",
};

export const presentationBorderColors: Record<string, string> = {
  combined: "#ef4444",
  inattentive: "#60a5fa",
  hyperactive: "#f59e0b",
  subthreshold: "#22c55e",
};
