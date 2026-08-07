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

const getStatusIcon = (row: Locator): Locator =>
  row.getByRole("img", { name: /icon$/i });

const getStatusText = (row: Locator): Locator =>
  row.getByText(/^Status: (Minimum requirements (not )?met|Abandoned)$/i);

const getInitiativeName = (row: Locator): Locator =>
  row.getByRole("cell").filter({ hasText: /^\d+:\s*.+/ });

const getInitiativeRows = (table: Locator): Locator =>
  table.getByRole("row").filter({ hasText: /^\d+:\s*.+/ });

const getEditButton = (row: Locator): Locator =>
  row.getByRole("link", { name: /^Edit/i });

test.describe("Report Editing - Initiatives", () => {
  let editor: ReportEditorPage;

  test.beforeEach(async ({ statePage }) => {
    const result = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      INITIATIVES_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (result) editor = result;
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
    await expect(
      table.getByRole("columnheader", { name: "Status" })
    ).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Initiative" })
    ).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Actions" })
    ).toBeVisible();
  });

  test("should display name, status icon, status text, and Edit CTA for each initiative @regression", async () => {
    const table = editor.page.getByRole("table");
    await expect(table).toBeVisible({ timeout: TIMEOUT_UI });

    const dataRows = getInitiativeRows(table);
    // Wait for rows to render before counting — count() does not retry.
    await expect(dataRows.first())
      .toBeVisible({ timeout: TIMEOUT_UI })
      .catch(() => {});
    const rowCount = await dataRows.count();

    if (rowCount === 0) {
      test.skip(true, "No initiatives available to verify");
      return;
    }

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
    const dataRows = getInitiativeRows(table);
    await expect(dataRows.first())
      .toBeVisible({ timeout: TIMEOUT_UI })
      .catch(() => {});
    const rowCount = await dataRows.count();

    if (rowCount === 0) {
      test.skip(true, "No initiatives available to verify");
      return;
    }

    const editButton = getEditButton(dataRows.first());
    await expect(editButton).toBeVisible({ timeout: TIMEOUT_UI });
    await editButton.click();

    // URL should move to an initiative sub-page, away from the initiatives list.
    await expect(editor.page).not.toHaveURL(/\/initiatives$/, {
      timeout: TIMEOUT_UI,
    });
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
