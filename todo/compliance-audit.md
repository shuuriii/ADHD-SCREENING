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

- [ ] **F18**: Expand medical disclaimers to intake page, map page, and all entry points
- [x] **F21**: Accessibility fixes — skip-nav link, `<main>` landmark, aria-labels on navs, `aria-current="page"` on active links, `role="application"` on ChronosSortGame

## Week 8+ — Contractual (Ongoing)

- [ ] **F10**: Negotiate HIPAA BAAs with Supabase, Vercel, Google
- [ ] **F24**: Execute GDPR DPAs with all subprocessors
- [ ] **F22**: Verify Supabase encryption-at-rest documentation
- [x] **F23**: Remove redundant email from sessions table (data minimization) — migration at `supabase/migrations/20260314_remove_sessions_email.sql`

## Low Priority

- [ ] **F19**: Add Zod schema validation for localStorage JSON.parse
- [x] **F20**: Use `x-real-ip` instead of `x-forwarded-for` for rate limiting — falls back to `x-forwarded-for` for local dev
