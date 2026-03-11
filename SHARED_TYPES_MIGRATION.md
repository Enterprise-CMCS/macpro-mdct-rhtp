# Shared Types Migration Guide

## Overview

This project now uses a centralized shared types package located at `services/shared` to eliminate duplication and drift between frontend and backend type definitions.

## What Changed

### 1. New Package Structure
- **Location**: `services/shared/`
- **Package name**: `@rhtp/shared`
- **Exports**: Common types used by both UI and API

### 2. Workspace Configuration
The root `package.json` now includes workspace configuration:
```json
"workspaces": [
  "services/shared",
  "services/app-api",
  "services/ui-src"
]
```

### 3. Updated Dependencies
Both `app-api` and `ui-src` now depend on `@rhtp/shared`:
```json
"dependencies": {
  "@rhtp/shared": "workspace:*",
  ...
}
```

## How to Use

### Importing Shared Types

**Before:**
```typescript
// In app-api
import { Report, ReportType } from "../types/reports";

// In ui-src
import { Report, ReportType } from "./types/reports";
```

**After:**
```typescript
// In both app-api and ui-src
import { Report, ReportType } from "@rhtp/shared";
```

### What's in the Shared Package?

✅ **Shared types** (in `services/shared/src/types/reports.ts`):
- `Report`, `ReportBase`, `LiteReport`
- `ReportType`, `RhtpSubType`, `ReportStatus`, `PageStatus`
- `AlertTypes` (used across boundaries)
- All page template types: `FormPageTemplate`, `ReviewSubmitTemplate`, etc.
- All element types: `TextboxTemplate`, `RadioTemplate`, etc.
- Enums: `ElementType`, `PageType`, `HeaderIcon`
- Utility types: `ChoiceTemplate`, `HideCondition`, `UploadData`

### What Stays in Local Type Files?

#### Backend (`services/app-api/types/reports.ts`):
- Backend-specific extensions (e.g., `CreateReportOptions` with server-side logic)
- API handler-specific types
- DynamoDB-specific types

#### Frontend (`services/ui-src/src/types/reports.ts`):
- React component-specific types
- UI helper functions (e.g., `getReportName`)
- Type guards (e.g., `isReviewSubmitPage`, `isFormPageTemplate`)
- Frontend-only utilities (e.g., `assertExhaustive`, `PageData`)

## Setup Instructions

### 1. Install Dependencies
```bash
# From project root
yarn install
```

This will:
- Link the shared package to both app-api and ui-src
- Install all dependencies across workspaces

### 2. Build the Shared Package
```bash
cd services/shared
yarn build
```

Or use watch mode during development:
```bash
cd services/shared
yarn watch
```

### 3. Verify Everything Works
```bash
# Test backend
cd services/app-api
yarn test

# Test frontend
cd services/ui-src
yarn test
```

## Development Workflow

### Adding New Shared Types

1. **Determine if it should be shared**: Ask yourself:
   - Does this type cross the API boundary?
   - Is it used by both frontend and backend?
   - Is it a core domain type?

2. **Add to shared package**:
   ```typescript
   // services/shared/src/types/reports.ts
   export interface NewSharedType {
     // ...
   }
   ```

3. **Export from index**:
   ```typescript
   // services/shared/src/index.ts
   export * from "./types/reports.js";
   ```

4. **Build the package**:
   ```bash
   cd services/shared
   yarn build
   ```

5. **Use in both projects**:
   ```typescript
   import { NewSharedType } from "@rhtp/shared";
   ```

### When to Keep Types Separate

Keep types in their respective packages when they:
- Are environment-specific (browser APIs, AWS SDK types)
- Contain side effects (React hooks, API clients)
- Are only used internally
- Have different dependencies

## Benefits

✅ **Single source of truth**: Change once, use everywhere
✅ **Type safety**: Compile-time errors if frontend/backend drift
✅ **Better refactoring**: IDE can find all usages across projects
✅ **Clearer boundaries**: Explicit shared vs. private types
✅ **Easier onboarding**: Clear package structure

## Troubleshooting

### TypeScript Can't Find `@rhtp/shared`

**Solution**: Make sure you've run `yarn install` and built the shared package:
```bash
yarn install
cd services/shared
yarn build
```

### Changes in Shared Package Not Reflected

**Solution**: Rebuild the shared package:
```bash
cd services/shared
yarn build
```

Or use watch mode:
```bash
cd services/shared
yarn watch
```

### Build Errors in CDK/Lambda

**Solution**: The Lambda bundler (esbuild) needs to resolve the workspace dependency. This is already configured in your CDK setup using `nodeModules` in the Lambda construct.

## Next Steps

Consider moving these additional shared items:

1. **Constants**: State abbreviations, API endpoints
2. **Validation schemas**: If using Yup/Zod on both sides
3. **Utility functions**: Date formatting, string manipulation (pure functions only)
4. **Error types**: Standard error codes/messages

## Questions?

Check the README in `services/shared/README.md` for more details on what belongs in the shared package.
