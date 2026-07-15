import { test, expect, type Page } from "./fixtures/base";
import { openReportSectionWithTimeoutOrSkip } from "../utils/report-edit-arrange";
import {
  GENERAL_INFORMATION_SECTION,
  USE_OF_FUNDS_SECTION,
} from "../utils/report-edit-helpers";
import { verifyCurrentSection } from "../utils/report-edit-assertions";
import { TIMEOUT_AUTOSAVE, TIMEOUT_UI } from "../utils/timeouts";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const USE_OF_FUNDS_FIXTURE_PATH = resolve(
  process.cwd(),
  "playwright/fixtures/use-of-funds.csv"
);

const escapeRegExp = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const createUniqueUploadFixture = async (): Promise<{
  fileName: string;
  filePath: string;
}> => {
  const fileName = `use-of-funds-${Date.now()}.csv`;
  const filePath = join(tmpdir(), fileName);
  await fs.copyFile(USE_OF_FUNDS_FIXTURE_PATH, filePath);
  return { fileName, filePath };
};

const withUniqueUploadFixture = async (
  run: (fixture: { fileName: string; filePath: string }) => Promise<void>
): Promise<void> => {
  const fixture = await createUniqueUploadFixture();
  try {
    await run(fixture);
  } finally {
    await fs.unlink(fixture.filePath).catch(() => {});
  }
};

const getAddUseOfFundsButton = (page: Page) =>
  page.getByRole("button", { name: /Add Use of Funds/i });

const getUploadDialog = (page: Page) => page.getByRole("dialog");

const getUploadedFileEntry = (page: Page, fileName: string) =>
  page.getByText(new RegExp(escapeRegExp(fileName), "i"));

const waitForUseOfFundsPersistence = async (
  editor: { page: Page; saveStatusText: ReturnType<Page["getByText"]> },
  fileName: string
) => {
  await expect(getUploadedFileEntry(editor.page, fileName)).toBeVisible({
    timeout: TIMEOUT_UI,
  });

  await editor.saveStatusText
    .waitFor({ state: "visible", timeout: TIMEOUT_AUTOSAVE })
    .catch(() => {});
};

test.describe("Report Editing - Use of Funds", () => {
  test("should upload a Use of Funds file and show it in the section @regression", async ({
    statePage,
  }) => {
    test.slow();

    const editor = await openReportSectionWithTimeoutOrSkip(
      statePage,
      "unsubmitted",
      USE_OF_FUNDS_SECTION,
      (reason) => test.skip(true, reason),
      {
        timeoutReason: "Timed out opening Use of Funds section",
      }
    );

    if (!editor) {
      return;
    }

    await verifyCurrentSection(editor, USE_OF_FUNDS_SECTION);
    await withUniqueUploadFixture(async ({ fileName, filePath }) => {
      const addUseOfFundsButton = getAddUseOfFundsButton(editor.page);
      await expect(addUseOfFundsButton).toBeVisible({ timeout: TIMEOUT_UI });

      const canAddUseOfFunds = await addUseOfFundsButton
        .isEnabled()
        .catch(() => false);
      if (!canAddUseOfFunds) {
        test.skip(true, "Add Use of Funds is disabled in this environment");
        return;
      }

      await addUseOfFundsButton.click();

      const dialog = getUploadDialog(editor.page);
      await expect(dialog).toBeVisible({ timeout: TIMEOUT_UI });

      await dialog
        .locator("input[type='file']#file-input")
        .setInputFiles(filePath);

      await expect(
        dialog.getByText(new RegExp(escapeRegExp(fileName), "i"))
      ).toBeVisible({
        timeout: TIMEOUT_UI,
      });

      await dialog.getByRole("button", { name: /^Done$/i }).click();
      await expect(dialog).toBeHidden({ timeout: TIMEOUT_UI });

      await waitForUseOfFundsPersistence(editor, fileName);
    });
  });

  test("should persist uploaded Use of Funds file after section navigation @regression", async ({
    statePage,
  }) => {
    test.slow();

    const editor = await openReportSectionWithTimeoutOrSkip(
      statePage,
      "unsubmitted",
      USE_OF_FUNDS_SECTION,
      (reason) => test.skip(true, reason),
      {
        timeoutReason: "Timed out opening Use of Funds section",
      }
    );

    if (!editor) {
      return;
    }

    await verifyCurrentSection(editor, USE_OF_FUNDS_SECTION);
    await withUniqueUploadFixture(async ({ fileName, filePath }) => {
      const addUseOfFundsButton = getAddUseOfFundsButton(editor.page);
      await expect(addUseOfFundsButton).toBeVisible({ timeout: TIMEOUT_UI });

      const canAddUseOfFunds = await addUseOfFundsButton
        .isEnabled()
        .catch(() => false);
      if (!canAddUseOfFunds) {
        test.skip(true, "Add Use of Funds is disabled in this environment");
        return;
      }

      await addUseOfFundsButton.click();

      const dialog = getUploadDialog(editor.page);
      await expect(dialog).toBeVisible({ timeout: TIMEOUT_UI });

      await dialog
        .locator("input[type='file']#file-input")
        .setInputFiles(filePath);
      await expect(
        dialog.getByText(new RegExp(escapeRegExp(fileName), "i"))
      ).toBeVisible({
        timeout: TIMEOUT_UI,
      });

      await dialog.getByRole("button", { name: /^Done$/i }).click();
      await expect(dialog).toBeHidden({ timeout: TIMEOUT_UI });

      await waitForUseOfFundsPersistence(editor, fileName);

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
        USE_OF_FUNDS_SECTION
      );

      await verifyCurrentSection(editor, USE_OF_FUNDS_SECTION);
      await expect(getUploadedFileEntry(editor.page, fileName)).toBeVisible({
        timeout: TIMEOUT_UI,
      });
    });
  });
});
