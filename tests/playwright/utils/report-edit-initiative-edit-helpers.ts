import { expect, type Locator } from "@playwright/test";
import {
  createArtifactId,
  escapeRegExp,
  getReportTestRunId,
  INITIATIVES_SECTION,
  OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH,
} from "./report-edit-shared-helpers";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import { TIMEOUT_UI } from "./timeouts";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const CHECKPOINT_STAGE_LABELS = [
  "Stage 0: Planning",
  "Stage 1: Project Preparation",
  "Stage 2: Early Implementation",
  "Stage 3: Midway Implementation",
  "Stage 4: Preparing for Completion",
  "Stage 5: Full Implementation",
];

export const GOVERNANCE_CHECKPOINT = /0\.1 Establish governance/i;

export const CHECKPOINT_TABLE_HEADERS = [
  "#",
  "Checkpoint",
  "Ready for CMS Review",
  "Attachments",
  "Status",
  "Actions",
];

const INITIATIVE_ROW_PATTERN = /^\d+:\s*.+/;
const EDITABLE_STATUS_PATTERN = /^(Not started|In progress|In revision)$/i;
const CHECKPOINT_STATUS_PATTERN =
  /^(Pending Review|Needs Revision|Locked for Scoring|Informational|Archived)$/i;

export type ReportPeriod = "annual" | "quarterly";
export type AdminMetricControlsVisibility = "visible" | "hidden";
export type MetricsTableOptions = {
  adminControls?: boolean;
};
export type MetricTestData = {
  name: string;
  targetInput: string;
  targetDisplay: string;
  currentInput: string;
  currentDisplay: string;
  date: string;
};

const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  annual: "Annual Report",
  quarterly: "Quarterly Report",
};

const getInitiativeRows = (table: Locator): Locator =>
  table.getByRole("row").filter({ hasText: INITIATIVE_ROW_PATTERN });

const getEditButton = (row: Locator): Locator =>
  row.getByRole("link", { name: /^(Edit|View)\b/i });

const getNonAbandonedInitiativeRows = (table: Locator): Locator =>
  getInitiativeRows(table).filter({ hasNotText: /Status:\s*Abandoned/i });

export const getMetricsTable = (editor: ReportEditorPage): Locator =>
  editor.page.getByRole("table").filter({
    has: editor.page.getByRole("columnheader", { name: "Metric" }),
  });

export const getMetricRow = (table: Locator, metricName: string): Locator =>
  table
    .locator("tbody")
    .getByRole("row")
    .filter({ hasText: metricName })
    .first();

export const createMetricTestData = (
  name: string,
  date: string
): MetricTestData => {
  const targetNumber = Math.floor(Math.random() * 1000000) + 1;
  const currentNumber = Math.floor(Math.random() * 1000000) + 1;

  return {
    name,
    targetInput: String(targetNumber),
    targetDisplay: targetNumber.toLocaleString("en-US"),
    currentInput: String(currentNumber),
    currentDisplay: currentNumber.toLocaleString("en-US"),
    date,
  };
};

export const addMetric = async (
  editor: ReportEditorPage,
  metric: MetricTestData
): Promise<void> => {
  const addMetricButton = editor.page.getByRole("button", {
    name: /^Add Metric$/i,
  });

  await expect(addMetricButton).toBeVisible({ timeout: TIMEOUT_UI });
  await addMetricButton.click();
  await expect(editor.page.getByRole("dialog")).toBeVisible({
    timeout: TIMEOUT_UI,
  });

  await editor.fillTextField(/^Metric name/i, metric.name);
  await editor.fillTextField(
    /^What is the target for this metric/i,
    metric.targetInput
  );
  await editor.fillTextField(
    /^What is the metric['’]s current value/i,
    metric.currentInput
  );
  await editor.fillTextField(/^Date of the current value/i, metric.date);

  await editor.page.getByRole("button", { name: /^Save$/i }).click();
  await expect(editor.page.getByRole("dialog")).toBeHidden({
    timeout: TIMEOUT_UI,
  });
};

export const editMetric = async (
  editor: ReportEditorPage,
  row: Locator,
  metric: MetricTestData
): Promise<void> => {
  await row.getByRole("button", { name: /^Edit\/Abandon$/i }).click();

  const dialog = editor.page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: /^Edit Metric$/i })
  ).toBeVisible({ timeout: TIMEOUT_UI });

  await editor.fillTextField(/^Metric name/i, metric.name);
  await editor.fillTextField(
    /^What is the target for this metric/i,
    metric.targetInput
  );
  await editor.fillTextField(
    /^What is the metric['’]s current value/i,
    metric.currentInput
  );
  await editor.fillTextField(/^Date of the current value/i, metric.date);

  await dialog.getByRole("button", { name: /^Save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: TIMEOUT_UI });
};

export const abandonMetric = async (
  editor: ReportEditorPage,
  row: Locator
): Promise<void> => {
  await row.getByRole("button", { name: /^Edit\/Abandon$/i }).click();

  const dialog = editor.page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: /^Edit Metric$/i })
  ).toBeVisible({ timeout: TIMEOUT_UI });

  const statusDropdown = dialog.getByLabel(/^Status$/i);
  await statusDropdown.click();
  const abandonedOption = editor.page.getByRole("option", {
    name: /^Abandoned$/i,
  });
  await expect(abandonedOption).toBeVisible({ timeout: TIMEOUT_UI });
  await abandonedOption.click();
  await expect(statusDropdown).toHaveText(/^Abandoned$/i);

  await dialog.getByRole("button", { name: /^Save$/i }).click();
  await expect(dialog).toBeHidden({ timeout: TIMEOUT_UI });
};

export const verifyAbandonedMetricRow = async (
  table: Locator,
  metricName: string
): Promise<void> => {
  const metricRow = table
    .locator("tbody")
    .getByRole("row")
    .filter({ hasText: metricName });

  await expect(metricRow).toHaveCount(1);
  await expect(metricRow).toBeVisible({ timeout: TIMEOUT_UI });
  await expect(
    metricRow.getByRole("cell", { name: /^Abandoned$/i })
  ).toBeVisible({ timeout: TIMEOUT_UI });

  const hasPreviousValueColumn = await table
    .getByRole("columnheader", { name: /^Previous annual value$/i })
    .isVisible()
    .catch(() => false);
  const cells = metricRow.getByRole("cell");
  const currentValueIndex = hasPreviousValueColumn ? 5 : 4;
  const dateIndex = hasPreviousValueColumn ? 6 : 5;

  await expect(cells.nth(currentValueIndex).locator("input")).toBeDisabled();
  await expect(cells.nth(dateIndex).locator("input")).toBeDisabled();
};

export const verifyMetricRow = async (
  table: Locator,
  metric: MetricTestData
): Promise<void> => {
  const metricRow = table
    .locator("tbody")
    .getByRole("row")
    .filter({ hasText: metric.name });

  await expect(metricRow).toHaveCount(1);
  await expect(metricRow).toBeVisible({ timeout: TIMEOUT_UI });

  const cells = metricRow.getByRole("cell");
  const hasPreviousValueColumn = await table
    .getByRole("columnheader", { name: /^Previous annual value$/i })
    .isVisible()
    .catch(() => false);
  const currentValueIndex = hasPreviousValueColumn ? 5 : 4;
  const dateIndex = hasPreviousValueColumn ? 6 : 5;

  await expect(cells.nth(2)).toHaveText(metric.name);
  await expect(cells.nth(3)).toHaveText(metric.targetDisplay);
  await expect(cells.nth(currentValueIndex).locator("input")).toHaveValue(
    metric.currentDisplay
  );
  await expect(cells.nth(dateIndex).locator("input")).toHaveValue(metric.date);
};

export const verifyAdminMetricControls = async (
  editor: ReportEditorPage,
  visibility: AdminMetricControlsVisibility
): Promise<void> => {
  const addMetricButton = editor.page.getByRole("button", {
    name: /^Add Metric$/i,
  });
  const metricsTable = editor.page.getByRole("table").filter({
    has: editor.page.getByRole("columnheader", { name: "Metric" }),
  });
  const metricRows = metricsTable.locator("tbody").getByRole("row");
  const editAbandonButtons = metricRows.getByRole("button", {
    name: /^Edit\/Abandon$/i,
  });

  await expect(metricsTable).toBeVisible({ timeout: TIMEOUT_UI });
  const metricRowCount = await metricRows.count();
  expect(metricRowCount).toBeGreaterThan(0);

  if (visibility === "hidden") {
    await expect(addMetricButton).toHaveCount(0);
    await expect(editAbandonButtons).toHaveCount(0);
    return;
  }

  await expect(addMetricButton).toBeVisible({ timeout: TIMEOUT_UI });
  await expect(editAbandonButtons).toHaveCount(metricRowCount);

  for (let index = 0; index < metricRowCount; index++) {
    await expect(
      metricRows.nth(index).getByRole("button", {
        name: /^Edit\/Abandon$/i,
      })
    ).toBeVisible({ timeout: TIMEOUT_UI });
  }
};

export const verifyTableHeaders = async (
  table: Locator,
  expectedHeaders: string[]
): Promise<void> => {
  const headers = table.getByRole("columnheader");

  await expect(headers).toHaveCount(expectedHeaders.length);
  await expect(headers).toHaveText(expectedHeaders);
};

export const verifyMetricsTableHeaders = async (
  table: Locator,
  options: MetricsTableOptions = {}
): Promise<boolean> => {
  const previousAnnualValueHeader = table.getByRole("columnheader", {
    name: /^Previous annual value$/i,
  });
  const hasPreviousValueColumn = await previousAnnualValueHeader
    .isVisible()
    .catch(() => false);
  const expectedHeaders = [
    "#",
    "Status",
    "Metric",
    "Target",
    ...(hasPreviousValueColumn ? ["Previous annual value"] : []),
    "Current value",
    "As of Date MM/DD/YYYY",
    ...(options.adminControls ? ["Actions"] : []),
  ];

  await verifyTableHeaders(table, expectedHeaders);

  return hasPreviousValueColumn;
};

export const verifyMetricsTableRows = async (
  table: Locator,
  hasPreviousValueColumn: boolean,
  options: MetricsTableOptions = {}
): Promise<void> => {
  const dataRows = table.locator("tbody").getByRole("row");
  const rowCount = await dataRows.count();

  expect(rowCount).toBeGreaterThan(0);

  for (let index = 0; index < rowCount; index++) {
    const row = dataRows.nth(index);
    const cells = row.getByRole("cell");
    const currentValueIndex = hasPreviousValueColumn ? 5 : 4;
    const dateIndex = hasPreviousValueColumn ? 6 : 5;

    await expect(row).toBeVisible();
    await expect(cells).toHaveCount(
      (hasPreviousValueColumn ? 7 : 6) + (options.adminControls ? 1 : 0)
    );
    await expect(cells.nth(0)).toHaveText(/^[1-9]\d*$/);
    await expect(cells.nth(1)).toHaveText(/^(Active|Abandoned)$/i);
    await expect(cells.nth(2)).toHaveText(/\S+/);
    await expect(cells.nth(3)).toHaveText(/^(--|\S[\s\S]*)$/);

    const status = ((await cells.nth(1).textContent()) ?? "").trim();
    const currentValueInput = cells.nth(currentValueIndex).locator("input");
    const dateInput = cells
      .nth(dateIndex)
      .locator('input[inputmode="numeric"]');

    if (hasPreviousValueColumn) {
      await expect(cells.nth(4).locator("input")).toBeDisabled();
    }

    if (/^Abandoned$/i.test(status)) {
      await expect(currentValueInput).toBeDisabled();
      await expect(dateInput).toBeDisabled();
    } else {
      await expect(currentValueInput).toBeEditable();
      await expect(dateInput).toBeEditable();
    }

    await expect(dateInput).toHaveAttribute("inputmode", "numeric");

    if (options.adminControls) {
      await expect(
        cells.nth(hasPreviousValueColumn ? 7 : 6).getByRole("button", {
          name: /^Edit\/Abandon$/i,
        })
      ).toBeVisible({ timeout: TIMEOUT_UI });
    }
  }
};

export const verifyVisibleAnnualInitiativeFields = async (
  editor: ReportEditorPage
): Promise<void> => {
  const narrativeRequiredLabel = editor.page
    .locator("label")
    .filter({ hasText: /^NarrativeRequired$/i });
  const narrativeTextArea = editor.page.getByRole("textbox", {
    name: /^Narrative/i,
  });
  const peopleServedRequiredLabel = editor.page
    .locator("label")
    .filter({ hasText: /^Number of people servedRequired$/i });
  const peopleServedTextArea = editor.page.getByRole("textbox", {
    name: /Number of people served/i,
  });

  await expect(narrativeRequiredLabel).toBeVisible();
  await expect(narrativeTextArea).toBeVisible();
  await expect(narrativeTextArea).toHaveValue(/\S+/);
  await expect(narrativeTextArea).toBeEditable();
  await expect(peopleServedRequiredLabel).toBeVisible();
  await expect(peopleServedTextArea).toBeVisible();
  await expect(peopleServedTextArea).toBeEditable();
};

export const verifyCheckpointTableHeaders = async (
  table: Locator
): Promise<void> => {
  await verifyTableHeaders(table, CHECKPOINT_TABLE_HEADERS);
};

export const verifyCheckpointStageRows = async (
  table: Locator
): Promise<void> => {
  const dataRows = table.locator("tbody").getByRole("row");
  const rowCount = await dataRows.count();

  expect(rowCount).toBeGreaterThan(0);

  for (let index = 0; index < rowCount; index++) {
    const row = dataRows.nth(index);
    const cells = row.getByRole("cell");

    await expect(row).toBeVisible();
    await expect(cells).toHaveCount(6);
    await expect(cells.nth(0)).toHaveText(/^(|\d+\.\d+)$/);
    await expect(cells.nth(1)).toHaveText(/^(|\S[\s\S]*)$/);

    const checkpointLabel = (await cells.nth(1).textContent())?.trim() ?? "";
    const readinessCheckbox = cells.nth(2).getByRole("checkbox");

    if (checkpointLabel) {
      await expect(cells.nth(0)).toHaveText(/^\d+\.\d+$/);
      await expect(readinessCheckbox).toBeEnabled();
    } else {
      await expect(readinessCheckbox).toHaveCount(0);
    }

    const attachmentText = ((await cells.nth(3).textContent()) ?? "").trim();
    const hasAttachment =
      attachmentText !== "" && !/^(Not applicable|--)$/i.test(attachmentText);

    await expect(cells.nth(3)).toHaveText(/^(|Not applicable|--|\S[\s\S]*)$/);

    if (hasAttachment) {
      await expect(cells.nth(4)).toHaveText(CHECKPOINT_STATUS_PATTERN);
      await expect(
        cells.nth(5).getByRole("button", { name: /Manage file or info/i })
      ).toBeVisible();
      await expect(
        cells.nth(5).getByRole("button", { name: /Comment on/i })
      ).toBeVisible();
    } else {
      await expect(cells.nth(4)).toHaveText(/^$/);
      await expect(cells.nth(5).getByRole("button")).toHaveCount(0);
    }
  }
};

const getInitiativeNumberAndName = (row: Locator): Locator =>
  row.getByText(INITIATIVE_ROW_PATTERN).first();

const getOpenInitiativeHeading = (editor: ReportEditorPage): Locator =>
  editor.page.getByRole("heading", { name: INITIATIVE_ROW_PATTERN }).first();

const getInitiativeNumberAndNameText = async (row: Locator): Promise<string> =>
  ((await getInitiativeNumberAndName(row).textContent()) ?? "").trim();

export const getOpenInitiativeHeadingText = async (
  editor: ReportEditorPage
): Promise<string> =>
  ((await getOpenInitiativeHeading(editor).textContent()) ?? "").trim();

const waitForInitiativeRows = async (table: Locator, timeout: number) => {
  await expect
    .poll(() => getInitiativeRows(table).count(), { timeout })
    .toBeGreaterThan(0);

  return getInitiativeRows(table);
};

export const openInitiativeFromList = async (
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
    { timeout: TIMEOUT_UI }
  );

  return selectedInitiativeNumberAndName;
};

export const openReportFromDashboard = async (
  editor: ReportEditorPage,
  period: ReportPeriod
): Promise<void> => {
  const { reportType, state } = editor.getCurrentRouteParams();
  await editor.navigateTo(`/report/${reportType}/${state}`);
  await editor.waitForLoadingComplete();

  const reportRow = editor.page
    .getByRole("table")
    .getByRole("row")
    .filter({ hasText: REPORT_PERIOD_LABELS[period] })
    .filter({
      has: editor.page.getByRole("cell", { name: EDITABLE_STATUS_PATTERN }),
    })
    .first();

  await expect(reportRow).toBeVisible({ timeout: TIMEOUT_UI });
  const openReportButton = reportRow
    .getByRole("button", { name: /View .* report/i })
    .first();
  await expect(openReportButton).toBeVisible({ timeout: TIMEOUT_UI });

  await Promise.all([
    editor.page.waitForURL(
      /\/report\/[^/]+\/[^/]+\/[^/]+(?:\/[^/]+)?(?:[?#].*)?$/
    ),
    openReportButton.click(),
  ]);
  await editor.waitForLoadingComplete();

  const {
    reportType: openedReportType,
    state: openedState,
    reportId,
  } = editor.getCurrentRouteParams();
  await editor.navigateToSection(
    openedReportType,
    openedState,
    reportId,
    INITIATIVES_SECTION
  );
};

export const getCheckpointStage = (
  editor: ReportEditorPage,
  stageLabel: string
): Locator => {
  const label = editor.page.getByText(stageLabel, { exact: true });
  return label.locator("..").filter({
    has: editor.page.getByRole("button", {
      name: /^Upload attachments$/i,
    }),
  });
};

export const openCheckpointUploadDrawer = async (
  editor: ReportEditorPage,
  stageLabel: string
): Promise<Locator> => {
  await getCheckpointStage(editor, stageLabel)
    .getByRole("button", { name: /^Upload attachments$/i })
    .click();

  const uploadDrawer = editor.page.getByRole("dialog");
  await expect(uploadDrawer).toBeVisible({ timeout: TIMEOUT_UI });
  return uploadDrawer;
};

export const selectCheckpoint = async (
  editor: ReportEditorPage,
  uploadDrawer: Locator,
  checkpointName: RegExp
): Promise<void> => {
  const checkpointDropdown = uploadDrawer
    .getByRole("button", {
      name: /Which stage\/checkpoint does this attachment apply to\?/i,
    })
    .first();

  await expect(checkpointDropdown).toBeVisible();
  await expect(checkpointDropdown).toBeEnabled();
  await checkpointDropdown.click();

  const checkpointOption = editor.page.getByRole("option", {
    name: checkpointName,
  });
  await expect(checkpointOption).toBeVisible();
  await checkpointOption.click();
};

export const getCheckpointRow = (
  table: Locator,
  checkpointName: string | RegExp
): Locator =>
  table
    .locator("tbody")
    .getByRole("row")
    .filter({ hasText: checkpointName })
    .first();

export const getCheckpointStatusFromRow = async (
  row: Locator
): Promise<string> => {
  const status = (
    (await row.getByRole("cell").nth(4).textContent()) ?? ""
  ).trim();

  expect(status).toMatch(/\S+/);

  return status;
};

export const returnToInitiativesDashboard = async (
  editor: ReportEditorPage
): Promise<void> => {
  const backButton = editor.page.getByRole("button", {
    name: "Back to Initiatives",
  });
  await expect(backButton).toBeVisible({ timeout: TIMEOUT_UI });

  await Promise.all([
    editor.page.waitForURL(
      /\/report\/[^/]+\/[^/]+\/[^/]+\/initiatives(?:\?.*)?$/
    ),
    backButton.click(),
  ]);
};

export const verifyInitiativesDashboardVisible = async (
  editor: ReportEditorPage
): Promise<void> => {
  const initiativesTable = editor.page.getByRole("table").filter({
    has: editor.page.getByRole("columnheader", { name: "Initiative" }),
  });

  await expect(initiativesTable).toBeVisible({ timeout: TIMEOUT_UI });
};

export const reopenInitiativeFromDashboard = async (
  editor: ReportEditorPage
): Promise<string> => {
  await verifyInitiativesDashboardVisible(editor);
  const initiativesTable = editor.page.getByRole("table").filter({
    has: editor.page.getByRole("columnheader", { name: "Initiative" }),
  });
  return openInitiativeFromList(editor, initiativesTable);
};

export const getCheckpointAttachmentRowByFileName = (
  editor: ReportEditorPage,
  stageLabel: string,
  fileName: string
): Locator =>
  getCheckpointStage(editor, stageLabel)
    .getByRole("table")
    .locator("tbody")
    .getByRole("row")
    .filter({ hasText: fileName })
    .first();

export type UploadFixture = { fileName: string; filePath: string };

export const withUploadFixture = async (
  callback: (fixture: UploadFixture) => Promise<void>
): Promise<void> => {
  const fileName = `initiative-attachment-${getReportTestRunId()}-${createArtifactId()}.csv`;
  const filePath = join(tmpdir(), fileName);
  await fs.copyFile(OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH, filePath);

  try {
    await callback({ fileName, filePath });
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }
};

export const getManageAttachmentButton = (
  row: Locator,
  fileName: string
): Locator =>
  row.getByRole("button", {
    name: `Manage file or info for ${fileName}`,
    exact: true,
  });

export const openManageAttachmentDrawer = async (
  editor: ReportEditorPage,
  row: Locator,
  fileName: string
): Promise<Locator> => {
  const manageButton = getManageAttachmentButton(row, fileName);
  await expect(manageButton).toBeVisible({ timeout: TIMEOUT_UI });
  await manageButton.click();

  const manageDrawer = editor.page.getByRole("dialog");
  await expect(
    manageDrawer.getByRole("heading", { name: /^Manage Attachment$/i })
  ).toBeVisible({ timeout: TIMEOUT_UI });

  return manageDrawer;
};

export const verifyManageAttachmentDrawerControls = async (
  drawer: Locator,
  fileName: string,
  checkpointStatus: string
): Promise<void> => {
  await expect(drawer).toContainText(fileName);
  await expect(drawer).toContainText(/Current status/i);
  await expect(drawer).toContainText(
    new RegExp(escapeRegExp(checkpointStatus), "i")
  );

  const statusDropdown = drawer
    .getByRole("button", { name: /Status\s*\(optional\)/i })
    .first();
  const initiativeChoices = drawer.getByRole("checkbox");
  const checkpointDropdown = drawer
    .getByRole("button", {
      name: /Which stage\/checkpoint does this attachment apply to\?/i,
    })
    .first();
  const deleteAttachmentButton = drawer.getByRole("button", {
    name: /^Delete attachment$/i,
  });
  const saveChangesButton = drawer.getByRole("button", {
    name: /^Save changes$/i,
  });

  await expect(statusDropdown).toBeVisible();
  await expect(statusDropdown).toBeEnabled();
  await expect(initiativeChoices.first()).toBeVisible();
  await expect(checkpointDropdown).toBeVisible();
  await expect(checkpointDropdown).toBeEnabled();
  await expect(deleteAttachmentButton).toBeVisible();
  await expect(deleteAttachmentButton).toBeEnabled();
  await expect(saveChangesButton).toBeVisible();
  await expect(saveChangesButton).toBeEnabled();
};

export const getCommentAttachmentButton = (
  row: Locator,
  fileName: string
): Locator =>
  row.getByRole("button", {
    name: `Comment on ${fileName}`,
    exact: true,
  });

export const closeCommentDrawer = async (drawer: Locator): Promise<void> => {
  await drawer
    .getByRole("contentinfo")
    .getByRole("button", { name: /^Close$/i })
    .click();
  await expect(drawer).toBeHidden({ timeout: TIMEOUT_UI });
};

export const uploadCheckpointAttachment = async (
  editor: ReportEditorPage,
  stageLabel: string,
  checkpointName: RegExp,
  fixture: UploadFixture
): Promise<Locator> => {
  const uploadDrawer = await openCheckpointUploadDrawer(editor, stageLabel);
  await selectCheckpoint(editor, uploadDrawer, checkpointName);

  const fileInput = uploadDrawer.locator('input[type="file"]');
  await expect(fileInput).toBeEnabled();
  await fileInput.setInputFiles(fixture.filePath);
  await expect(
    uploadDrawer.getByRole("heading", { name: /^Upload Status$/i })
  ).toBeVisible({ timeout: TIMEOUT_UI });
  await expect(
    uploadDrawer.getByText(fixture.fileName, { exact: true })
  ).toBeVisible({ timeout: TIMEOUT_UI });

  await uploadDrawer.getByRole("button", { name: /^Done$/i }).click();
  await expect(uploadDrawer).toBeHidden({ timeout: TIMEOUT_UI });

  return getCheckpointStage(editor, stageLabel)
    .getByRole("table")
    .locator("tbody")
    .getByRole("row")
    .filter({ hasText: fixture.fileName })
    .first();
};
