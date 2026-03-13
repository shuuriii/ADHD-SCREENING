# Premium Gating — Task List

Spec: `project-specs/premium-gating-setup.md`

---

## Task 1: Create `src/lib/premium.ts` utility

**Create** `src/lib/premium.ts` with:
- `FREE_GAME = "gonogo"` constant
- `isPremium(): boolean` — reads `localStorage["fayth-premium"]`, returns `true` if value is `"true"`
- `setPremium(value: boolean): void` — sets or removes the localStorage key
- `usePremium(): boolean` — React hook using `useState(false)` + `useEffect` to read premium state (avoids SSR hydration mismatch)

**Verify:** Import and call in a test or dev console. `npm run build` passes.

---

## Task 2: Create `LockedGameCard` component

**Create** `src/components/ui/LockedGameCard.tsx`:
- Props: `title: string`, `description: string`, `measures: string`, `emoji: string`, `accentColor: string`
- Renders a card matching the existing game card layout from `focus-task/page.tsx`
- Card has `opacity-50`, pointer-events-none
- Centered overlay with `Lock` icon (lucide-react) + "Premium" label
- Overlay bg: `rgba(13, 15, 20, 0.7)` with rounded corners matching card

**Verify:** Render in isolation, visually compare against existing cards. `npm run build` passes.

---

## Task 3: Create `GoPremiumBanner` component

**Create** `src/components/ui/GoPremiumBanner.tsx`:
- Props: `onUnlock: () => void`
- Gradient background (violet/indigo tones: `from-[#2d1b69] to-[#1b1f2b]`)
- `Crown` icon from lucide-react, colored `#a78bfa`
- Headline: "Unlock the Full Cognitive Battery"
- Subtext: "Get access to Chronos Sort and Focus Quest for a complete ADHD profile."
- "Go Premium" button styled with `bg-[#a78bfa]` + hover state
- On click: calls `onUnlock()` prop

**Verify:** Render in isolation, check responsive layout. `npm run build` passes.

---

## Task 4: Modify game hub with conditional rendering

**Modify** `src/app/assessment/focus-task/page.tsx`:
- Import `usePremium`, `setPremium` from `@/lib/premium`
- Import `LockedGameCard` and `GoPremiumBanner`
- Call `usePremium()` hook in component
- Go/No-Go card: add small "Free" badge (e.g., `font-mono text-[9px] text-[#34d399] bg-[#34d399]/10 px-2 py-0.5 rounded`)
- Chronos Sort card: if `!premium`, render `<LockedGameCard>` with matching props instead of the `<Link>`
- Focus Quest card: same conditional
- Below card grid: if `!premium`, render `<GoPremiumBanner onUnlock={() => setPremium(true)}>` — force re-render by calling the hook's state setter or using a key
- Handle re-render after unlock: `usePremium` hook should listen for changes, or use local state + callback

**Verify:**
- Non-premium: Go/No-Go clickable, other two locked, banner visible
- Click "Go Premium": all cards unlock, banner disappears
- `npm run build` passes, no hydration warnings

---

## Task 5: Add route guards to chronos-task and focus-quest

**Modify** `src/app/assessment/chronos-task/page.tsx`:
- Import `isPremium` from `@/lib/premium` and `useRouter` from `next/navigation`
- Add `useState("loading")` + `useEffect` that checks `isPremium()`:
  - If false: `router.replace("/assessment/focus-task")`
  - If true: set state to "ready"
- Render game component only when state is "ready"; render nothing (or minimal loading) otherwise

**Modify** `src/app/assessment/focus-quest/page.tsx`:
- Same pattern as chronos-task

**Verify:**
- Non-premium user navigating to `/assessment/chronos-task` → redirected to `/assessment/focus-task`
- Non-premium user navigating to `/assessment/focus-quest` → redirected to `/assessment/focus-task`
- Premium user → game loads normally
- `npm run build` passes

---

## Task 6: Update GoNoGoGame results screen navigation

**Modify** `src/components/game/GoNoGoGame.tsx`:
- Import `usePremium` from `@/lib/premium` and `Lock` from `lucide-react`
- In the results screen (line ~578-588), find the `<Link href="/assessment/chronos-task">Next: Chronos Sort →</Link>`
- If `!premium`: replace with a disabled div showing Lock icon + "Premium" label, styled to match but non-clickable
- If premium: show the normal clickable Link as before
- "Play Again" and "Back to Tasks" links remain unchanged

**Verify:**
- Complete Go/No-Go as non-premium → "Next: Chronos Sort" is locked
- Complete Go/No-Go as premium → "Next: Chronos Sort" is clickable
- `npm run build` passes

---

## Task 7: Update results page CTA copy

**Modify** `src/app/assessment/results/page.tsx`:
- Import `usePremium` from `@/lib/premium`
- Find the "Start Gamified Assessments" CTA (line ~210-216), which links to the game hub
- If `!premium`: change button text to "Play Go/No-Go (Free)" (hub will handle per-game locking)
- If premium: keep existing "Start Gamified Assessments" text
- No individual game links to gate — the game hub handles that

**Verify:**
- Non-premium results page shows "Play Go/No-Go (Free)" CTA
- Premium results page shows "Start Gamified Assessments" CTA
- `npm run build` passes

---

## Task 8: Integration testing — verify full flow

**Test the complete flow:**

1. Clear `localStorage["fayth-premium"]`
2. Navigate to game hub → Go/No-Go is clickable with "Free" badge, other two locked, banner visible
3. Navigate directly to `/assessment/chronos-task` → redirected to game hub
4. Navigate directly to `/assessment/focus-quest` → redirected to game hub
5. Play Go/No-Go → results screen shows locked "Next: Chronos Sort" link
6. Go to results page → CTA shows "Play Go/No-Go (Free)"
7. Click "Go Premium" on banner → all cards unlock, banner disappears
8. Navigate to `/assessment/chronos-task` → game loads
9. Navigate to `/assessment/focus-quest` → game loads
10. `npm run build` passes with no errors
11. No hydration mismatch warnings in dev console
