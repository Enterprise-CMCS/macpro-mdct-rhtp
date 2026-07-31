import { expect } from "@playwright/test";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";

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
