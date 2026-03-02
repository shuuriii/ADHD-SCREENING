# ADHD Screening - Monorepo Structure Overview

## 🎯 What is a Monorepo?

A **monorepo** (monolithic repository) is a single repository containing multiple related projects. In this case:
- One **web app** (`apps/web`) - The Next.js application users interact with
- Seven **shared packages** (`packages/*`) - Reusable libraries that the web app depends on

This structure provides better code organization, reusability, and maintainability.

---

## 📁 Directory Structure

```
adhd-screening-monorepo/
│
├── 📦 Root Configuration Files
│   ├── package.json                 # Workspace configuration
│   ├── package-lock.json            # Dependency lock file
│   ├── tsconfig.json                # Root TypeScript config
│   ├── tsconfig.base.json           # Base config extended by all packages
│   ├── eslint.config.mjs            # Shared ESLint config
│   ├── prettier.config.mjs          # Code formatting config
│   ├── .npmrc                       # npm workspace configuration
│   ├── .gitignore                   # Git ignore rules
│   └── README.md                    # Main readme
│
├── 📂 apps/                         # Applications
│   └── web/                         # Next.js Web Application
│       ├── src/
│       │   ├── app/                 # Next.js app router
│       │   ├── components/          # App-specific React components
│       │   ├── hooks/               # App-specific custom hooks
│       │   ├── contexts/            # App-specific contexts
│       │   ├── lib/                 # App-specific utilities & integrations
│       │   │   ├── audio/           # Audio management
│       │   │   ├── supabase/        # Database integration
│       │   │   └── pwa/             # PWA utilities
│       │   ├── styles/              # Global CSS
│       │   └── middleware.ts        # Next.js middleware
│       ├── public/                  # Static files
│       ├── package.json             # Web app dependencies
│       ├── tsconfig.json            # Web app TypeScript config
│       ├── next.config.ts           # Next.js configuration
│       ├── .eslintrc.json          # Web-specific linting
│       └── README.md
│
├── 📦 packages/                     # Shared Libraries
│
│   ├── types/                       # @adhd/types
│   │   ├── src/
│   │   │   ├── assessment.ts        # Assessment type definitions
│   │   │   ├── game.ts              # Game-related types
│   │   │   ├── user.ts              # User-related types
│   │   │   ├── api.ts               # API response types
│   │   │   └── index.ts             # Main export file
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── constants/                   # @adhd/constants
│   │   ├── src/
│   │   │   ├── routes.ts            # Route path constants
│   │   │   ├── assessment.ts        # Assessment constants
│   │   │   ├── messages.ts          # UI message strings
│   │   │   ├── theme.ts             # Design tokens (colors, spacing)
│   │   │   ├── game-config.ts       # Game configuration
│   │   │   └── index.ts             # Main export file
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── config/                      # @adhd/config
│   │   ├── src/
│   │   │   ├── environment.ts       # Environment variable validation
│   │   │   ├── supabase.ts          # Supabase client config
│   │   │   ├── analytics.ts         # Analytics service config
│   │   │   └── index.ts             # Main export file
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── questionnaire/               # @adhd/questionnaire
│   │   ├── src/
│   │   │   ├── types.ts             # Questionnaire type definitions
│   │   │   ├── instruments/
│   │   │   │   ├── dsm5-questions.ts
│   │   │   │   ├── asrs-questions.ts
│   │   │   │   └── index.ts
│   │   │   ├── context/
│   │   │   │   ├── context-questions.ts
│   │   │   │   └── index.ts
│   │   │   ├── followups/
│   │   │   │   ├── general.ts
│   │   │   │   ├── female.ts
│   │   │   │   ├── male.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts             # Main export file
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── scoring/                     # @adhd/scoring
│   │   ├── src/
│   │   │   ├── dsm5/
│   │   │   │   ├── scoring.ts       # DSM-5 scoring algorithm
│   │   │   │   ├── interpretation.ts # Result interpretation
│   │   │   │   ├── criteria.ts      # Criteria definitions
│   │   │   │   └── index.ts
│   │   │   ├── asrs/
│   │   │   │   ├── scoring.ts       # ASRS scoring algorithm
│   │   │   │   ├── interpretation.ts
│   │   │   │   └── index.ts
│   │   │   ├── games/
│   │   │   │   ├── chronos.ts       # Chronos game scoring
│   │   │   │   ├── focus-quest.ts   # Focus Quest game scoring
│   │   │   │   ├── gonogo.ts        # Go/No-Go game scoring
│   │   │   │   └── index.ts
│   │   │   ├── utils.ts             # Shared scoring utilities
│   │   │   └── index.ts             # Main export file
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── ui/                          # @adhd/ui
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── QuitModal.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── SoundToggle.tsx
│   │   │   │   ├── CursorGlow.tsx
│   │   │   │   ├── IllustratedHeading.tsx
│   │   │   │   └── index.ts         # Barrel export
│   │   │   ├── styles/
│   │   │   │   ├── globals.css
│   │   │   │   └── components.css
│   │   │   └── index.ts             # Main export file
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── utils/                       # @adhd/utils
│   │   ├── src/
│   │   │   ├── string.ts            # String utilities (slugify, etc)
│   │   │   ├── math.ts              # Math utilities
│   │   │   ├── date.ts              # Date utilities
│   │   │   ├── validation.ts        # Input validation
│   │   │   ├── array.ts             # Array utilities
│   │   │   ├── object.ts            # Object utilities
│   │   │   ├── formatting.ts        # Data formatting
│   │   │   └── index.ts             # Main export file
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── shared/                      # @adhd/shared (optional future package)
│       ├── src/
│       └── package.json
│
├── 📚 docs/                         # Documentation
│   ├── MONOREPO_SETUP.md            # Complete setup guide
│   ├── MONOREPO_MIGRATION.md        # Migration instructions
│   ├── FOLDER_STRUCTURE.md          # Detailed structure guide
│   ├── QUICK_REFERENCE.md           # Quick import reference
│   ├── ARCHITECTURE.md              # Architecture overview (from agent)
│   └── README.md
│
└── 📄 Additional Files
    ├── MONOREPO_STRUCTURE.md        # This file
    ├── FOLDER_TREE.txt
    ├── .env.example
    └── .gitignore
```

---

## 📦 Package Purpose and Contents

### @adhd/types
**Purpose**: Centralized TypeScript type definitions

**Exports**:
```typescript
// Assessment types
export type Domain = "A" | "B";
export interface AssessmentResult { ... }
export interface ASRSResult { ... }

// Game types
export interface GameScore { ... }
export type GameType = 'gonogo' | 'chronos' | 'focusQuest';

// User types
export interface UserData { ... }
export type Gender = "female" | "male" | "non-binary" | "prefer-not-to-say";
```

**Size**: Core foundational package - no dependencies on other monorepo packages

---

### @adhd/constants
**Purpose**: Application-wide constants (strings, numbers, configuration values)

**Exports**:
```typescript
// Routes
export const ROUTES = {
  HOME: '/',
  ASSESSMENT: '/assessment',
  QUESTIONNAIRE: '/assessment/questionnaire',
  // ...
};

// Messages
export const MESSAGES = {
  COMPLETE_QUESTIONNAIRE: 'Complete the questionnaire first',
  // ...
};

// Design tokens
export const COLORS = { primary: '#1a8f5a', /* ... */ };
export const SPACING = { xs: '0.25rem', /* ... */ };

// Game configuration
export const GAME_CONFIG = {
  GONOGO: { DURATION_MS: 180000, /* ... */ },
  // ...
};

// Assessment configuration
export const ASSESSMENT_CONSTANTS = {
  DSM5_TOTAL_QUESTIONS: 18,
  ASRS_CLINICAL_THRESHOLD: 4,
  // ...
};
```

**Size**: Small, frequently imported

---

### @adhd/config
**Purpose**: Environment and application configuration management

**Exports**:
```typescript
// Environment variables with validation
export const env = {
  supabaseUrl: string,
  supabaseAnonKey: string,
  appUrl: string,
  isDev: boolean,
  isProd: boolean,
  enableAnalytics: boolean,
};

// Supabase client configuration
export const supabaseConfig = { /* ... */ };

// Analytics configuration
export const analyticsConfig = { /* ... */ };
```

**Size**: Small configuration provider

---

### @adhd/questionnaire
**Purpose**: Assessment questions and questionnaire data

**Exports**:
```typescript
// Question data
export const DSM5_QUESTIONS: DSM5Question[];
export const ASRS_QUESTIONS: ASRSQuestion[];

// Context questions
export const CONTEXT_QUESTIONS: ContextQuestion[];

// Follow-up questions
export const FOLLOWUP_QUESTIONS: FollowUpQuestion[];

// Type definitions
export interface DSM5Question { /* ... */ }
export interface ASRSQuestion { /* ... */ }
export interface ContextQuestion { /* ... */ }

// Exports by subpackage
export { DSM5_QUESTIONS } from './instruments/dsm5';
export { ASRS_QUESTIONS } from './instruments/asrs';
export * from './context';
export * from './followups';
```

**Depends on**: @adhd/types

**Size**: Medium, contains all question data and definitions

---

### @adhd/scoring
**Purpose**: Scoring algorithms for assessments and games

**Exports**:
```typescript
// DSM-5 Scoring
export function calculateDSM5Score(responses: Record<string, LikertValue>): AssessmentScore;
export function interpretDSM5Results(score: AssessmentScore): Interpretation;

// ASRS Scoring
export function calculateASRSScore(responses: Record<string, LikertValue>): ASRSScore;
export function interpretASRSResults(score: ASRSScore): Interpretation;

// Game Scoring
export function scoreGoNoGoGame(gameData: GameData): GameScore;
export function scoreChronosGame(gameData: GameData): GameScore;
export function scoreFocusQuestGame(gameData: GameData): GameScore;

// Shared utilities
export function calculatePercentile(score: number, maxScore: number): number;
export function calculateSeverity(score: number, threshold: number): Severity;
```

**Depends on**: @adhd/questionnaire, @adhd/types, @adhd/utils

**Size**: Large, contains complex calculation logic

---

### @adhd/ui
**Purpose**: Reusable React UI components

**Exports**:
```typescript
// Basic components
export { Button } from './components/Button';
export { Card } from './components/Card';
export { Header } from './components/Header';

// Modal and overlays
export { QuitModal } from './components/QuitModal';
export { ErrorBoundary } from './components/ErrorBoundary';

// Interactive
export { SoundToggle } from './components/SoundToggle';
export { CursorGlow } from './components/CursorGlow';

// Typography
export { IllustratedHeading } from './components/IllustratedHeading';

// Styles
export * from './styles';
```

**Depends on**: @adhd/constants, @adhd/types, framer-motion, lucide-react

**Size**: Medium, contains React components

**Note**: This package can be published to npm as a component library

---

### @adhd/utils
**Purpose**: General utility functions

**Exports**:
```typescript
// String utilities
export { slugify, capitalize, truncate } from './string';

// Math utilities
export { calculatePercentage, roundToTwo } from './math';

// Date utilities
export { formatDate, calculateAge } from './date';

// Validation
export { validateEmail, validateAge } from './validation';

// Array utilities
export { unique, flatten, groupBy } from './array';

// Object utilities
export { pick, omit, merge } from './object';

// Formatting
export { formatCurrency, formatScore } from './formatting';
```

**Depends on**: None (no other monorepo packages)

**Size**: Small to medium, frequently used

---

## 🔄 Dependency Graph

```
@adhd/web (Next.js App)
│
├─→ @adhd/constants         ✓ (independent)
├─→ @adhd/config            ✓ (depends on utils only)
├─→ @adhd/types             ✓ (independent)
├─→ @adhd/utils             ✓ (independent)
├─→ @adhd/ui                ✓ (depends on constants, types)
├─→ @adhd/questionnaire    ✓ (depends on types)
└─→ @adhd/scoring           ✓ (depends on questionnaire, types, utils)

Each package is independently buildable.
No circular dependencies.
Linear dependency tree for clean builds.
```

---

## 💻 Common Commands

### Setup
```bash
# Install all dependencies
npm install

# Clean everything
npm run clean
```

### Development
```bash
# Start web app in dev mode
npm run dev

# Build all packages
npm run build

# Type checking (all packages)
npm run type-check

# Linting (all packages)
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check
```

### Testing
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch
```

### Workspace-Specific Commands
```bash
# Run command in specific package
npm -w @adhd/scoring run build

# Run in web app
npm -w apps/web run dev

# Install dependency in specific package
npm install @new-package --save-workspace=@adhd/utils
```

---

## 📝 Import Patterns

### From Web App (apps/web)
```typescript
// Import from monorepo packages
import { ROUTES } from '@adhd/constants';
import { env } from '@adhd/config';
import type { AssessmentResult } from '@adhd/types';
import { Button } from '@adhd/ui';
import { calculateDSM5Score } from '@adhd/scoring';
import { DSM5_QUESTIONS } from '@adhd/questionnaire';
import { slugify } from '@adhd/utils';

// Local imports within web app
import { MyComponent } from '@/components/MyComponent';
import { useMyHook } from '@/hooks/useMyHook';
import { AudioManager } from '@/lib/audio';
```

### From Package to Package
```typescript
// Within @adhd/scoring package
import type { DSM5Question } from '@adhd/questionnaire';
import type { LikertValue } from '@adhd/types';
import { calculatePercentage } from '@adhd/utils';

// Relative imports within same package
import { helper } from '../utils';
import { ScoringConfig } from './config';
```

---

## 🚀 Next Steps

### Immediate (This Setup)
- [x] Create monorepo directory structure
- [x] Create package.json files for all packages
- [x] Setup TypeScript configuration
- [x] Create documentation

### Phase 1: Migration (Next)
- [ ] Move files from `src/` to appropriate packages
- [ ] Create barrel exports (index.ts) for each package
- [ ] Update all imports to use `@adhd/*` paths
- [ ] Run `npm install`
- [ ] Test build and development

### Phase 2: Enhancement
- [ ] Add tests for each package
- [ ] Setup CI/CD pipelines
- [ ] Consider publishing packages to npm
- [ ] Create component Storybook documentation
- [ ] Add pre-commit hooks (husky)

### Phase 3: Optimization
- [ ] Setup Turborepo for advanced caching
- [ ] Configure build caching
- [ ] Setup automated package versioning (Changesets)
- [ ] Configure GitHub Actions for automated publishing

---

## ✅ Benefits Realized

| Benefit | How |
|---------|-----|
| **Reusability** | Packages can be used in future projects or published to npm |
| **Scalability** | Add new packages without affecting existing ones |
| **Maintainability** | Clear structure, isolated concerns |
| **Type Safety** | Shared types prevent mismatches |
| **Testability** | Each package can be tested independently |
| **Performance** | Only rebuild affected packages |
| **Developer Experience** | Clear imports, organized structure |
| **Publishing** | Packages ready to share on npm |

---

## 📖 Further Reading

- See `docs/MONOREPO_SETUP.md` for complete setup instructions
- See `docs/MONOREPO_MIGRATION.md` for migration checklist
- See `docs/ARCHITECTURE.md` for detailed architecture
- See `docs/QUICK_REFERENCE.md` for quick import patterns
- See `docs/FOLDER_STRUCTURE.md` for original app structure

---

**Ready to migrate?** Read `docs/MONOREPO_MIGRATION.md` for step-by-step instructions.
