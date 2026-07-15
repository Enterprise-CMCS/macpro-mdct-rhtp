import { expect, Locator } from "@playwright/test";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";

const verifyButtonVisibleAndEnabled = async (
  button: Locator
): Promise<void> => {
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
};

/**
 * Verify that a field identified by label is enabled and interactive.
 */
export async function verifyFieldIsEditable(
  editor: ReportEditorPage,
  label: string | RegExp
): Promise<void> {
  await expect(editor.getFieldByLabel(label)).not.toBeDisabled();
}

/**
 * Verify that a field identified by label is disabled (read-only enforcement).
 */
export async function verifyFieldIsReadOnly(
  editor: ReportEditorPage,
  label: string | RegExp
): Promise<void> {
  await expect(editor.getFieldByLabel(label)).toBeDisabled();
}

/**
 * Verify that a field's current value matches the expected value.
 * Use after navigating back to the page to confirm persistence.
 */
export async function verifyFieldValuePersisted(
  editor: ReportEditorPage,
  label: string | RegExp,
  expectedValue: string
): Promise<void> {
  await expect(editor.getFieldByLabel(label)).toHaveValue(expectedValue);
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

/**
 * Verify the Continue button is visible and actionable.
 */
export async function verifyContinueVisible(
  editor: ReportEditorPage
): Promise<void> {
  await verifyButtonVisibleAndEnabled(editor.continueButton);
}

/**
 * Verify the Previous button is visible and actionable.
 */
export async function verifyPreviousVisible(
  editor: ReportEditorPage
): Promise<void> {
  await verifyButtonVisibleAndEnabled(editor.previousButton);
}
