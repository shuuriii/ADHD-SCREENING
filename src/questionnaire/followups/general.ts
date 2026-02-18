import type { FollowUpQuestion } from "../types";

export const generalFollowups: FollowUpQuestion[] = [
  {
    id: "general_g1",
    triggerQuestions: ["dsm5_a1", "dsm5_a2", "dsm5_a4"],
    triggerThreshold: 3,
    text: "Do you experience 'time blindness' - like you genuinely can't tell if something took 10 minutes or 2 hours, you're always underestimating how long tasks will take, or suddenly it's 3pm and you have no idea where the day went?",
    category: "time_perception",
  },
  {
    id: "general_g2",
    triggerQuestions: ["dsm5_a5", "dsm5_a6", "dsm5_b3"],
    triggerThreshold: 2,
    text: "Does your brain feel like it has 47 tabs open - like internally you're restless, your thoughts are racing, and there's constant mental noise, but on the outside you might look totally calm and put together?",
    category: "internal_hyperactivity",
  },
  {
    id: "general_g3",
    triggerQuestions: ["dsm5_a8", "dsm5_a9", "dsm5_a11"],
    triggerThreshold: 3,
    text: "Do you get sucked into hyperfocus mode - like you'll spend hours straight deep-diving into something that interests you while completely ignoring important stuff like eating, sleeping, or actual responsibilities?",
    category: "hyperfocus",
  },
  {
    id: "general_g4",
    triggerQuestions: ["dsm5_b7", "dsm5_b8", "dsm5_b9"],
    triggerThreshold: 2,
    text: "Do your emotions feel like they're on a rollercoaster - like small things hit you hard (criticism feels devastating, excitement is intense, frustration is overwhelming), and your mood can shift dramatically throughout the day?",
    category: "emotional_dysregulation",
  },
  {
    id: "general_g5",
    triggerQuestions: ["dsm5_a2", "dsm5_a10"],
    triggerThreshold: 3,
    text: "Are you exhausted from 'masking' - like constantly working hard to appear organized, focused, and on top of things in social or work situations, then coming home completely drained because keeping it together takes all your energy?",
    category: "masking_burnout",
  },
  {
    id: "general_g6",
    triggerQuestions: ["dsm5_a4", "dsm5_a1"],
    triggerThreshold: 3,
    text: "Do you have a graveyard of unfinished projects - like you start something excited, then lose interest and jump to the next thing, leaving a trail of abandoned projects behind you?",
    category: "project_completion",
  },
];
