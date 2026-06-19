ADHD Screening — fayth.life
A clinician-built ADHD screening and reporting platform for Indian adults, designed by a practicing MBBS doctor with lived understanding of how ADHD presents, gets missed, and goes unmanaged in India.
Built with Next.js, TypeScript, and Supabase. Deployed on Vercel.
What This Is
Most ADHD screening tools in India are either clinical PDFs or Western apps with no India context. This platform combines:
DSM-5 based screening questionnaire — validated criteria, not generic checklists
Cognitive assessment tasks (FocusOS) — gamified digital biomarkers for attention, inhibition, and working memory
Automated report generation — structured output a psychiatrist or psychologist can act on
Care pathway integration — connects to the full fayth.life CBT management protocol
This is the screening layer of a larger platform. The goal is to get patients from "I think I have ADHD" to a clinically meaningful report in under 20 minutes.
Tech Stack
Layer
Tech
Frontend
Next.js 14, TypeScript, Tailwind CSS
Backend
Supabase (Postgres + Auth + RLS)
Deployment
Vercel
Testing
Vitest
Data/Analysis
Python (DSM results plotting)Clinical Design
The screening flow is built around two inputs:
1. DSM-5 Symptom Questionnaire
Covers inattention and hyperactivity/impulsivity domains. Scoring follows DSM-5 criteria with age-of-onset and cross-setting validation built into the flow.
2. Cognitive Performance Tasks
Digital tasks measuring:
Sustained attention
Response inhibition
Working memory
Processing speed
Combined output feeds into a structured report with symptom severity, functional impact, and a recommended care pathway.
Why This Exists
ADHD in Indian adults is dramatically underdiagnosed. Barriers include:
No awareness that ADHD persists into adulthood
Stigma around psychiatric evaluation
Shortage of trained assessors outside metro cities
No structured screening pathway in primary care
This tool is designed to be used by adults themselves, or administered by a GP or telemedicine provider, to generate a report that supports — not replaces — a clinical diagnosis.
Status
Active development. Core screening flow is functional. CBT management protocol and psychologist assignment layer in progress at fayth.life.
Built By
Sunshine — MBBS (Chettinad Academy of Research and Education), Junior Doctor in General Medicine, Chennai. Founder of fayth.life.
LinkedIn · fayth.life · GitHub
