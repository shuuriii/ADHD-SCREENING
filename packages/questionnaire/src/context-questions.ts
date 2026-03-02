import type { ContextQuestion } from "./types";

export const contextQuestions: ContextQuestion[] = [
  {
    id: "context_settings",
    type: "context",
    questionNumber: 31,
    text: "Did these types of difficulties occur in multiple settings — such as both at work/school AND at home or in social situations?",
    helpText:
      "DSM-5 requires symptoms present in 2+ settings for diagnosis",
    options: [
      { value: "yes", label: "Yes — two or more settings" },
      { value: "no", label: "No — mainly one setting" },
      { value: "unsure", label: "Unsure" },
    ],
    criteriaKey: "multipleSettings",
  },
  {
    id: "context_age12",
    type: "context",
    questionNumber: 32,
    text: "Were some of these symptoms present and noticeable before age 12?",
    helpText:
      "DSM-5 requires several symptoms to have been present before age 12",
    options: [
      { value: "yes", label: "Yes — before age 12" },
      { value: "no", label: "No — appeared later" },
      { value: "unsure", label: "Unsure / can't recall" },
    ],
    criteriaKey: "beforeAge12",
  },
  {
    id: "context_impact",
    type: "context",
    questionNumber: 33,
    text: "Do these symptoms cause significant difficulty in your daily life (work performance, relationships, managing responsibilities)?",
    helpText:
      "DSM-5 requires symptoms to significantly impair functioning",
    options: [
      { value: "significant", label: "Yes — significant impact" },
      { value: "moderate", label: "Moderate impact" },
      { value: "minimal", label: "Minimal impact" },
    ],
    criteriaKey: "significantImpact",
  },
];
