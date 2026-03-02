# Monorepo Migration Guide

## Current Status

Your project has been restructured into a **monorepo** for better organization and reusability.

## What Changed

### Before: Single App Structure
```
ADHD-SCREENING/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── config/
│   ├── constants/
│   ├── types/
│   ├── contexts/
│   ├── hooks/
│   ├── questionnaire/
│   └── ...
├── public/
├── tests/
├── package.json
└── tsconfig.json
```

### After: Monorepo Structure
```
ADHD-SCREENING/
├── apps/
│   └── web/                    # The Next.js application
│       ├── src/
│       ├── public/
│       └── package.json
│
├── packages/                   # Shared libraries
│   ├── types/
│   ├── constants/
│   ├── config/
│   ├── questionnaire/
│   ├── scoring/
│   ├── ui/
│   └── utils/
│
├── tsconfig.base.json
├── package.json               # Root workspace config
└── docs/
    ├── MONOREPO_SETUP.md
    └── MONOREPO_MIGRATION.md
```

## File Migration Map

This shows where files should be moved during the migration:

### Types → @adhd/types
```
src/types/
├── index.ts              → packages/types/src/index.ts
├── assessment.ts         → packages/types/src/assessment.ts
├── game.ts              → packages/types/src/game.ts
└── user.ts              → packages/types/src/user.ts
```

### Constants → @adhd/constants
```
src/constants/
├── index.ts             → packages/constants/src/index.ts
├── routes.ts            → packages/constants/src/routes.ts
├── assessment.ts        → packages/constants/src/assessment.ts
├── theme.ts             → packages/constants/src/theme.ts
├── messages.ts          → packages/constants/src/messages.ts
└── game-config.ts       → packages/constants/src/game-config.ts
```

### Config → @adhd/config
```
src/config/
├── index.ts             → packages/config/src/index.ts
├── environment.ts       → packages/config/src/environment.ts
├── supabase.ts          → packages/config/src/supabase.ts
└── analytics.ts         → packages/config/src/analytics.ts
```

### Questionnaire → @adhd/questionnaire
```
src/questionnaire/
├── index.ts             → packages/questionnaire/src/index.ts
├── types.ts             → packages/questionnaire/src/types.ts
├── scoring.ts           → packages/questionnaire/src/scoring.ts
├── asrs-scoring.ts      → packages/questionnaire/src/asrs-scoring.ts
├── instruments/         → packages/questionnaire/src/instruments/
├── context-questions.ts → packages/questionnaire/src/context/questions.ts
└── followups/           → packages/questionnaire/src/followups/
```

### Scoring Logic → @adhd/scoring
```
New package: @adhd/scoring
├── src/
│   ├── index.ts
│   ├── dsm5-scoring.ts      (migrated from questionnaire/)
│   ├── asrs-scoring.ts      (migrated from questionnaire/)
│   └── game-scoring.ts      (extracted from components)
```

### Components → @adhd/ui
```
src/components/
├── ui/                  → packages/ui/src/ui/
├── assessment/          → packages/ui/src/assessment/
├── game/               → packages/ui/src/game/
├── landing/            → packages/ui/src/landing/
├── report/             → packages/ui/src/report/
└── results/            → packages/ui/src/results/
```

### Utils → @adhd/utils
```
src/lib/utils/
├── string.ts           → packages/utils/src/string.ts
├── validation.ts       → packages/utils/src/validation.ts
└── formatting.ts       → packages/utils/src/formatting.ts
```

### Web App → apps/web
```
Remaining files go into apps/web/src/:
├── app/                (Next.js routes)
├── components/         (app-specific components)
├── hooks/             (app-specific hooks)
├── contexts/          (app-specific contexts)
├── middleware.ts
├── globals.css
└── lib/
    ├── audio/         (app-specific)
    ├── supabase/      (app-specific)
    └── report-bundle.ts
```

## Step-by-Step Migration

### Phase 1: Create Package Directory Structure

```bash
# Already created:
# packages/types/src/
# packages/constants/src/
# packages/config/src/
# packages/questionnaire/src/
# packages/scoring/src/
# packages/ui/src/
# packages/utils/src/
# apps/web/src/
```

### Phase 2: Copy Files to Packages

For each package, copy the appropriate source files and create index exports.

### Phase 3: Create Index Files (Barrel Exports)

Each package needs an `index.ts` that exports public API:

**packages/types/src/index.ts**:
```typescript
export * from './assessment';
export * from './game';
export * from './user';
```

**packages/constants/src/index.ts**:
```typescript
export * from './routes';
export * from './assessment';
export * from './theme';
export * from './messages';
export * from './game-config';
```

### Phase 4: Update Imports

Change from:
```typescript
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui';
import type { AssessmentResult } from '@/types';
```

To:
```typescript
import { ROUTES } from '@adhd/constants';
import { Button } from '@adhd/ui';
import type { AssessmentResult } from '@adhd/types';
```

### Phase 5: Build Packages

```bash
npm install
npm run build
```

### Phase 6: Test Web App

```bash
npm run dev
```

## Implementation Checklist

### Preparation
- [ ] Review this migration guide
- [ ] Understand the new structure
- [ ] Read `docs/MONOREPO_SETUP.md`

### Create Package Structure
- [ ] Create `packages/types/src/`
- [ ] Create `packages/constants/src/`
- [ ] Create `packages/config/src/`
- [ ] Create `packages/questionnaire/src/`
- [ ] Create `packages/scoring/src/`
- [ ] Create `packages/ui/src/`
- [ ] Create `packages/utils/src/`
- [ ] Create `apps/web/src/`

### Copy Files
- [ ] Copy types files to `packages/types/src/`
- [ ] Copy constants files to `packages/constants/src/`
- [ ] Copy config files to `packages/config/src/`
- [ ] Copy questionnaire files to `packages/questionnaire/src/`
- [ ] Create scoring package from scoring logic
- [ ] Copy components to `packages/ui/src/`
- [ ] Copy utils to `packages/utils/src/`
- [ ] Copy app code to `apps/web/src/`

### Create Barrel Exports
- [ ] Create `packages/types/src/index.ts`
- [ ] Create `packages/constants/src/index.ts`
- [ ] Create `packages/config/src/index.ts`
- [ ] Create `packages/questionnaire/src/index.ts`
- [ ] Create `packages/scoring/src/index.ts`
- [ ] Create `packages/ui/src/index.ts`
- [ ] Create `packages/utils/src/index.ts`

### Setup Package Build Files
- [ ] Create `packages/types/tsconfig.json`
- [ ] Create `packages/constants/tsconfig.json`
- [ ] Create `packages/config/tsconfig.json`
- [ ] Create `packages/questionnaire/tsconfig.json`
- [ ] Create `packages/scoring/tsconfig.json`
- [ ] Create `packages/ui/tsconfig.json`
- [ ] Create `packages/utils/tsconfig.json`

### Update Apps
- [ ] Move `apps/web/src/*` files into place
- [ ] Create `apps/web/tsconfig.json` (extends base)
- [ ] Create `apps/web/.eslintrc.json`

### Update Imports
- [ ] Update `apps/web/src/**/*.tsx` to use `@adhd/*` imports
- [ ] Remove old `src/` directory (after backup)
- [ ] Update test imports
- [ ] Update Next.js config if needed

### Finalize
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Run `npm run dev` and test
- [ ] Commit changes

## Import Transformation Examples

### Example 1: Using Constants

**Before**:
```typescript
import { ROUTES, MESSAGES } from '@/constants';

function MyComponent() {
  return <Link href={ROUTES.QUESTIONNAIRE}>{MESSAGES.START}</Link>;
}
```

**After** (same code, different import):
```typescript
import { ROUTES, MESSAGES } from '@adhd/constants';

function MyComponent() {
  return <Link href={ROUTES.QUESTIONNAIRE}>{MESSAGES.START}</Link>;
}
```

### Example 2: Using Types

**Before**:
```typescript
import type { AssessmentResult } from '@/types';
import { calculateScore } from '@/lib/scoring';

export function processResult(result: AssessmentResult) {
  return calculateScore(result);
}
```

**After**:
```typescript
import type { AssessmentResult } from '@adhd/types';
import { calculateScore } from '@adhd/scoring';

export function processResult(result: AssessmentResult) {
  return calculateScore(result);
}
```

### Example 3: Using UI Components

**Before**:
```typescript
import { Button } from '@/components/ui';
import { QuestionCard } from '@/components/assessment';

export default function Page() {
  return (
    <>
      <QuestionCard />
      <Button>Next</Button>
    </>
  );
}
```

**After**:
```typescript
import { Button, QuestionCard } from '@adhd/ui';

export default function Page() {
  return (
    <>
      <QuestionCard />
      <Button>Next</Button>
    </>
  );
}
```

## Verification Steps

After migration, verify everything works:

### 1. Type Checking
```bash
npm run type-check
```
Should have no errors.

### 2. Build All
```bash
npm run build
```
All packages should build successfully.

### 3. Development Server
```bash
npm run dev
```
Next.js dev server should start without errors.

### 4. Feature Testing
- Navigate to `/assessment/intake`
- Start a questionnaire
- Play a game
- View results
- Download PDF

### 5. Git Status
```bash
git status
```
Review and commit changes:
```bash
git add .
git commit -m "refactor: migrate from app structure to monorepo

- Create 7 reusable packages under packages/
- Move web app code to apps/web/
- Update all imports to use @adhd/* paths
- Setup npm workspaces and shared configs
- Prepare for package publishing"
```

## Troubleshooting

### Import Resolution Issues

If you get "Cannot find module '@adhd/package'" errors:

1. Verify the package exists in `packages/`
2. Check it's listed in root `package.json` workspaces
3. Run `npm install` from root
4. Verify `tsconfig.base.json` paths include the package

### Build Failures

If `npm run build` fails:

1. Check TypeScript errors: `npm run type-check`
2. Verify all imports are updated to use `@adhd/*` paths
3. Ensure all exported symbols are defined
4. Check for circular dependencies

### Dev Server Won't Start

If `npm run dev` fails:

1. Delete `apps/web/.next` directory
2. Run `npm install` from root
3. Check `apps/web/tsconfig.json` exists and extends base
4. Verify Next.js config is correct

## Benefits of Monorepo

✅ **Code Reusability** - Packages can be used in future projects
✅ **Separation of Concerns** - Clear boundaries between packages
✅ **Scalability** - Easy to add new packages
✅ **Testability** - Test packages independently
✅ **Versioning** - Each package can have its own version
✅ **Publishing** - Packages can be published to npm
✅ **Dependency Management** - Clear dependency graph
✅ **Developer Experience** - Consistent structure, easier navigation

## Next Steps

1. Review structure with team
2. Begin file migration (Phase 1-2)
3. Update imports (Phase 4)
4. Test thoroughly
5. Commit to version control
6. Update CI/CD pipelines if using
7. Consider publishing packages to npm

## Questions?

Refer to:
- `docs/MONOREPO_SETUP.md` - Complete setup guide
- `FOLDER_TREE.txt` - Visual structure
- `docs/QUICK_REFERENCE.md` - Import patterns
