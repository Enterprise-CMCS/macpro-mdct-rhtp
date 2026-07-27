---
name: playwright-e2e-testing
description: "Global guidance for writing and maintaining Playwright e2e tests. Use for new tests, page objects, fixtures, flaky test debugging, auth state setup, and playwright.config.ts tuning across repositories."
argument-hint: "Describe what you want to test or the Playwright problem you're facing"
---

# Playwright E2E Testing

## When to Use

- Writing new `.spec.ts` e2e tests
- Maintaining existing e2e tests (refactors, stability, readability)
- Adding or extending page object classes
- Debugging test failures, collection errors, or webServer startup failures
- Configuring `playwright.config.ts` (projects, timeouts, webServer, reporters)
- Setting up or extending custom fixtures
- Working with saved auth state (`.auth/`)
- Accessibility (a11y) assertions in Playwright

## Scope Guardrails (Global)

- Prefer repository-agnostic guidance unless local conventions are confirmed from files.
- Keep recommendations portable across repositories and tech stacks unless local constraints are verified.
- Do not invent folder paths, fixture names, scripts, or auth file names.
- Treat repository examples as optional adapters, not global requirements.
- If repo conventions are unknown, use Playwright defaults and state assumptions explicitly.

## Agent Execution Protocol

1. Restate the target behavior in one sentence before editing.
2. Identify whether existing fixtures and page objects can be reused.
3. Make the smallest code change that satisfies the behavior.
4. Validate with the narrowest Playwright command first (single spec or grep).
5. If validation fails, classify as locator, timing, auth, or environment and apply the matching fix path.
6. Report files changed, validation command run, and remaining risks.

### Key Patterns

**Importing test:** If a custom fixture module exists, import from it. Otherwise import from `@playwright/test`.

```ts
import { test, expect } from "<fixture-module-or-@playwright/test>";
```

**Page Object Model:** Extend `BasePage`. Keep selectors and interactions in page objects, assertions in spec files.

```ts
import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class MyPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
}
```

**Timeouts:** Prefer named timeout constants in a shared module. Avoid hardcoded millisecond literals.

```ts
import {
  TIMEOUT_LOADING,
  TIMEOUT_UI,
  TIMEOUT_NAVIGATION,
} from "<timeouts-module>";
```

**Fixtures:** Use domain fixtures when they exist; otherwise use the default `page` and `context` fixtures.

**Auth:** Persist auth state in JSON files and generate them with a dedicated setup project when needed.

**Locators:** Prefer role-based locators (`getByRole`, `getByLabel`) over CSS/XPath. Scope to a container when possible (e.g., `modal.getByRole(...)`).

**Loading waits:** Call `waitForLoadingComplete()` from `BasePage` after navigation to wait for spinners to clear. Use `waitFor({ state: 'hidden' })` over `waitForTimeout`.

**e2e test location:** Keep e2e tests in a dedicated top-level test area (for example `tests/`).

## Implementation Playbooks

### New test

1. Start from existing custom fixtures import.
2. Reuse an existing page object; only add methods/selectors that represent user actions.
3. Keep assertions in spec files and focused on user-visible outcomes.
4. Add a11y assertions when meaningful to the flow.

### Test maintenance

1. Preserve behavior while improving clarity, resiliency, and selector quality.
2. Prefer page object and fixture reuse before introducing new abstractions.
3. Remove brittle waits/selectors and replace with semantic assertions and waits.
4. Re-run the narrowest relevant spec to confirm no behavior regression.

### Flaky test

1. Replace brittle selectors with role/label locators scoped to stable containers.
2. Remove fixed sleeps and use semantic waits (`toBeVisible`, `toBeHidden`, loading completion).
3. Assert intermediate UI states only when they are user-observable and deterministic.

### Locator hardening

1. Prefer `getByRole` with accessible name.
2. Then prefer `getByLabel`, `getByPlaceholder`, or `getByText` when role is not available.
3. Use `locator()` CSS only as a last resort and document why in code comments.

### Auth or setup issue

1. Confirm setup project generated `.auth/*.json`.
2. Re-run setup project or remove stale auth files and regenerate.
3. Verify project dependencies (`setup` then browser project) in config.

### Config or environment issue

1. Verify Node version (`nvm use`) and local server command.
2. Check `baseURL`, `webServer`, and project dependencies.
3. Reproduce with a single project run before broad retries.

## playwright.config.ts Baseline

- Prefer explicit `baseURL`, `expect.timeout`, and `test.timeout`.
- Use retries intentionally (`0` for deterministic local debugging, `>0` for CI stabilization when justified).
- Configure trace and screenshots on failure first; increase capture only during active debugging.
- Use project dependencies when auth/setup must run before browser projects.
- Keep worker count aligned with app and environment stability.

## Common Failure Modes & Fixes

### webServer fails to start (exit code 1)

1. Verify runtime version and dependency install state.
2. Run the webServer command outside Playwright once to confirm startup.
3. Check for port collisions, env var gaps, and startup timeout settings.

### Collection error: "did not expect test() to be called here"

Usually caused by mixed imports, duplicate versions, or unsupported config execution context. Fix:

```bash
rm -rf node_modules
<package-manager-install>
```

Then verify every test imports `test` from one source only.

### Flaky modal assertions

Use `expect(modal).toBeHidden()` with named UI timeout constants rather than fixed waits. Scope locators to the dialog.

### Auth state missing / login loops

Re-run the setup/auth project, clear stale auth JSON, and regenerate with the intended user role.

## Project Adapter (Optional, Repo-Specific)

Use this section to inject local conventions without polluting global guidance.

Fill in only what is true for the current repository:

- Test root: `<tests-root>`
- Fixture import path: `<fixtures-import-path>`
- Page object root: `<page-object-root>`
- Timeout constants module: `<timeouts-module>`
- Auth state directory: `<auth-state-dir>`
- Setup project name and dependency chain: `<setup-project-details>`
- Narrow validation command: `<single-spec-command>`
- Local webServer command: `<local-webserver-command>`

If these values are missing, the agent should proceed with generic Playwright defaults and state assumptions.

## Done Criteria

- Test file is in the repository's e2e test location and imports from the correct fixture source.
- No `waitForTimeout` calls or hardcoded timeout milliseconds.
- Locators are role/label-first and scoped when needed.
- Assertions verify user-visible behavior (not internal implementation details only).
- Smallest relevant Playwright command was run and result was reported.

## Response Contract for Agents

When finishing a Playwright task, include:

1. Behavior covered or bug fixed.
2. Files changed and why each was changed.
3. Validation command(s) executed.
4. Remaining risks, assumptions, or follow-up actions.

## Prompt Pattern for Best Results

Use this structure when invoking the skill:

- Flow/page under test
- Expected behavior
- Existing failure or gap
- Scope constraints (reuse fixtures/page objects, no hard waits)
- Optional repo adapter values (paths, scripts, fixture names)

Example:
"Create or update a Playwright test for report modal close behavior. Reuse existing fixtures and page objects, keep assertions in the spec, avoid hard waits, and validate with the narrowest spec run first. Local adapter: fixture import is <fixtures-import-path>, command is <single-spec-command>."

## Portability Self-Check

Before finalizing skill edits, verify:

1. Could this guidance work in a different repository with different fixture names?
2. Are repo-specific scripts/paths isolated to Project Adapter only?
3. Are assumptions called out when local conventions are unknown?
