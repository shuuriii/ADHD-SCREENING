# ADHD Screening PWA - Folder Structure Guide

## Overview

This document outlines the reorganized folder structure of the ADHD Screening PWA application, following Next.js 16+ best practices for scalable applications.

## Directory Structure

```
ADHD-SCREENING/
├── src/
│   ├── app/                    # Next.js App Router (routes & pages)
│   ├── components/             # React components (feature-organized)
│   ├── lib/                    # Utilities & business logic
│   ├── contexts/               # React Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── questionnaire/          # Assessment data & questions
│   ├── types/                  # Global type definitions
│   ├── constants/              # Application constants
│   ├── config/                 # Configuration files
│   ├── middleware.ts           # Next.js middleware
│   └── globals.css             # Global styles
│
├── public/                     # Static assets
│   ├── icons/                  # PWA app icons
│   ├── images/                 # Static images
│   ├── sounds/                 # Audio files
│   ├── service-workers/        # Service worker files
│   └── manifest.json           # PWA manifest
│
├── tests/                      # Test files (unit, integration, e2e)
├── docs/                       # Project documentation
├── .env.example                # Environment variables template
└── [config files]              # tsconfig, next.config, etc.
```

## Directory Purposes

### `src/app/` - Routes & Pages
**Location**: `/src/app/`

Next.js App Router pages. Organize by feature area:
- `page.tsx` - Landing page
- `layout.tsx` - Root layout with global providers
- `error.tsx` - Error boundary
- `assessment/` - Assessment pages (questionnaire, games, results)
- `auth/` - Authentication routes
- `api/` - API routes (server-side operations)

### `src/components/` - UI Components
**Location**: `/src/components/`

React components organized by feature and reusability:

#### `ui/` - Reusable UI Components
Generic components used across the app:
- `Button.tsx` - Button component
- `Card.tsx` - Card container
- `Header.tsx` - Page header
- `QuitModal.tsx` - Modal dialogs
- `ErrorBoundary.tsx` - Error handling
- `SoundToggle.tsx` - Sound control

#### `assessment/` - Assessment Features
Assessment-specific components:
- `QuestionCard.tsx` - Question display
- `LikertScale.tsx` - Rating scale
- `ProgressBar.tsx` - Progress indicator
- `AssessmentGuard.tsx` - Navigation guard
- `SafeLink.tsx` - Safe link wrapper

#### `game/` - Game Components
Game-specific implementations:
- `GoNoGoGame.tsx`
- `ChronosSortGame.tsx`
- `FocusQuestGame.tsx`

#### `landing/` - Landing Page
Landing page specific components:
- `HeroSection.tsx`
- `ValueProposition.tsx`
- `GamesSection.tsx`

#### `report/` - Report Generation
PDF report components:
- `PDFDownloadButton.tsx`
- `ASRSPDFDownloadButton.tsx`
- `CombinedPDFDownloadButton.tsx`

#### `results/` - Results Display
Results page components:
- `DSM5Criteria.tsx`
- `ScoreSummary.tsx`
- `Recommendations.tsx`

### `src/lib/` - Utilities & Business Logic
**Location**: `/src/lib/`

Organized by feature and purpose:

#### `supabase/` - Database Operations
Database client and query functions:
- `client.ts` - Browser client
- `server.ts` - Server client
- `auth.ts` - Authentication queries
- `profiles.ts` - User profile operations
- `questionnaire-results.ts` - Assessment data queries
- `game-scores.ts` - Game score operations

#### `audio/` - Audio Management
Sound/audio utilities:
- `soundManager.ts` - Sound management
- `types.ts` - Audio type definitions

#### `scoring/` - Assessment Scoring
Scoring logic (being refactored):
- Exports from questionnaire/ for now
- TODO: Move DSM-5, ASRS scoring here

#### `utils/` - General Utilities
Generic utility functions:
- `string.ts` - String operations
- `number.ts` - Number operations
- `validation.ts` - Input validation
- `formatting.ts` - Data formatting

#### `pwa/` - PWA Utilities
PWA-specific functionality (placeholder):
- Service worker registration
- Install prompt detection
- Manifest helpers

#### `api/` - API Client Utilities
API request utilities (placeholder):
- Fetch/axios wrapper
- Error handling
- Request interceptors

### `src/contexts/` - React Contexts
**Location**: `/src/contexts/`

Global state management with Context API:
- `AssessmentContext.tsx` - Assessment state
- `SoundContext.tsx` - Sound/audio state

**Example Usage**:
```typescript
import { AssessmentProvider } from '@/contexts';
```

### `src/hooks/` - Custom Hooks
**Location**: `/src/hooks/`

Custom React hooks:
- `useSound.ts` - Sound management
- `useAssessment.ts` - Assessment state (planned)
- `useAuth.ts` - Authentication (planned)

**Example Usage**:
```typescript
import { useSound } from '@/hooks';
```

### `src/questionnaire/` - Assessment Data
**Location**: `/src/questionnaire/`

Assessment questions and definitions:
- `instruments/dsm5/` - DSM-5 assessment
- `instruments/asrs/` - ASRS assessment
- `context/` - Context questions
- `followups/` - Follow-up questions by demographic
- `types.ts` - Type definitions
- `scoring.ts` - Scoring logic

### `src/types/` - Global Types
**Location**: `/src/types/`

Centralized type definitions:
- Re-exports from questionnaire/ for now
- Central location for new type definitions

**Example Usage**:
```typescript
import type { AssessmentResult, GameScore } from '@/types';
```

### `src/constants/` - Application Constants
**Location**: `/src/constants/`

Centralized constants (strings, numbers, configurations):

#### `routes.ts` - Route Constants
Type-safe route paths:
```typescript
import { ROUTES } from '@/constants';
// ROUTES.ASSESSMENT, ROUTES.QUESTIONNAIRE, etc.
```

#### `assessment.ts` - Assessment Constants
Question counts, thresholds, severity levels

#### `theme.ts` - Design Tokens
Colors, spacing, typography, transitions

#### `messages.ts` - UI Messages
User-facing strings, error messages

#### `game-config.ts` - Game Configuration
Game timing, difficulty, scoring multipliers

### `src/config/` - Configuration Files
**Location**: `/src/config/`

Application configuration with environment variables:

#### `environment.ts` - Environment Setup
Environment variable validation and access:
```typescript
import { env } from '@/config';
// env.supabaseUrl, env.isDev, etc.
```

#### `supabase.ts` - Supabase Config
Supabase client configuration

#### `analytics.ts` - Analytics Setup
Google Analytics, Sentry, or other services

### `public/` - Static Assets
**Location**: `/public/`

Static files served by Next.js:
- `manifest.json` - PWA manifest
- `icons/` - App icons (192px, 512px, Apple touch icon)
- `images/` - Static images
- `sounds/` - Audio files
- `service-workers/` - Service worker files

### `docs/` - Documentation
**Location**: `/docs/`

Project documentation:
- `FOLDER_STRUCTURE.md` - This file
- `ARCHITECTURE.md` - Architecture overview
- `DEVELOPMENT.md` - Development guide
- `DEPLOYMENT.md` - Deployment instructions

## Import Patterns

### Before Reorganization
```typescript
import { soundManager } from '@/lib/audio';
import type { AssessmentResult } from '@/questionnaire/types';
import { calculateDomainScore } from '@/questionnaire/scoring';
```

### After Reorganization
```typescript
import { soundManager } from '@/lib/audio';
import type { AssessmentResult } from '@/types';
import { calculateDomainScore } from '@/lib/scoring';
import { ROUTES, ASSESSMENT_CONSTANTS } from '@/constants';
import { env } from '@/config';
```

## Adding New Features

### Adding a New Component

1. Create in appropriate `components/` subdirectory
2. Update the feature's `index.ts` barrel export
3. Import via barrel export:
   ```typescript
   import { MyComponent } from '@/components/feature';
   ```

### Adding Utility Functions

1. Create in `lib/utils/` or appropriate lib subdirectory
2. Update the subdirectory's `index.ts`
3. Export via `@/lib/utils`

### Adding Constants

1. Add to appropriate file in `constants/`
2. Use via `@/constants`:
   ```typescript
   import { ROUTES, MESSAGES } from '@/constants';
   ```

### Adding Types

1. Add to `src/types/index.ts` or questionnaire/types.ts
2. Import via `@/types`:
   ```typescript
   import type { MyType } from '@/types';
   ```

## Configuration Files (Root Level)

Key configuration files at project root:
- `tsconfig.json` - TypeScript config with path mappings
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS config
- `postcss.config.mjs` - PostCSS config
- `eslint.config.mjs` - ESLint rules
- `.env.example` - Environment variables template
- `.env.local` - Local environment (git ignored)

## Environment Variables

**Template** (`.env.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

**Local** (`.env.local`, git ignored):
```env
# Copy from .env.example and fill in your values
```

## Tips for Maintaining Structure

1. **Use Barrel Exports**: Import from feature `index.ts` for cleaner code
2. **Co-locate Related Code**: Keep components with their helpers
3. **Avoid Deep Nesting**: 2-3 levels deep is usually enough
4. **Follow Naming**: Use kebab-case for files, PascalCase for components
5. **Centralize Constants**: Add to `constants/` instead of hardcoding
6. **Type Everything**: Use `src/types/` for shared types
7. **Organize by Feature**: Not by type (components, utils, etc.)

## File Naming Conventions

- **Components**: PascalCase (e.g., `QuestionCard.tsx`)
- **Utilities**: camelCase (e.g., `calculateScore.ts`)
- **Config**: camelCase (e.g., `supabase.ts`)
- **Types**: camelCase (e.g., `assessment.ts`)
- **Directories**: kebab-case (e.g., `game-scores/`)

## Next Steps

- [ ] Move scoring functions from `questionnaire/` to `lib/scoring/`
- [ ] Organize questionnaire by instrument type
- [ ] Add tests structure with mirrored directories
- [ ] Add service worker and PWA manifest setup
- [ ] Create API routes for backend operations
- [ ] Add integration tests
- [ ] Document API endpoints
