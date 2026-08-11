import { test, expect, type Locator } from "./fixtures/base";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import { INITIATIVES_SECTION } from "../utils/report-edit-shared-helpers";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { TIMEOUT_UI } from "../utils/timeouts";

const INITIATIVE_ROW_PATTERN = /^\d+:\s*.+/;

const EDITABLE_STATUS_PATTERN = /^(Not started|In progress|In revision)$/i;

const getInitiativeRows = (table: Locator): Locator =>
  table.getByRole("row").filter({ hasText: INITIATIVE_ROW_PATTERN });

const getEditButton = (row: Locator): Locator =>
  row.getByRole("link", { name: /^(Edit|View)\b/i });

const getNonAbandonedInitiativeRows = (table: Locator): Locator =>
  getInitiativeRows(table).filter({ hasNotText: /Status:\s*Abandoned/i });

const getInitiativeNumberAndName = (row: Locator): Locator =>
  row.getByRole("cell").filter({ hasText: INITIATIVE_ROW_PATTERN });

const getOpenInitiativeHeading = (editor: ReportEditorPage): Locator =>
  editor.page.getByRole("heading", { name: INITIATIVE_ROW_PATTERN }).first();

const getInitiativeNumberAndNameText = async (row: Locator): Promise<string> =>
  ((await getInitiativeNumberAndName(row).first().textContent()) ?? "").trim();

const getOpenInitiativeHeadingText = async (
  editor: ReportEditorPage
): Promise<string> =>
  ((await getOpenInitiativeHeading(editor).textContent()) ?? "").trim();

const waitForInitiativeRows = async (table: Locator, timeout: number) => {
  await expect
    .poll(() => getInitiativeRows(table).count(), { timeout })
    .toBeGreaterThan(0);

  return getInitiativeRows(table);
};

const openInitiativeFromList = async (
  editor: ReportEditorPage,
  table: Locator
): Promise<string> => {
  const dataRows = await waitForInitiativeRows(table, TIMEOUT_UI);
  const nonAbandonedRows = getNonAbandonedInitiativeRows(table);

  const rowToOpen =
    (await nonAbandonedRows.count()) > 0
      ? nonAbandonedRows.first()
      : dataRows.first();

  const selectedInitiativeNumberAndName =
    await getInitiativeNumberAndNameText(rowToOpen);

  const editButton = getEditButton(rowToOpen);
  await expect(editButton).toBeVisible({ timeout: TIMEOUT_UI });
  await editButton.click();

  await expect(editor.page).toHaveURL(
    /\/report\/[^/]+\/[^/]+\/[^/]+\/[^/?#]+(\?.*)?$/,
    {
      timeout: TIMEOUT_UI,
    }
  );

  return selectedInitiativeNumberAndName;
};

const openAnnualReportFromDashboard = async (
  editor: ReportEditorPage
): Promise<void> => {
  const { reportType, state } = editor.getCurrentRouteParams();
  await editor.navigateTo(`/report/${reportType}/${state}`);
  await editor.waitForLoadingComplete();

  const annualEditableRow = editor.page
    .getByRole("table")
    .getByRole("row")
    .filter({ hasText: /Annual Report/i })
    .filter({
      has: editor.page.getByRole("cell", { name: EDITABLE_STATUS_PATTERN }),
    })
    .first();

  await expect(annualEditableRow).toBeVisible({ timeout: TIMEOUT_UI });

  const hasAnnualEditableRow =
    (await annualEditableRow.count()) > 0 &&
    (await annualEditableRow.isVisible());

  test.skip(
    !hasAnnualEditableRow,
    "No editable annual report row available for this state user"
  );

  const annualOpenButton = annualEditableRow
    .getByRole("button", { name: /View .* report/i })
    .first();
  await expect(annualOpenButton).toBeVisible({ timeout: TIMEOUT_UI });

  await Promise.all([
    editor.page.waitForURL(/\/report\/[^/]+\/[^/]+\/[^/]+(?:\/[^/]+)?$/),
    annualOpenButton.click(),
  ]);
  await editor.waitForLoadingComplete();

  const {
    reportType: annualReportType,
    state: annualState,
    reportId,
  } = editor.getCurrentRouteParams();
  await editor.navigateToSection(
    annualReportType,
    annualState,
    reportId,
    INITIATIVES_SECTION
  );
};

const verifyAnnualContextFromHeader = async (
  editor: ReportEditorPage
): Promise<void> => {
  await expect(
    editor.page
      .locator("#header p")
      .filter({ hasText: /Annual Report/i })
      .first()
  ).toBeVisible({ timeout: TIMEOUT_UI });
};

const verifyMetricsTableHeaders = async (table: Locator): Promise<void> => {
  await expect(table.getByRole("columnheader", { name: "#" })).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Status" })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Target" })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Current Value" })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "As of Date MM/DD/YYYY" })
  ).toBeVisible();
};

const verifyCheckpointTableHeaders = async (table: Locator): Promise<void> => {
  await expect(table.getByRole("columnheader", { name: "#" })).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Checkpoint" })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Ready for CMS Review" })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Attachments" })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Status" })
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Actions" })
  ).toBeVisible();
};

test.describe("Report Editing - Initiative Edit Page (Annual, Non-Admin)", () => {
  let editor: ReportEditorPage;
  let selectedInitiativeNumberAndName = "";

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
    await openAnnualReportFromDashboard(editor);

    const table = editor.page.getByRole("table");
    await expect(table).toBeVisible({ timeout: TIMEOUT_UI });
    selectedInitiativeNumberAndName = await openInitiativeFromList(
      editor,
      table
    );
  });

  test("should identify report context from header text @regression", async () => {
    await verifyAnnualContextFromHeader(editor);
  });

  test("should display an initiative heading that matches the selected initiative correctly for non-admin users @regression", async () => {
    await verifyAnnualContextFromHeader(editor);

    const openInitiativeHeading = await getOpenInitiativeHeadingText(editor);
    expect(openInitiativeHeading).toBe(selectedInitiativeNumberAndName);
  });

  test("should display a Narrative label, prepopulated editable text area, and be required for non-admin users @regression", async () => {
    await verifyAnnualContextFromHeader(editor);

    const narrativeLabelRequired = editor.page
      .getByLabel(/^Narrative/i)
      .getByText(/Required/i);
    const narrativeTextArea = editor.page.getByRole("textbox", {
      name: /^Narrative/i,
    });

    await expect(narrativeLabelRequired).toBeVisible();
    await expect(narrativeTextArea).toBeVisible();
    await expect(narrativeTextArea).toHaveValue(/\S+/); // Ensure the text area is prepopulated with non-whitespace content
  });

  test("should display a Number of people served label, editable text area, and be required for non-admin users @regression", async () => {
    await verifyAnnualContextFromHeader(editor);

    const peopleServedLabelRequired = editor.page
      .getByLabel(/Number of people served/i)
      .getByText(/Required/i);
    const peopleServedTextArea = editor.page.getByRole("textbox", {
      name: /Number of people served/i,
    });

    await expect(peopleServedLabelRequired).toBeVisible();
    await expect(peopleServedTextArea).toBeVisible();
    await expect(peopleServedTextArea).toBeEditable();
  });

  test("should display the Metrics heading and table for non-admin users @regression", async () => {
    await verifyAnnualContextFromHeader(editor);

    const metricsHeading = editor.page.getByRole("heading", {
      name: /^Metrics/i,
    });
    const metricsTable = editor.page.getByRole("table", { name: /^Metrics$/i });

    await expect(metricsHeading).toBeVisible({ timeout: TIMEOUT_UI });
    await expect(metricsTable).toBeVisible({ timeout: TIMEOUT_UI });
    await verifyMetricsTableHeaders(metricsTable);
  });

  test("should display the Checkpoints heading for non-admin users @regression", async () => {
    await verifyAnnualContextFromHeader(editor);

    const checkpointsHeading = editor.page.getByRole("heading", {
      name: /^Checkpoints$/i,
    });
    await expect(checkpointsHeading).toBeVisible();
    await verifyCheckpointTableHeaders(
      editor.page.getByRole("table", { name: /^Checkpoints$/i })
    );
  });

  test("should hide admin-only metric controls for non-admin users @regression", async () => {
    await verifyAnnualContextFromHeader(editor);

    await expect(
      editor.page.getByRole("button", { name: /^Add Metric$/i })
    ).toHaveCount(0);
    await expect(
      editor.page.getByRole("button", { name: /^Edit\/Abandon$/i })
    ).toHaveCount(0);
  });
});
