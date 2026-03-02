# ADHD Screening - Monorepo Setup Guide

## Overview

This project has been restructured as a **monorepo** for better code organization, reusability, and maintainability. It uses **npm workspaces** for package management.

## Monorepo Structure

```
adhd-screening-monorepo/
├── apps/
│   └── web/                    # Next.js web application
│       ├── src/
│       ├── public/
│       ├── next.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                   # Shared libraries
│   ├── types/                  # @adhd/types - Type definitions
│   ├── constants/              # @adhd/constants - Constants
│   ├── config/                 # @adhd/config - Configuration
│   ├── questionnaire/          # @adhd/questionnaire - Assessment questions
│   ├── scoring/                # @adhd/scoring - Scoring algorithms
│   ├── ui/                     # @adhd/ui - UI components
│   └── utils/                  # @adhd/utils - Utility functions
│
├── tsconfig.base.json         # Base TypeScript config
├── package.json               # Root workspace config
└── docs/
    └── MONOREPO_SETUP.md      # This file

```

## Package Details

### @adhd/types
**Purpose**: Centralized type definitions shared across the application

**Location**: `packages/types/`

**Exports**:
```typescript
export * from './assessment';    // Assessment-related types
export * from './game';          // Game-related types
export * from './user';          // User types
```

**Usage**:
```typescript
import type { AssessmentResult, GameScore } from '@adhd/types';
```

---

### @adhd/constants
**Purpose**: Application-wide constants

**Location**: `packages/constants/`

**Exports**:
```typescript
export { ROUTES } from './routes';           // Route constants
export { ASSESSMENT_CONSTANTS } from './assessment';
export { MESSAGES } from './messages';
export { COLORS, SPACING } from './theme';
export { GAME_CONFIG } from './game-config';
```

**Usage**:
```typescript
import { ROUTES, MESSAGES, COLORS } from '@adhd/constants';
import { GAME_CONFIG } from '@adhd/constants/game';
```

---

### @adhd/config
**Purpose**: Configuration management and environment setup

**Location**: `packages/config/`

**Exports**:
```typescript
export { env } from './environment';              // Environment variables
export { supabaseConfig } from './supabase';     // Supabase config
```

**Usage**:
```typescript
import { env } from '@adhd/config';
import { supabaseConfig } from '@adhd/config/supabase';
```

---

### @adhd/questionnaire
**Purpose**: Assessment questions and questionnaire definitions

**Location**: `packages/questionnaire/`

**Exports**:
```typescript
export * from './instruments/dsm5';    // DSM-5 assessment
export * from './instruments/asrs';    // ASRS assessment
export * from './context';             // Context questions
export * from './followups';           // Follow-up questions
export * from './types';               // Questionnaire types
```

**Usage**:
```typescript
import { DSM5_QUESTIONS } from '@adhd/questionnaire/dsm5';
import { ASRS_QUESTIONS } from '@adhd/questionnaire/asrs';
import type { DSM5Question } from '@adhd/questionnaire';
```

---

### @adhd/scoring
**Purpose**: Scoring algorithms and logic for assessments

**Location**: `packages/scoring/`

**Exports**:
```typescript
export * from './dsm5-scoring';   // DSM-5 scoring
export * from './asrs-scoring';   // ASRS scoring
export * from './game-scoring';   // Game scoring
```

**Usage**:
```typescript
import { calculateDomainScore } from '@adhd/scoring/dsm5';
import { calculateASRSScore } from '@adhd/scoring/asrs';
```

---

### @adhd/ui
**Purpose**: Reusable React UI components

**Location**: `packages/ui/`

**Contains**:
- Button, Card, Modal
- Assessment components (QuestionCard, LikertScale, etc)
- Game components (GoNoGoGame, etc)
- Landing components

**Usage**:
```typescript
import { Button, Card } from '@adhd/ui';
import { QuestionCard } from '@adhd/ui/assessment';
```

---

### @adhd/utils
**Purpose**: Utility functions for string, validation, formatting

**Location**: `packages/utils/`

**Exports**:
```typescript
export * from './string';        // String utilities
export * from './validation';    // Validation functions
export * from './formatting';    // Formatting utilities
```

**Usage**:
```typescript
import { slugify, capitalize } from '@adhd/utils/string';
import { validateEmail } from '@adhd/utils/validation';
```

---

### @adhd/web
**Purpose**: Next.js web application that uses all packages

**Location**: `apps/web/`

**Structure**:
```
apps/web/
├── src/
│   ├── app/           # Next.js routes
│   ├── components/    # App-specific components
│   ├── hooks/         # Custom hooks
│   ├── middleware.ts
│   └── globals.css
├── public/
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Development Workflow

### Getting Started

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   This starts the Next.js dev server for the web app.

3. **Build all packages**:
   ```bash
   npm run build
   ```

### Working with Packages

#### Create a new file in a package

1. Add the file in `packages/{package-name}/src/`
2. Export from the package's `index.ts`
3. Use from the web app:
   ```typescript
   import { myFunction } from '@adhd/package-name';
   ```

#### Modify a package's TypeScript config

Each package has its own `tsconfig.json` that extends `tsconfig.base.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

#### Add a dependency to a package

```bash
npm install @new-package --workspace=packages/my-package
```

Or manually add to the package's `package.json` and run `npm install`.

### Building and Deployment

**Build the entire monorepo**:
```bash
npm run build
```

**Build only the web app**:
```bash
npm run build:web
```

**Type check all packages**:
```bash
npm run type-check
```

**Lint all packages**:
```bash
npm run lint
```

## Import Patterns

### From Web App

**Import from monorepo packages**:
```typescript
// Types
import type { AssessmentResult } from '@adhd/types';

// Constants
import { ROUTES, MESSAGES } from '@adhd/constants';

// Config
import { env } from '@adhd/config';

// Questionnaire
import { DSM5_QUESTIONS } from '@adhd/questionnaire/dsm5';

// Scoring
import { calculateDomainScore } from '@adhd/scoring/dsm5';

// UI Components
import { Button, Card } from '@adhd/ui';

// Utils
import { slugify } from '@adhd/utils/string';
```

**Import from local app code**:
```typescript
// Relative imports for local components
import MyComponent from './components/MyComponent';

// Use @ alias for app-specific code
import MyHook from '@/hooks/useMyHook';
```

### From Other Packages

**Within a package**:
```typescript
// Relative imports
import { helper } from '../utils';

// Monorepo packages
import type { MyType } from '@adhd/types';
import { CONSTANT } from '@adhd/constants';
```

## Package Dependencies

### Dependency Graph

```
@adhd/web (Next.js app)
├── @adhd/config
├── @adhd/constants
├── @adhd/types
├── @adhd/questionnaire
├── @adhd/scoring
├── @adhd/ui
└── @adhd/utils

@adhd/questionnaire
└── @adhd/types

@adhd/scoring
├── @adhd/types
└── @adhd/questionnaire

@adhd/ui
├── @adhd/types
├── @adhd/constants
└── framer-motion, lucide-react

@adhd/utils
└── (no monorepo deps)

@adhd/constants
└── (no monorepo deps)

@adhd/config
└── (no monorepo deps)

@adhd/types
└── (no monorepo deps)
```

### Key Rules

1. **Core packages** (@adhd/types, @adhd/constants, @adhd/config, @adhd/utils) **do not depend on other monorepo packages**
2. **Feature packages** (@adhd/questionnaire, @adhd/scoring) can depend on core packages
3. **UI package** can depend on types and constants but not feature packages
4. **Web app** can depend on everything

This creates a clear dependency hierarchy and prevents circular dependencies.

## Migrating Code from Old Structure

### Before (Single App)
```typescript
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';
import { calculateScore } from '@/lib/scoring';
```

### After (Monorepo)
```typescript
import { Button } from '@adhd/ui';
import { ROUTES } from '@adhd/constants';
import { calculateScore } from '@adhd/scoring';
```

## Building Individual Packages

Each package can be built independently:

```bash
# Build types package
cd packages/types && npm run build

# Build scoring package
cd packages/scoring && npm run build
```

Outputs go to `packages/{name}/dist/`.

## TypeScript Configuration

### Root (tsconfig.base.json)
Base configuration extended by all packages:
- Common compiler options
- Path mappings for all monorepo packages
- Strict mode enabled

### Web App (apps/web/tsconfig.json)
Extends tsconfig.base.json with Next.js plugin

### Packages (packages/{name}/tsconfig.json)
Extends tsconfig.base.json with:
- Output directory: `dist/`
- Root directory: `src/`
- No JSX (unless UI package)

## Troubleshooting

### "Cannot find module '@adhd/package'"

1. Check the package is exported in `packages/{name}/src/index.ts`
2. Run `npm install` from the root
3. Verify TypeScript paths are set in `tsconfig.base.json`

### Changes in packages aren't reflected in web app

1. Package needs to be built: `npm run build` from root
2. Or build specific package: `cd packages/package && npm run build`
3. Clear Next.js cache: `rm -rf apps/web/.next`

### Circular dependency error

Check the dependency graph above. Ensure:
- Core packages don't import from other packages
- UI doesn't import from feature packages
- Only web app imports across all packages

### Type errors with workspace packages

1. Run `npm run type-check` to check all packages
2. Ensure TypeScript version matches across all packages
3. Check `tsconfig.json` path mappings

## Next Steps

1. **Publish packages** - These packages can be published to npm when ready
2. **Add shared configs** - Move ESLint and Prettier configs to root
3. **Add shared testing** - Setup Jest/Vitest at root
4. **CI/CD integration** - Deploy web app, optionally publish packages
5. **Documentation** - Create package-specific README files

## References

- [npm workspaces documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [TypeScript path mapping](https://www.typescriptlang.org/tsconfig#paths)
- [Monorepo best practices](https://monorepo.tools/)
