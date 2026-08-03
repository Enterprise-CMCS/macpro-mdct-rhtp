import { expect } from "@playwright/test";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import { TIMEOUT_UI } from "./timeouts";

type VisibilityState = "visible" | "hidden";

type SectionShellOptions = {
  sectionId: string;
  heading?: string | RegExp;
  previousButtonVisibility?: VisibilityState;
  continueButtonVisibility?: VisibilityState;
};

/**
 * Verify that a field identified by label is disabled (read-only enforcement).
 */
export async function verifyFieldIsReadOnly(
  editor: ReportEditorPage,
  label: string | RegExp
): Promise<void> {
  await expect(editor.getTextField(label)).toBeDisabled();
}

/**
 * Verify that a field's current value matches the expected value.
 * Use after navigating back to the page to confirm persistence.
 */
export async function verifyFieldValue(
  editor: ReportEditorPage,
  label: string | RegExp,
  expectedValue: string
): Promise<void> {
  await expect(editor.getTextField(label)).toHaveValue(expectedValue);
}

/**
 * Verify the current section id from the route.
 */
export async function verifyCurrentSection(
  editor: ReportEditorPage,
  expectedSectionId: string
): Promise<void> {
  await expect(editor.page).toHaveURL(
    new RegExp(`/report/[^/]+/[^/]+/[^/]+/${expectedSectionId}(\\?.*)?$`)
  );
}

export async function verifySectionShell(
  editor: ReportEditorPage,
  options: SectionShellOptions
): Promise<void> {
  await verifyCurrentSection(editor, options.sectionId);

  if (options.heading) {
    await expect(
      editor.page.getByRole("heading", { name: options.heading })
    ).toBeVisible();
  }

  if (options.previousButtonVisibility === "visible") {
    await expect(editor.previousButton).toBeVisible();
  }

  if (options.previousButtonVisibility === "hidden") {
    await expect(editor.previousButton).toBeHidden();
  }

  if (options.continueButtonVisibility === "visible") {
    await expect(editor.continueButton).toBeVisible();
  }

  if (options.continueButtonVisibility === "hidden") {
    await expect(editor.continueButton).toBeHidden();
  }
}

export const skipIfUnavailable = async (
  check: () => Promise<boolean>,
  onSkip: (reason: string) => void,
  reason: string,
  timeoutMs = TIMEOUT_UI
): Promise<boolean> => {
  // Polls briefly so post-navigation renders don't cause spurious skips.
  const available = await expect
    .poll(() => check().catch(() => false), { timeout: timeoutMs })
    .toBeTruthy()
    .then(() => true)
    .catch(() => false);

  if (!available) {
    onSkip(reason);
    return true;
  }

  return false;
};
