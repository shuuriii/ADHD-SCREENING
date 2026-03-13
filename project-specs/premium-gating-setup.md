# Premium Gating for Gamified Assessments

## Overview

Gate 2 of the 3 cognitive games behind a "Go Premium" wall. Go/No-Go remains free. Chronos Sort and Focus Quest appear locked for non-premium users. No payment backend — premium state is a localStorage flag toggled via UI.

## Current State

- Three games accessible from the game hub at `/assessment/focus-task/page.tsx`
- All three are free and fully accessible
- Game pages: `/assessment/gonogo`, `/assessment/chronos-task`, `/assessment/focus-quest`
- Results page at `/assessment/results/page.tsx` links to all games

## Requirements

### Premium State

- Stored in `localStorage["fayth-premium"]` as `"true"` / absent
- Read via `useEffect` to avoid SSR hydration mismatch
- Utility module: `src/lib/premium.ts`
  - `isPremium(): boolean` — reads localStorage
  - `setPremium(value: boolean): void` — writes localStorage
  - `FREE_GAME = "gonogo"` — constant identifying the free game
  - `usePremium(): boolean` — React hook (useState + useEffect) for components

### Game Hub Changes (`src/app/assessment/focus-task/page.tsx`)

- Go/No-Go card: unchanged, always clickable. Add a small "Free" badge.
- Chronos Sort card: if non-premium, render `<LockedGameCard>` instead of the `<Link>`.
- Focus Quest card: same as Chronos Sort.
- Add `<GoPremiumBanner>` above or below the card grid for non-premium users.

### Locked Game Card (`src/components/ui/LockedGameCard.tsx`)

- Visually matches existing game cards but with:
  - `opacity-50` or similar dimming
  - Centered `Lock` icon overlay (from lucide-react)
  - "Premium" label below the lock
  - Non-clickable (no `<Link>`, just a `<div>`)
- Props: `title`, `description`, `measures`, `emoji`, `accentColor`

### Go Premium Banner (`src/components/ui/GoPremiumBanner.tsx`)

- Gradient banner (purple/indigo tones to match dark theme)
- `Crown` icon from lucide-react
- Headline: "Unlock the Full Cognitive Battery"
- Subtext: "Get access to Chronos Sort and Focus Quest for a complete ADHD profile."
- "Go Premium" button
- On click: calls `setPremium(true)`, triggers re-render (pass a callback prop or use the hook)
- Hidden when user is already premium

### Route Guards

- `/assessment/chronos-task/page.tsx`: on mount, check `isPremium()`. If false, redirect to `/assessment/focus-task` (game hub) via `router.replace()`.
- `/assessment/focus-quest/page.tsx`: same guard.
- Use `useEffect` + `useState` pattern. Render nothing (or a loading spinner) until check completes.

### GoNoGoGame Results Screen (`src/components/game/GoNoGoGame.tsx`)

- After game completion, the results screen shows a "Next: Chronos Sort →" link (line 582) and a "Back to Tasks" link.
- For non-premium users: replace the "Next: Chronos Sort →" link with a disabled/locked version showing a Lock icon + "Premium" label, and keep "Back to Tasks" always accessible.
- For premium users: show the normal clickable "Next: Chronos Sort →" link as before.

### Results Page CTA (`src/app/assessment/results/page.tsx`)

- The results page has a single "Start Gamified Assessments" CTA (line 210-216) linking to the game hub at `/assessment/focus-task`.
- Update CTA text to "Play Go/No-Go (Free)" for non-premium users.
- For premium users: keep existing "Start Gamified Assessments" text.
- No individual game links to gate here — the game hub handles per-game locking.

## Design Tokens

Matches existing dark theme from `focus-task/page.tsx`:

| Element | Value |
|---------|-------|
| Background | `#0d0f14` |
| Card bg | `#1b1f2b` |
| Card border | `#252a38` |
| Muted text | `#5a6180` |
| Go/No-Go accent | `#f5c842` |
| Chronos accent | `#00d4c8` |
| Focus Quest accent | `#38bdf8` |
| Premium/banner accent | `#a78bfa` (violet-400) |
| Lock overlay bg | `rgba(13, 15, 20, 0.7)` |

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/premium.ts` | `isPremium()`, `setPremium()`, `usePremium()`, `FREE_GAME` |
| `src/components/ui/LockedGameCard.tsx` | Locked card with Lock icon overlay |
| `src/components/ui/GoPremiumBanner.tsx` | Gradient banner with Crown icon + unlock button |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/assessment/focus-task/page.tsx` | Conditional locked/unlocked cards + banner |
| `src/app/assessment/chronos-task/page.tsx` | Premium route guard |
| `src/app/assessment/focus-quest/page.tsx` | Premium route guard |
| `src/components/game/GoNoGoGame.tsx` | Conditional "next game" links on results |
| `src/app/assessment/results/page.tsx` | CTA copy tweaks |

## Acceptance Criteria

1. `npm run build` passes with no errors
2. Non-premium user can play Go/No-Go, sees locked Chronos Sort + Focus Quest cards
3. Clicking "Go Premium" sets `localStorage["fayth-premium"]` to `"true"`, cards unlock immediately
4. Direct navigation to `/assessment/chronos-task` redirects non-premium users to `/assessment/focus-task`
5. Direct navigation to `/assessment/focus-quest` redirects non-premium users to `/assessment/focus-task`
6. Premium user sees all 3 games accessible as before
7. Go/No-Go results screen shows locked "next game" links for non-premium users
8. No hydration mismatches — all localStorage reads happen in `useEffect`
