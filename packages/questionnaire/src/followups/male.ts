import type { FollowUpQuestion } from "../types";

export const maleFollowups: FollowUpQuestion[] = [
  {
    id: "male_m1",
    triggerQuestions: ["dsm5_a5", "dsm5_a6", "dsm5_b2", "dsm5_b3"],
    triggerThreshold: 3,
    text: "Do people call you out for being restless or 'always moving' - like friends, family, or coworkers notice you can't sit still, you're always fidgeting, tapping, or getting up and moving around?",
    category: "external_hyperactivity",
  },
  {
    id: "male_m2",
    triggerQuestions: ["dsm5_b7", "dsm5_b8", "dsm5_b9"],
    triggerThreshold: 3,
    text: "Do you constantly interrupt people or jump into conversations - like you can't wait for your turn to talk, you blurt things out, or people have told you that you talk over them without realizing it?",
    category: "verbal_impulsivity",
  },
  {
    id: "male_m3",
    triggerQuestions: ["dsm5_a4", "dsm5_a1"],
    triggerThreshold: 3,
    text: "Do you have a graveyard of unfinished projects - like you start something hyped, then lose interest and jump to the next thing, leaving a trail of abandoned projects behind you (work stuff, hobbies, side hustles, whatever)?",
    category: "project_completion",
  },
  {
    id: "male_m4",
    triggerQuestions: ["dsm5_b10"],
    triggerThreshold: 2,
    text: "Do you do impulsive or risky stuff - like driving too fast, making big purchases without thinking, trying risky activities, making snap decisions, or doing things that objectively seem kinda reckless when you think about it later?",
    category: "risk_taking",
  },
  {
    id: "male_m5",
    triggerQuestions: ["dsm5_a2", "dsm5_a10"],
    triggerThreshold: 3,
    text: "Is staying organized at work or with daily life stuff a constant struggle - like your workspace is chaotic, you miss deadlines, you forget tasks, or managing basic adult responsibilities feels overwhelming?",
    category: "work_organization",
  },
  {
    id: "male_m6",
    triggerQuestions: ["dsm5_a8", "dsm5_a11"],
    triggerThreshold: 3,
    text: "Do you struggle to stay focused during structured, formal stuff - like long meetings, presentations, training sessions, or lectures where you're expected to sit and pay attention for extended periods?",
    category: "structured_attention",
  },
];
