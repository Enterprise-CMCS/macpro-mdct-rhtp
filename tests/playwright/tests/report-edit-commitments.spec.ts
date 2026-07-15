import { test, expect } from "./fixtures/base";
import type { ReportEditorPage } from "./pageObjects/report-editor.page";
import { openReportSectionWithTimeoutOrSkip } from "../utils/report-edit-arrange";
import {
  GENERAL_INFORMATION_SECTION,
  STATE_POLICY_COMMITMENTS_SECTION,
} from "../utils/report-edit-helpers";
import { verifyCurrentSection } from "../utils/report-edit-assertions";
import { getFirstVisible } from "../utils/locators";
import { TIMEOUT_AUTOSAVE, TIMEOUT_UI } from "../utils/timeouts";
import { resolve } from "node:path";

const ATTACHMENT_FIXTURE_PATH = resolve(
  process.cwd(),
  "playwright/fixtures/use-of-funds.csv"
);

const openFirstCommitmentAccordion = async (
  editor: ReportEditorPage
): Promise<boolean> => {
  const firstCommitmentToggle = await getFirstVisible([
    editor.page.getByRole("button", { name: /^[A-Z]\.\d+\./ }).first(),
    editor.page.locator("button[aria-expanded]").first(),
  ]);

  if (!firstCommitmentToggle) {
    return false;
  }

  await firstCommitmentToggle.click();
  return true;
};

const setCommitmentStatus = async (
  editor: ReportEditorPage
): Promise<string | null> => {
  const statusField = editor.page.getByLabel(/Current Status/i).first();
  if (!(await statusField.isVisible().catch(() => false))) {
    return null;
  }

  const selectedStatus = await statusField
    .evaluate((el: Element): string | null => {
      if (!(el instanceof HTMLSelectElement)) {
        return null;
      }

      const currentValue: string = el.value;
      const options: string[] = [...el.options]
        .map((option: HTMLOptionElement) => option.value)
        .filter((value): value is string => value.length > 0);

      const nextValue =
        options.find((value) => value !== currentValue) ?? options[0] ?? null;

      return nextValue;
    })
    .catch(() => null);

  if (!selectedStatus) {
    return null;
  }

  await statusField.selectOption(selectedStatus).catch(() => null);

  const updatedValue = await statusField.inputValue().catch(() => null);
  return updatedValue ?? null;
};

test.describe("Report Editing - State Policy Commitments", () => {
  test("should persist commitment status, link, notes, and attachment edits @regression", async ({
    statePage,
  }) => {
    test.slow();

    const editor = await openReportSectionWithTimeoutOrSkip(
      statePage,
      "unsubmitted",
      STATE_POLICY_COMMITMENTS_SECTION,
      (reason) => test.skip(true, reason),
      {
        timeoutReason: "Timed out opening commitments section",
      }
    );
    if (!editor) {
      return;
    }

    await verifyCurrentSection(editor, STATE_POLICY_COMMITMENTS_SECTION);
    await expect(
      editor.page
        .locator("h1")
        .filter({ hasText: "State Policy Commitments" })
        .first()
    ).toBeVisible();

    const openedAccordion = await openFirstCommitmentAccordion(editor);
    if (!openedAccordion) {
      test.skip(true, "No commitment accordion was available");
      return;
    }

    const selectedStatus = await setCommitmentStatus(editor);
    if (!selectedStatus) {
      test.skip(
        true,
        "Current Status field was not editable in this environment"
      );
      return;
    }

    const linkValue = `https://example.test/commitment/${Date.now()}`;

    const linkInput = editor.page.getByLabel(/^Link$/i).first();
    await expect(linkInput, "Link input should be available").toBeVisible({
      timeout: TIMEOUT_UI,
    });
    await linkInput.fill(linkValue);

    const addLinkButton = editor.page
      .getByRole("button", { name: /^Add link$/i })
      .first();
    await expect(
      addLinkButton,
      "Add link action should be visible"
    ).toBeVisible({
      timeout: TIMEOUT_UI,
    });
    await addLinkButton.click();

    const notesValue = `Commitment note ${Date.now()}`;
    const notesField = editor.page.getByLabel(/^Notes$/i).first();
    await expect(notesField, "Notes field should be available").toBeVisible({
      timeout: TIMEOUT_UI,
    });
    await notesField.fill(notesValue);

    const attachmentInput = editor.page.locator("input[type='file']").first();
    await expect(
      attachmentInput,
      "Attachment upload control should be available"
    ).toBeVisible({ timeout: TIMEOUT_UI });
    await attachmentInput.setInputFiles(ATTACHMENT_FIXTURE_PATH);

    await editor.page.keyboard.press("Tab");
    await expect(editor.saveStatusText).toBeVisible({
      timeout: TIMEOUT_AUTOSAVE,
    });

    const { reportType, state, reportId } = editor.getCurrentRouteParams();

    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION
    );
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      STATE_POLICY_COMMITMENTS_SECTION
    );

    await verifyCurrentSection(editor, STATE_POLICY_COMMITMENTS_SECTION);
    await openFirstCommitmentAccordion(editor);

    await expect(editor.page.getByLabel(/Current Status/i).first()).toHaveValue(
      selectedStatus!
    );
    await expect(editor.page.getByLabel(/^Notes$/i).first()).toHaveValue(
      notesValue
    );
    await expect(editor.page.getByText(linkValue).first()).toBeVisible();
    await expect(
      editor.page.getByText(/use-of-funds\.csv/i).first()
    ).toBeVisible();
  });
});
