import type { FollowUpQuestion } from "../types";

export const femaleFollowups: FollowUpQuestion[] = [
  {
    id: "female_f1",
    triggerQuestions: ["dsm5_a1", "dsm5_a2", "dsm5_a4"],
    triggerThreshold: 3,
    text: "Do you experience 'time blindness' - like you genuinely can't tell if something took 10 minutes or 2 hours, you're always underestimating how long tasks will take, or suddenly it's 3pm and you're like 'wait what happened to the morning?'",
    category: "time_perception",
  },
  {
    id: "female_f2",
    triggerQuestions: ["dsm5_a1", "dsm5_a7"],
    triggerThreshold: 3,
    text: "Do you get stuck in perfectionism spirals - like if you can't do something perfectly you won't do it at all, or you spend hours obsessing over tiny details that don't really matter, or you abandon projects because they're not turning out 'perfect enough'?",
    category: "perfectionism",
  },
  {
    id: "female_f3",
    triggerQuestions: ["dsm5_a5", "dsm5_a6", "dsm5_b3"],
    triggerThreshold: 2,
    text: "Does your brain feel like a browser with 47 tabs open - like internally you're restless AF, your thoughts are racing, and there's constant mental chaos, but on the outside you look totally calm and put together?",
    category: "internal_hyperactivity",
  },
  {
    id: "female_f4",
    triggerQuestions: ["dsm5_a8", "dsm5_a9", "dsm5_a11"],
    triggerThreshold: 3,
    text: "Do you get sucked into hyperfocus mode - like you'll spend 6 hours straight deep-diving into something that interests you (researching, creating, organizing, watching videos) while completely ignoring important stuff like eating, sleeping, or actual responsibilities?",
    category: "hyperfocus",
  },
  {
    id: "female_f5",
    triggerQuestions: ["dsm5_b7", "dsm5_b8", "dsm5_b9"],
    triggerThreshold: 2,
    text: "Do your emotions feel like they're on a rollercoaster - like small things hit you HARD (criticism feels devastating, excitement is INTENSE, frustration makes you want to cry), and your mood can shift dramatically throughout the day for seemingly no reason?",
    category: "emotional_dysregulation",
  },
  {
    id: "female_f6",
    triggerQuestions: ["dsm5_a2", "dsm5_a10"],
    triggerThreshold: 3,
    text: "Are you exhausted from 'masking' - like constantly working SO hard to appear organized, focused, and 'normal' at work or in social situations, then coming home completely drained because pretending to have your life together takes all your energy?",
    category: "masking_burnout",
  },
  {
    id: "female_f7",
    triggerQuestions: ["dsm5_a9"],
    triggerThreshold: 3,
    text: "Do you struggle to juggle multiple life things at once - like when you're trying to balance work, social life, family stuff, household chores, and self-care, something (or everything) starts falling apart because it's too much to track?",
    category: "multitasking",
  },
];
