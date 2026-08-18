import { expect, type Locator } from "@playwright/test";
import {
  createArtifactId,
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

const INITIATIVE_ROW_PATTERN = /^\d+:\s*.+/;
const EDITABLE_STATUS_PATTERN = /^(Not started|In progress|In revision)$/i;

export const getInitiativeRows = (table: Locator): Locator =>
  table.getByRole("row").filter({ hasText: INITIATIVE_ROW_PATTERN });

export const getEditButton = (row: Locator): Locator =>
  row.getByRole("link", { name: /^(Edit|View)\b/i });

export const getNonAbandonedInitiativeRows = (table: Locator): Locator =>
  getInitiativeRows(table).filter({ hasNotText: /Status:\s*Abandoned/i });

const getInitiativeNumberAndName = (row: Locator): Locator =>
  row.getByText(INITIATIVE_ROW_PATTERN).first();

export const getOpenInitiativeHeading = (editor: ReportEditorPage): Locator =>
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

export const openAnnualReportFromDashboard = async (
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
  const annualOpenButton = annualEditableRow
    .getByRole("button", { name: /View .* report/i })
    .first();
  await expect(annualOpenButton).toBeVisible({ timeout: TIMEOUT_UI });

  await Promise.all([
    editor.page.waitForURL(
      /\/report\/[^/]+\/[^/]+\/[^/]+(?:\/[^/]+)?(?:[?#].*)?$/
    ),
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

export const returnToInitiativesDashboard = async (
  editor: ReportEditorPage
): Promise<void> => {
  const backButton = editor.page.getByRole("button", {
    name: "Back to Initiatives",
  });
  await expect(backButton).toBeVisible();

  await Promise.all([
    editor.page.waitForURL(
      /\/report\/[^/]+\/[^/]+\/[^/]+\/initiatives(?:\?.*)?$/
    ),
    backButton.click(),
  ]);
};

export const reopenInitiativeFromDashboard = async (
  editor: ReportEditorPage
): Promise<string> => {
  const initiativesTable = editor.page.getByRole("table").filter({
    has: editor.page.getByRole("columnheader", { name: "Initiative" }),
  });
  await expect(initiativesTable).toBeVisible({ timeout: TIMEOUT_UI });
  return openInitiativeFromList(editor, initiativesTable);
};

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
    name: new RegExp(`Manage file or info for ${fileName}`, "i"),
  });

export const getCommentAttachmentButton = (
  row: Locator,
  fileName: string
): Locator =>
  row.getByRole("button", {
    name: new RegExp(`Comment on ${fileName}`, "i"),
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
