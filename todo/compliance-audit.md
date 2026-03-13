# Compliance Audit — fayth.life
**Suggested by**: Compliance Auditor Agent
**Audit Date**: 2026-03-13
**Overall Readiness Score**: 28/100

---

## Week 1 — Immediate Fixes

- [x] **F5**: Add security headers (CSP, HSTS, X-Frame-Options, etc.) in `next.config.ts`
- [x] **F6**: Fix OTP timing attack — use `crypto.timingSafeEqual` in `src/lib/otp.ts`
- [x] **F4**: Audit & add Supabase RLS policies for all 6 tables — migration at `supabase/migrations/20260313_enable_rls.sql`

## Week 2 — Legal & Auth

- [x] **F1**: Create privacy policy, terms of service, cookie policy pages — `/privacy`, `/terms`, `/cookies` + Footer component
- [x] **F2**: Add consent checkbox + medical disclaimer on intake form before data collection
- [x] **F7**: Bind `otp_verified` cookie to user identity — HMAC(userId|expiry) token, verified in middleware + OTP verify route

## Week 3 — Data Protection

- [x] **F3**: Encrypt health data in localStorage/sessionStorage — AES-GCM via Web Crypto API with IndexedDB keystore (`src/lib/client-crypto.ts`)
- [x] **F11**: Move Supabase writes to server-side API routes — 5 new routes under `/api/data/` with validation, client calls via `src/lib/api-client.ts`
- [x] **F16**: Remove sensitive data from `console.error` — resolved by F11 (errors now logged server-side only)

## Week 4 — GDPR Rights

- [x] **F8**: Data deletion API (`DELETE /api/data/delete`) + "Delete All My Data" button with confirmation on history page — clears both server + local data
- [x] **F9**: Data retention policy — anonymous 90 days, authenticated 12 months. Auto-cleanup via `POST /api/data/cleanup` + Vercel Cron (weekly Sunday 3am). Add `CRON_SECRET` env var.
- [x] **F14**: Data export API (`GET /api/data/export`) + "Export My Data" button on history page — downloads JSON with all 6 tables

## Week 5 — API Security

- [x] **F13**: CSRF protection via Origin/Referer verification on all 9 POST/DELETE API routes (`src/lib/csrf.ts`)
- [x] **F12**: Rate limiter upgraded to Upstash Redis with in-memory fallback + async API (`src/lib/rate-limit.ts`). Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars.

## Week 6 — Observability

- [x] **F15**: Structured JSON audit logging (`src/lib/audit-log.ts`) — auth events (OAuth, OTP send/verify/fail, signout, rate limit) + data events (save, export, delete) across all routes
- [x] **F17**: Cookie consent banner in root layout (`src/components/ui/CookieConsent.tsx`) — persists acceptance in localStorage, links to cookie policy

## Week 7 — UX & Legal

- [x] **F18**: Expand medical disclaimers — updated CTA section, added disclaimers to all 3 game welcome screens (Go/No-Go, Chronos Sort, Focus Quest), intake already had disclaimer
- [x] **F21**: Accessibility fixes — skip-nav link, `<main>` landmark, aria-labels on navs, `aria-current="page"` on active links, `role="application"` on ChronosSortGame

## Week 8+ — Contractual (Ongoing)

- [ ] **F10**: Negotiate HIPAA BAAs with Supabase, Vercel, Google
  - Supabase: BAA available on Pro plan ($25/mo+). Enable from Dashboard → Settings → Compliance → Sign BAA
  - Vercel: BAA available on Enterprise plan. Contact sales@vercel.com
  - Google (OAuth): BAA not typically required for OAuth-only integration (no PHI stored with Google). Document this decision.
- [ ] **F24**: Execute GDPR DPAs with all subprocessors
  - Supabase: DPA at supabase.com/legal → auto-sign on Pro plan
  - Vercel: DPA at vercel.com/legal/dpa → auto-sign on any paid plan
  - Google: DPA included in Google Cloud Terms of Service
  - Create a subprocessor register documenting all 3 + their DPA status
- [ ] **F22**: Verify Supabase encryption-at-rest documentation
  - Supabase uses AES-256 encryption at rest by default on all plans
  - Document this in your security posture page or internal wiki
  - Verify via Dashboard → Settings → Database → SSL enforcement is ON
- [x] **F23**: Remove redundant email from sessions table (data minimization) — migration at `supabase/migrations/20260314_remove_sessions_email.sql`

## Low Priority

- [x] **F19**: Zod schema validation for all localStorage/sessionStorage JSON.parse — `src/lib/schemas.ts` with `safeParse()` helper, schemas for all 3 game scores, game histories, assessment state, assessment history. Applied to 10 callsites across 9 files.
- [x] **F20**: Use `x-real-ip` instead of `x-forwarded-for` for rate limiting — falls back to `x-forwarded-for` for local dev
