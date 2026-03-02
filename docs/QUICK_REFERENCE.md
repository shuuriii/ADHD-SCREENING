# Quick Reference: Folder Structure & Imports

## New Directory Structure at a Glance

```
src/
├── app/                 # Routes (Next.js App Router)
├── components/          # React components (organized by feature)
├── lib/                 # Utilities & business logic
├── contexts/            # Global state (Context API)
├── hooks/               # Custom React hooks
├── questionnaire/       # Assessment questions & data
├── types/               # Type definitions
├── constants/           # Constants & config values
├── config/              # App configuration
├── middleware.ts        # Next.js middleware
└── globals.css          # Global styles
```

## Most Common Imports

### Components
```typescript
// Old way (still works)
import Button from '@/components/ui/Button';

// New way (cleaner)
import { Button } from '@/components/ui';

// Even cleaner (with main barrel)
import { Button } from '@/components';
```

### Types
```typescript
// Now centralized
import type { AssessmentResult, GameScore } from '@/types';
```

### Constants
```typescript
import {
  ROUTES,                    // Route paths
  ASSESSMENT_CONSTANTS,      // Assessment config
  MESSAGES,                  // UI messages
  COLORS,                    // Design tokens
  GAME_CONFIG,              // Game settings
} from '@/constants';

// Usage
const url = ROUTES.QUESTIONNAIRE;
const threshold = ASSESSMENT_CONSTANTS.CLINICAL_THRESHOLD;
const message = MESSAGES.COMPLETE_QUESTIONNAIRE;
```

### Configuration
```typescript
import { env } from '@/config';

// Usage
const apiUrl = env.supabaseUrl;
if (env.isDev) console.log('Debug mode');
```

### Library Functions
```typescript
// Audio
import { soundManager } from '@/lib/audio';
import { useSound } from '@/hooks';

// Database
import { getQuestionnaireResults } from '@/lib/supabase';

// Utilities
import { slugify, capitalize } from '@/lib/utils';

// Scoring (being refactored)
import { calculateDomainScore } from '@/lib/scoring';
```

### State Management
```typescript
import { AssessmentProvider, AssessmentContext } from '@/contexts';
import { useSound } from '@/hooks';
```

## File Organization by Type

### Adding a New Component

1. **Create in appropriate directory**:
   ```
   src/components/{feature}/{ComponentName}.tsx
   ```

2. **Update feature's index.ts**:
   ```typescript
   // src/components/assessment/index.ts
   export { default as MyComponent } from './MyComponent';
   ```

3. **Import from barrel**:
   ```typescript
   import { MyComponent } from '@/components/assessment';
   ```

### Adding a New Constant

1. **Add to appropriate file**:
   ```typescript
   // src/constants/assessment.ts
   export const MY_CONSTANT = 'value';
   ```

2. **Or create new file** if it doesn't fit existing ones

3. **Update constants/index.ts**:
   ```typescript
   export * from './my-constants';
   ```

4. **Import**:
   ```typescript
   import { MY_CONSTANT } from '@/constants';
   ```

### Adding a New Utility

1. **Create in lib subdirectory**:
   ```
   src/lib/{feature}/myUtility.ts
   ```

2. **Update lib/{feature}/index.ts**:
   ```typescript
   export { myUtility } from './myUtility';
   ```

3. **Import**:
   ```typescript
   import { myUtility } from '@/lib/{feature}';
   ```

### Adding a New Type

1. **Add to types/index.ts** or questionnaire/types.ts:
   ```typescript
   export interface MyType {
     field: string;
   }
   ```

2. **Import**:
   ```typescript
   import type { MyType } from '@/types';
   ```

## Environment Variables

**Template**: `.env.example`

**Local**: `.env.local` (git ignored)

**Access in code**:
```typescript
import { env } from '@/config';

env.supabaseUrl        // Public env
env.isDev              // NODE_ENV === 'development'
env.enableAnalytics    // NEXT_PUBLIC_ENABLE_ANALYTICS
```

## Component Best Practices

### Import Order
```typescript
// 1. React & Next.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party
import { motion } from 'framer-motion';

// 3. Local components
import { Button } from '@/components/ui';

// 4. Local utilities
import { soundManager } from '@/lib/audio';

// 5. Constants & types
import { ROUTES } from '@/constants';
import type { AssessmentResult } from '@/types';
```

### Default Exports vs Named Exports

- **Components**: Default export
  ```typescript
  // src/components/ui/Button.tsx
  export default function Button() { ... }
  ```

- **Utilities**: Named exports
  ```typescript
  // src/lib/utils/string.ts
  export function slugify() { ... }
  export function capitalize() { ... }
  ```

- **Types**: Named exports
  ```typescript
  // src/types/index.ts
  export type GameType = ...;
  export interface GameScore { ... }
  ```

## Troubleshooting

### Import not working?
1. Check if path alias is in `tsconfig.json`
2. Verify file exists in the location
3. Check if barrel export includes the item
4. Restart TypeScript server if needed

### Path too long?
Use barrel exports instead:
```typescript
// ❌ Too long
import Button from '@/components/ui/Button';

// ✅ Better
import { Button } from '@/components/ui';

// ✅ Even better (if used frequently)
import { Button } from '@/components';
```

### Circular imports?
Check for:
- Component importing from page that imports component
- Types importing from types that import back
- Context importing from hook that uses context

Solution: Move shared code to separate file

## File Naming

- **Components**: `PascalCase` → `QuestionCard.tsx`
- **Hooks**: `camelCase` → `useSound.ts`
- **Utils**: `camelCase` → `slugify.ts`
- **Constants**: `camelCase` → `routes.ts`
- **Directories**: `kebab-case` → `game-scores/`
- **Type files**: `camelCase` → `assessment.ts`

## Next Steps

- [ ] Update import statements in existing files to use new structure
- [ ] Move game scoring logic to `lib/scoring/game-scoring.ts`
- [ ] Organize questionnaire by instrument type
- [ ] Add unit tests with mirrored directory structure
- [ ] Document API endpoints in `docs/API.md`
- [ ] Create architecture guide in `docs/ARCHITECTURE.md`
