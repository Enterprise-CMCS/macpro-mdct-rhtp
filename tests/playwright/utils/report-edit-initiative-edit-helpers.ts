import { expect, type Locator } from "@playwright/test";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createArtifactId,
  escapeRegExp,
  getReportTestRunId,
  OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH,
} from "./report-edit-shared-helpers";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import {
  INITIATIVE_UI_NAMES,
  type InitiativeMetricData,
  ReportInitiativePage,
} from "../tests/pageObjects/report-initiative.page";
import { TIMEOUT_UI } from "./timeouts";

export const verifyAnnualInitiativeFields = async (
  editor: ReportInitiativePage
): Promise<void> => {
  await expect(editor.narrativeRequiredLabel).toBeVisible();
  await expect(editor.narrativeField).toBeVisible();
  await expect(editor.narrativeField).toHaveValue(/\S+/);
  await expect(editor.narrativeField).toBeEditable();
  await expect(editor.peopleServedRequiredLabel).toBeVisible();
  await expect(editor.peopleServedField).toBeVisible();
  await expect(editor.peopleServedField).toBeEditable();
};

export type AdminMetricControlsVisibility = "visible" | "hidden";
export type MetricsTableOptions = {
  adminControls?: boolean;
};
export type MetricTestData = InitiativeMetricData & {
  targetDisplay: string;
  currentDisplay: string;
};

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
    metricRow.getByRole("cell", { name: INITIATIVE_UI_NAMES.status.abandoned })
  ).toBeVisible({ timeout: TIMEOUT_UI });

  const hasPreviousValueColumn = await table
    .getByRole("columnheader", {
      name: INITIATIVE_UI_NAMES.column.previousAnnualValue,
    })
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
    .getByRole("columnheader", {
      name: INITIATIVE_UI_NAMES.column.previousAnnualValue,
    })
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
    name: INITIATIVE_UI_NAMES.button.addMetric,
  });
  const metricsTable = editor.page.getByRole("table").filter({
    has: editor.page.getByRole("columnheader", {
      name: INITIATIVE_UI_NAMES.column.metric,
    }),
  });
  const metricRows = metricsTable.locator("tbody").getByRole("row");
  const editAbandonButtons = metricRows.getByRole("button", {
    name: INITIATIVE_UI_NAMES.button.editOrAbandonMetric,
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
        name: INITIATIVE_UI_NAMES.button.editOrAbandonMetric,
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
    name: INITIATIVE_UI_NAMES.column.previousAnnualValue,
  });
  const hasPreviousValueColumn = await previousAnnualValueHeader
    .isVisible()
    .catch(() => false);
  const expectedHeaders = [
    INITIATIVE_UI_NAMES.column.number,
    INITIATIVE_UI_NAMES.column.status,
    INITIATIVE_UI_NAMES.column.metric,
    INITIATIVE_UI_NAMES.column.target,
    ...(hasPreviousValueColumn
      ? [INITIATIVE_UI_NAMES.column.previousAnnualValue]
      : []),
    INITIATIVE_UI_NAMES.column.currentValue,
    INITIATIVE_UI_NAMES.column.currentValueDate,
    ...(options.adminControls ? [INITIATIVE_UI_NAMES.column.actions] : []),
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
    await expect(cells.nth(1)).toHaveText(
      INITIATIVE_UI_NAMES.status.activeOrAbandoned
    );
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

    if (INITIATIVE_UI_NAMES.status.abandoned.test(status)) {
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
          name: INITIATIVE_UI_NAMES.button.editOrAbandonMetric,
        })
      ).toBeVisible({ timeout: TIMEOUT_UI });
    }
  }
};

export const verifyCheckpointTableHeaders = async (
  table: Locator
): Promise<void> => {
  await verifyTableHeaders(table, [
    INITIATIVE_UI_NAMES.column.number,
    INITIATIVE_UI_NAMES.column.checkpoint,
    INITIATIVE_UI_NAMES.column.readiness,
    INITIATIVE_UI_NAMES.column.attachments,
    INITIATIVE_UI_NAMES.column.status,
    INITIATIVE_UI_NAMES.column.actions,
  ]);
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
      await expect(cells.nth(4)).toHaveText(
        INITIATIVE_UI_NAMES.status.checkpoint
      );
      await expect(
        cells.nth(5).getByRole("button", {
          name: INITIATIVE_UI_NAMES.button.manageAttachment.prefix,
        })
      ).toBeVisible();
      await expect(
        cells.nth(5).getByRole("button", {
          name: INITIATIVE_UI_NAMES.button.commentAttachment.prefix,
        })
      ).toBeVisible();
    } else {
      await expect(cells.nth(4)).toHaveText(/^$/);
      await expect(cells.nth(5).getByRole("button")).toHaveCount(0);
    }
  }
};

export const getCheckpointStatusFromRow = async (
  row: Locator
): Promise<string> => {
  const status = (
    (await row.getByRole("cell").nth(4).textContent()) ?? ""
  ).trim();

  expect(status).toMatch(/\S+/);

  return status;
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

export const verifyManageAttachmentDrawerControls = async (
  drawer: Locator,
  fileName: string,
  checkpointStatus: string
): Promise<void> => {
  await expect(drawer).toContainText(fileName);
  await expect(drawer).toContainText(INITIATIVE_UI_NAMES.label.currentStatus);
  await expect(drawer).toContainText(
    new RegExp(escapeRegExp(checkpointStatus), "i")
  );

  const statusDropdown = drawer
    .getByRole("button", { name: INITIATIVE_UI_NAMES.label.optionalStatus })
    .first();
  const initiativeChoices = drawer.getByRole("checkbox");
  const checkpointDropdown = drawer
    .getByRole("button", {
      name: INITIATIVE_UI_NAMES.label.checkpoint,
    })
    .first();
  const deleteAttachmentButton = drawer.getByRole("button", {
    name: INITIATIVE_UI_NAMES.button.deleteAttachment,
  });
  const saveChangesButton = drawer.getByRole("button", {
    name: INITIATIVE_UI_NAMES.button.saveChanges,
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

export const waitForCommentResponse = (
  editor: ReportInitiativePage,
  method: "GET" | "POST"
) =>
  editor.page.waitForResponse(
    (response) =>
      response.request().method() === method &&
      response.url().includes("/comments/")
  );

export const expectCommentResponseStatus = async (
  response: Awaited<ReturnType<typeof waitForCommentResponse>>,
  expectedStatus: number
): Promise<void> => {
  expect(response.status()).toBe(expectedStatus);
};

export const expectCommentInResponse = async (
  response: Awaited<ReturnType<typeof waitForCommentResponse>>,
  commentText: string
): Promise<void> => {
  expect(response.status()).toBe(200);
  const comments = (await response.json()) as Array<{ comment?: string }>;
  expect(comments.some((comment) => comment.comment === commentText)).toBe(
    true
  );
};

export const openAttachmentCommentDrawerAndVerifyPreviousComment = async (
  editor: ReportInitiativePage,
  row: ReturnType<ReportInitiativePage["checkpointAttachmentRow"]>,
  fileName: string,
  commentText: string,
  options: { disabled?: boolean } = {}
): Promise<Locator> => {
  const commentsResponsePromise = waitForCommentResponse(editor, "GET");
  await editor.commentAttachmentButton(row, fileName).click();
  const commentsResponse = await commentsResponsePromise;
  await expectCommentInResponse(commentsResponse, commentText);

  const commentDrawer = editor.page.getByRole("dialog");
  const previousCommentFields = commentDrawer.locator(
    '[name^="previous-comment-"]'
  );
  await expect(previousCommentFields.first()).toBeAttached({
    timeout: TIMEOUT_UI,
  });

  const previousCommentCount = await previousCommentFields.count();
  let matchingCommentIndex = -1;
  for (let index = 0; index < previousCommentCount; index += 1) {
    if ((await previousCommentFields.nth(index).inputValue()) === commentText) {
      matchingCommentIndex = index;
      break;
    }
  }

  expect(matchingCommentIndex).toBeGreaterThanOrEqual(0);
  const previousCommentField = previousCommentFields.nth(matchingCommentIndex);
  if (options.disabled) {
    await expect(previousCommentField).toBeDisabled({
      timeout: TIMEOUT_UI,
    });
  }
  await expect(previousCommentField).toHaveValue(commentText, {
    timeout: TIMEOUT_UI,
  });

  return commentDrawer;
};
