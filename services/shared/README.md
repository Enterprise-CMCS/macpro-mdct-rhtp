# @rhtp/shared

Shared types and utilities for MDCT-RHTP frontend and backend.

## Purpose

This package contains type definitions and utility functions that are used by both:

- `services/app-api` (backend API)
- `services/ui-src` (frontend React app)

By centralizing shared code here, we ensure consistency across the application and eliminate drift between frontend and backend type definitions.

## Usage

### In app-api (backend) and ui-src (frontend):

```typescript
import { Report, ReportType, ReportStatus } from "@rhtp/shared";
```

or import from the previous locations of the types files, as we are exporting the shared types there.

## Development

```bash
./run local
```

is running this under the hood to build and watch the types package:

```bash
yarn watch
```

## Troubleshooting

Make sure you've run `yarn install` and built the shared package:

```bash
yarn install
cd services/shared
yarn build
```

In Vs Code Command Pallette run:
`>TypeScript: Restart TS Server`
and/or
`Developer: Reload Window`
