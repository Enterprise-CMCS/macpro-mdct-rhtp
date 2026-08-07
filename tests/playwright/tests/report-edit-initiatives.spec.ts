import { test, expect, type Locator } from "./fixtures/base";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  INITIATIVES_SECTION,
  INITIATIVE_ATTACHMENTS_SECTION,
  GENERAL_INFORMATION_SECTION,
} from "../utils/report-edit-shared-helpers";
import {
  verifyCurrentSection,
  verifyReportSectionShell,
} from "../utils/report-edit-assertions";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { TIMEOUT_UI } from "../utils/timeouts";

const INITIATIVE_ROW_PATTERN = /^\d+:\s*.+/;
const STATUS_TEXT_PATTERN =
  /^Status: (Minimum requirements (not )?met|Abandoned)$/i;

const getStatusIcon = (row: Locator): Locator =>
  row.getByRole("img", { name: /icon$/i });

const getStatusText = (row: Locator): Locator =>
  row.getByText(STATUS_TEXT_PATTERN);

const getInitiativeName = (row: Locator): Locator =>
  row.getByRole("cell").filter({ hasText: INITIATIVE_ROW_PATTERN });

const getInitiativeRows = (table: Locator): Locator =>
  table.getByRole("row").filter({ hasText: INITIATIVE_ROW_PATTERN });

const getEditButton = (row: Locator): Locator =>
  row.getByRole("link", { name: /^(Edit|View)\b/i });

const verifyInitiativesTableHeaders = async (table: Locator): Promise<void> => {
  await expect(
    table.getByRole("columnheader", { name: "Status" })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Initiative" })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Actions" })
  ).toBeVisible();
};

const waitForInitiativeRows = async (table: Locator, timeout: number) => {
  await expect
    .poll(() => getInitiativeRows(table).count(), { timeout })
    .toBeGreaterThan(0);

  return getInitiativeRows(table);
};

test.describe("Report Editing - Initiatives", () => {
  let editor: ReportEditorPage;

  test.beforeEach(async ({ statePage }) => {
    const result = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      INITIATIVES_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!result) {
      throw new Error(
        "openReportSectionOrSkip returned undefined without skipping the test"
      );
    }
    editor = result;
  });

  test("should have the correct URL, heading, and navigation buttons @regression", async () => {
    await verifyReportSectionShell(editor, {
      sectionId: INITIATIVES_SECTION,
      heading: /^Initiatives$/i,
      previousButtonVisibility: "visible",
      continueButtonVisibility: "visible",
    });
  });

  test("should display the initiatives table @regression", async () => {
    const table = editor.page.getByRole("table");
    await expect(table).toBeVisible();
    await verifyInitiativesTableHeaders(table);
  });

  test("should display name, status icon, status text, and Edit CTA for each initiative @regression", async () => {
    const table = editor.page.getByRole("table");
    await expect(table).toBeVisible({ timeout: TIMEOUT_UI });

    const dataRows = await waitForInitiativeRows(table, TIMEOUT_UI);
    const rowCount = await dataRows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = dataRows.nth(i);
      await expect(getInitiativeName(row)).toBeVisible();
      await expect(getStatusIcon(row)).toBeVisible();
      await expect(getStatusText(row)).toBeVisible();
      await expect(getEditButton(row)).toBeVisible();
    }
  });

  test("should navigate into an initiative when Edit is clicked @regression", async () => {
    const table = editor.page.getByRole("table");
    const dataRows = await waitForInitiativeRows(table, TIMEOUT_UI);

    const editButton = getEditButton(dataRows.first());
    await expect(editButton).toBeVisible({ timeout: TIMEOUT_UI });
    await editButton.click();

    // URL should move to an initiative sub-page, away from the initiatives list.
    await expect(editor.page).toHaveURL(
      /\/report\/[^/]+\/[^/]+\/[^/]+\/[^/?#]+(\?.*)?$/,
      {
        timeout: TIMEOUT_UI,
      }
    );
  });

  test("should navigate to the previous section when Previous is clicked @regression", async () => {
    await editor.clickPrevious();
    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
  });

  test("should navigate to the next section when Continue is clicked @regression", async () => {
    await editor.clickContinue();
    await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);
  });
});
