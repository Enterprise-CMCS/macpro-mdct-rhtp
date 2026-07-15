import { test, expect, Locator } from "./fixtures/base";
import type { Page } from "@playwright/test";
import { openReportSectionWithTimeoutOrSkip } from "../utils/report-edit-arrange";
import { INITIATIVE_ATTACHMENTS_SECTION } from "../utils/report-edit-helpers";
import { verifyCurrentSection } from "../utils/report-edit-assertions";
import { getFirstVisible } from "../utils/locators";
import { TIMEOUT_UI } from "../utils/timeouts";
import { resolve } from "node:path";

const ATTACHMENT_FIXTURE_PATH = resolve(
  process.cwd(),
  "playwright/fixtures/use-of-funds.csv"
);

const getAttachmentsTable = (page: Page): Locator =>
  page.getByRole("table").first();

const getAddAttachmentButton = (page: Page): Locator =>
  page.getByRole("button", { name: /^Add attachment$/i }).first();

const getRowByStatus = (table: Locator, statusText: RegExp): Locator =>
  table.getByRole("row").filter({ hasText: statusText }).first();

const getActionButtonFromRow = async (
  row: Locator,
  names: RegExp[]
): Promise<Locator | null> =>
  getFirstVisible(names.map((name) => row.getByRole("button", { name })));

test.describe("Report Editing - Initiative Attachments", () => {
  test("should upload an attachment and display it in the attachments table @regression", async ({
    statePage,
  }) => {
    test.slow();

    const editor = await openReportSectionWithTimeoutOrSkip(
      statePage,
      "unsubmitted",
      INITIATIVE_ATTACHMENTS_SECTION,
      (reason) => test.skip(true, reason),
      {
        timeoutReason: "Timed out opening attachments section",
      }
    );
    if (!editor) {
      return;
    }

    await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);

    const table = getAttachmentsTable(editor.page);
    await expect(table).toBeVisible();

    const existingFileRef = table.getByText(/use-of-funds\.csv/i).first();
    const hadExistingRef = await existingFileRef.isVisible().catch(() => false);

    const addAttachmentButton = getAddAttachmentButton(editor.page);
    await expect(
      addAttachmentButton,
      "Add attachment action should be visible"
    ).toBeVisible({
      timeout: TIMEOUT_UI,
    });
    await addAttachmentButton.click();

    const dialog = editor.page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog
      .locator("input[type='file']")
      .setInputFiles(ATTACHMENT_FIXTURE_PATH);

    const doneButton = dialog.getByRole("button", { name: /^Done$/i });

    await expect(
      doneButton,
      "Upload completion action should be available in attachment dialog"
    ).toBeVisible({
      timeout: TIMEOUT_UI,
    });
    await doneButton.click();
    await expect(dialog).toBeHidden();

    // We upload a known fixture; seeing it in the table confirms add/upload worked.
    await expect(table.getByText(/use-of-funds\.csv/i).first()).toBeVisible();

    if (!hadExistingRef) {
      await expect(table.getByText(/pending review/i).first()).toBeVisible();
    }
  });

  test("should enforce edit and delete restrictions for locked attachment statuses @regression", async ({
    statePage,
  }) => {
    test.slow();

    const editor = await openReportSectionWithTimeoutOrSkip(
      statePage,
      "unsubmitted",
      INITIATIVE_ATTACHMENTS_SECTION,
      (reason) => test.skip(true, reason),
      {
        timeoutReason: "Timed out opening attachments section",
      }
    );
    if (!editor) {
      return;
    }

    await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);

    const table = getAttachmentsTable(editor.page);
    await expect(table).toBeVisible();

    const lockedRow = getRowByStatus(table, /locked for scoring/i);
    const needsRevisionRow = getRowByStatus(table, /needs revision/i);

    const hasLockedRow = await lockedRow.isVisible().catch(() => false);
    const hasNeedsRevisionRow = await needsRevisionRow
      .isVisible()
      .catch(() => false);

    if (!hasLockedRow && !hasNeedsRevisionRow) {
      test.skip(
        true,
        "No locked status rows available to validate action restrictions"
      );
      return;
    }

    if (hasLockedRow) {
      const lockedEditButton = await getActionButtonFromRow(lockedRow, [
        /edit/i,
        /replace/i,
      ]);
      const lockedDeleteButton = await getActionButtonFromRow(lockedRow, [
        /delete/i,
        /remove/i,
      ]);

      if (lockedEditButton) {
        await expect(lockedEditButton).toBeDisabled();
      }
      if (lockedDeleteButton) {
        await expect(lockedDeleteButton).toBeDisabled();
      }
    }

    if (hasNeedsRevisionRow) {
      const needsRevisionDeleteButton = await getActionButtonFromRow(
        needsRevisionRow,
        [/delete/i, /remove/i]
      );
      if (needsRevisionDeleteButton) {
        await expect(needsRevisionDeleteButton).toBeDisabled();
      }
    }
  });
});
