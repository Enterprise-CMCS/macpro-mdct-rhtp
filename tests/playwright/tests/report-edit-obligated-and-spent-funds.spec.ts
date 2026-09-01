import { test, expect, type Page } from "./fixtures/base";
import { openReportSectionWithTimeoutOrSkip } from "../utils/report-edit-arrange";
import {
  createArtifactId,
  GENERAL_INFORMATION_SECTION,
  getReportTestRunId,
  OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH,
  OBLIGATED_AND_SPENT_FUNDS_SECTION,
  uploadFileViaDialog,
} from "../utils/report-edit-shared-helpers";
import {
  skipIfUnavailable,
  verifyCurrentSection,
  verifyReportSectionShell,
} from "../utils/report-edit-assertions";
import { TIMEOUT_AUTOSAVE, TIMEOUT_UI } from "../utils/timeouts";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const escapeRegExp = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const createUniqueUploadFixture = async (): Promise<{
  fileName: string;
  filePath: string;
}> => {
  const fileName = `obligated-and-spent-funds-${getReportTestRunId()}-${createArtifactId()}.csv`;
  const filePath = join(tmpdir(), fileName);
  await fs.copyFile(OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH, filePath);
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

const getAddObligatedAndSpentFundsButton = (page: Page) =>
  page.getByRole("button", { name: /Add Obligated and Spent Funds/i });

const getUploadedFileEntry = (page: Page, fileName: string) =>
  page.getByText(new RegExp(escapeRegExp(fileName), "i"));

const waitForObligatedAndSpentFundsPersistence = async (
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

test.describe("Report Editing - Obligated and Spent Funds", () => {
  test("should upload a Obligated and Spent Funds file and show it in the section @regression", async ({
    statePage,
  }) => {
    test.slow();

    const editor = await openReportSectionWithTimeoutOrSkip(
      statePage,
      "unsubmitted",
      OBLIGATED_AND_SPENT_FUNDS_SECTION,
      (reason) => test.skip(true, reason),
      {
        timeoutReason: "Timed out opening Obligated and Spent Funds section",
      }
    );

    if (!editor) {
      return;
    }

    await verifyReportSectionShell(editor, {
      sectionId: OBLIGATED_AND_SPENT_FUNDS_SECTION,
      heading: "Obligated and Spent Funds",
      previousButtonVisibility: "visible",
      continueButtonVisibility: "visible",
    });

    await withUniqueUploadFixture(async ({ fileName, filePath }) => {
      const addObligatedAndSpentFundsButton =
        getAddObligatedAndSpentFundsButton(editor.page);
      await expect(addObligatedAndSpentFundsButton).toBeVisible({
        timeout: TIMEOUT_UI,
      });

      const addButtonUnavailable = await skipIfUnavailable(
        () => addObligatedAndSpentFundsButton.isEnabled(),
        (reason) => test.skip(true, reason),
        "Add Obligated and Spent Funds is disabled in this environment"
      );
      if (addButtonUnavailable) {
        return;
      }

      await addObligatedAndSpentFundsButton.click();
      await uploadFileViaDialog(editor.page, {
        filePath,
        fileInputSelector: "input[type='file']#file-input",
        expectedFileName: new RegExp(escapeRegExp(fileName), "i"),
        timeoutMs: TIMEOUT_UI,
      });

      await waitForObligatedAndSpentFundsPersistence(editor, fileName);
    });
  });

  test("should persist uploaded Obligated and Spent Funds file after section navigation @regression", async ({
    statePage,
  }) => {
    test.slow();

    const editor = await openReportSectionWithTimeoutOrSkip(
      statePage,
      "unsubmitted",
      OBLIGATED_AND_SPENT_FUNDS_SECTION,
      (reason) => test.skip(true, reason),
      {
        timeoutReason: "Timed out opening Obligated and Spent Funds section",
      }
    );

    if (!editor) {
      return;
    }

    await verifyCurrentSection(editor, OBLIGATED_AND_SPENT_FUNDS_SECTION);
    await withUniqueUploadFixture(async ({ fileName, filePath }) => {
      const addObligatedAndSpentFundsButton =
        getAddObligatedAndSpentFundsButton(editor.page);
      await expect(addObligatedAndSpentFundsButton).toBeVisible({
        timeout: TIMEOUT_UI,
      });

      const addButtonUnavailable = await skipIfUnavailable(
        () => addObligatedAndSpentFundsButton.isEnabled(),
        (reason) => test.skip(true, reason),
        "Add Obligated and Spent Funds is disabled in this environment"
      );
      if (addButtonUnavailable) {
        return;
      }

      await addObligatedAndSpentFundsButton.click();
      await uploadFileViaDialog(editor.page, {
        filePath,
        fileInputSelector: "input[type='file']#file-input",
        expectedFileName: new RegExp(escapeRegExp(fileName), "i"),
        timeoutMs: TIMEOUT_UI,
      });

      await waitForObligatedAndSpentFundsPersistence(editor, fileName);

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
        OBLIGATED_AND_SPENT_FUNDS_SECTION
      );

      await verifyCurrentSection(editor, OBLIGATED_AND_SPENT_FUNDS_SECTION);
      await expect(getUploadedFileEntry(editor.page, fileName)).toBeVisible({
        timeout: TIMEOUT_UI,
      });
    });
  });
});
