# @rhtp/shared

Shared types and utilities for MDCT-RHTP frontend and backend.

## Purpose

This package contains type definitions and utility functions that are used by both:
- `services/app-api` (backend API)
- `services/ui-src` (frontend React app)

By centralizing shared code here, we ensure consistency across the application and eliminate drift between frontend and backend type definitions.

## Usage

### In app-api (backend):
```typescript
import { Report, ReportType, ReportStatus } from "@rhtp/shared";
```

### In ui-src (frontend):
```typescript
import { Report, ReportType, ReportStatus } from "@rhtp/shared";
```

## Development

```bash
# Build the package
cd services/shared
yarn build

# Watch for changes (useful during development)
yarn watch
```

## What Goes Here?

✅ **Include:**
- Types that cross the API boundary (request/response types)
- Enums used by both frontend and backend
- Shared constants
- Utility functions used by both
- Type guards that work on both sides

❌ **Don't Include:**
- Frontend-specific types (React components, UI state)
- Backend-specific types (AWS SDK types, database clients)
- Side-effect producing code (API calls, DOM manipulation)
- Environment-specific logic
