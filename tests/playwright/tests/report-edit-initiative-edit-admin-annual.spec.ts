import { test, expect } from "./fixtures/base";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  createArtifactId,
  INITIATIVES_SECTION,
  waitForAutosaveWithSectionRefresh,
} from "../utils/report-edit-shared-helpers";
import {
  CHECKPOINT_STAGE_LABELS,
  GOVERNANCE_CHECKPOINT,
  closeCommentDrawer,
  getCheckpointAttachmentRowByFileName,
  getCheckpointStage,
  getCheckpointStatusFromRow,
  getCommentAttachmentButton,
  getManageAttachmentButton,
  getOpenInitiativeHeadingText,
  getCheckpointRow,
  addMetric,
  abandonMetric,
  createMetricTestData,
  editMetric,
  getMetricsTable,
  openReportFromDashboard,
  openCheckpointUploadDrawer,
  openInitiativeFromList,
  selectCheckpoint,
  uploadCheckpointAttachment,
  verifyAdminMetricControls,
  verifyCheckpointStageRows,
  verifyCheckpointTableHeaders,
  verifyVisibleAnnualInitiativeFields,
  verifyInitiativesDashboardVisible,
  verifyManageAttachmentDrawerControls,
  verifyMetricsTableHeaders,
  verifyMetricsTableRows,
  verifyAbandonedMetricRow,
  verifyMetricRow,
  type ReportPeriod,
  returnToInitiativesDashboard,
  reopenInitiativeFromDashboard,
  withUploadFixture,
} from "../utils/report-edit-initiative-edit-helpers";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { TIMEOUT_UI } from "../utils/timeouts";

const REPORT_PERIOD: ReportPeriod = "annual";
const REPORT_PERIOD_LABEL = /Annual Report/i;

const verifyReportContextFromHeader = async (
  editor: ReportEditorPage,
  reportPeriodLabel: RegExp
): Promise<void> => {
  await expect(
    editor.page
      .locator("#header p")
      .filter({ hasText: reportPeriodLabel })
      .first()
  ).toBeVisible({ timeout: TIMEOUT_UI });
};

const getRandomDateString = (
  startDate = new Date(1999, 0, 1),
  endDate = new Date()
): string => {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const randomTime =
    startTime + Math.floor(Math.random() * (endTime - startTime + 1));

  const date = new Date(randomTime);

  return [
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");
};

test.describe("Report Editing - Initiative Edit Page (Annual, Admin)", () => {
  let editor: ReportEditorPage;
  let selectedInitiativeNumberAndName = "";

  test.beforeEach(async ({ adminPage }) => {
    const result = await openReportSectionOrSkip(
      adminPage,
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
    await openReportFromDashboard(editor, REPORT_PERIOD);
    await verifyReportContextFromHeader(editor, REPORT_PERIOD_LABEL);

    const table = editor.page.getByRole("table");
    await expect(table).toBeVisible({ timeout: TIMEOUT_UI });
    selectedInitiativeNumberAndName = await openInitiativeFromList(
      editor,
      table
    );
  });

  test("should display the selected initiative heading for admin users @regression", async () => {
    const openInitiativeHeading = await getOpenInitiativeHeadingText(editor);
    expect(openInitiativeHeading).toBe(selectedInitiativeNumberAndName);
  });

  test("should display admin-only metric controls for admin users @regression", async () => {
    await verifyAdminMetricControls(editor, "visible");
  });

  test("should return to the Initiatives dashboard using CTA", async () => {
    await returnToInitiativesDashboard(editor);
    await verifyInitiativesDashboardVisible(editor);
  });

  test.describe("annual initiative fields", () => {
    test("should display annual initiative fields for admin users @regression", async () => {
      await verifyVisibleAnnualInitiativeFields(editor);
    });

    test("should edit and persist annual initiative fields for admin users @regression", async () => {
      const narrativeValue = await editor
        .getTextField(/^Narrative/i)
        .inputValue();
      const narrativeCleanValue = narrativeValue
        .replaceAll(/(?:\s+Admin narrative [a-f0-9]{10})+$/gi, "")
        .trimEnd();
      const narrativeEditValue = `${narrativeCleanValue} Admin narrative ${createArtifactId()}`;
      const peopleServedNumber = Math.floor(Math.random() * 1000000) + 1;
      const peopleServedInputValue = String(peopleServedNumber);
      const peopleServedDisplayValue = peopleServedNumber.toLocaleString();

      await editor.fillTextField(/^Narrative/i, narrativeCleanValue);
      await editor.fillTextField(/^Narrative/i, narrativeEditValue);
      await editor.fillTextField(
        /Number of people served/i,
        peopleServedInputValue
      );
      await editor.page.keyboard.press("Tab");

      await waitForAutosaveWithSectionRefresh(editor, INITIATIVES_SECTION, {
        timeoutMs: TIMEOUT_UI,
      });

      await returnToInitiativesDashboard(editor);

      const reopenedInitiative = await reopenInitiativeFromDashboard(editor);
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      await expect(editor.getTextField(/^Narrative/i)).toHaveValue(
        narrativeEditValue
      );
      await expect(editor.getTextField(/Number of people served/i)).toHaveValue(
        peopleServedDisplayValue
      );
    });
  });

  test.describe("metrics UI", () => {
    test("should display the annual metrics table for admin users @regression", async () => {
      const metricsHeading = editor.page.getByRole("heading", {
        name: /^Track Initiative Performance Metrics\s*Required$/i,
      });
      const metricsTable = editor.page.getByRole("table").filter({
        has: editor.page.getByRole("columnheader", { name: "Metric" }),
      });

      await expect(metricsHeading).toBeVisible({ timeout: TIMEOUT_UI });
      await expect(metricsTable).toBeVisible({ timeout: TIMEOUT_UI });
      const hasPreviousValueColumn = await verifyMetricsTableHeaders(
        metricsTable,
        { adminControls: true }
      );
      await verifyMetricsTableRows(metricsTable, hasPreviousValueColumn, {
        adminControls: true,
      });
    });

    test("should add a metric for admin users and persist it after returning to the dashboard", async () => {
      const metric = createMetricTestData(
        `Admin metric ${createArtifactId()}`,
        getRandomDateString()
      );

      await addMetric(editor, metric);

      const metricsTable = getMetricsTable(editor);
      await verifyMetricRow(metricsTable, metric);

      await waitForAutosaveWithSectionRefresh(editor, INITIATIVES_SECTION, {
        timeoutMs: TIMEOUT_UI,
      });
      await returnToInitiativesDashboard(editor);

      const reopenedInitiative = await reopenInitiativeFromDashboard(editor);
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      await verifyMetricRow(getMetricsTable(editor), metric);
    });

    test("should edit an active metric for admin users and persist the changes @regression", async () => {
      const metricsTable = getMetricsTable(editor);
      const originalMetric = createMetricTestData(
        `Admin metric to edit ${createArtifactId()}`,
        getRandomDateString()
      );
      await addMetric(editor, originalMetric);

      const activeMetricRow = metricsTable
        .locator("tbody")
        .getByRole("row")
        .filter({ hasText: originalMetric.name });
      await expect(activeMetricRow).toBeVisible({ timeout: TIMEOUT_UI });

      const metric = createMetricTestData(
        `Admin metric edited ${createArtifactId()}`,
        getRandomDateString()
      );

      await editMetric(editor, activeMetricRow, metric);

      await verifyMetricRow(metricsTable, metric);

      await waitForAutosaveWithSectionRefresh(editor, INITIATIVES_SECTION, {
        timeoutMs: TIMEOUT_UI,
      });
      await returnToInitiativesDashboard(editor);

      const reopenedInitiative = await reopenInitiativeFromDashboard(editor);
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      await verifyMetricRow(getMetricsTable(editor), metric);
    });

    test("should abandon a metric for admin users and persist the status @regression", async () => {
      const metricsTable = getMetricsTable(editor);
      const metric = createMetricTestData(
        `Admin metric to abandon ${createArtifactId()}`,
        getRandomDateString()
      );

      await addMetric(editor, metric);

      const activeMetricRow = metricsTable
        .locator("tbody")
        .getByRole("row")
        .filter({ hasText: metric.name });
      await expect(activeMetricRow).toBeVisible({ timeout: TIMEOUT_UI });

      await abandonMetric(editor, activeMetricRow);
      await verifyAbandonedMetricRow(metricsTable, metric.name);

      await waitForAutosaveWithSectionRefresh(editor, INITIATIVES_SECTION, {
        timeoutMs: TIMEOUT_UI,
      });
      await returnToInitiativesDashboard(editor);

      const reopenedInitiative = await reopenInitiativeFromDashboard(editor);
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      await verifyAbandonedMetricRow(getMetricsTable(editor), metric.name);
    });
  });

  test.describe("checkpoint UI", () => {
    test("should display every annual checkpoint stage for admin users @regression", async () => {
      await expect(
        editor.page.getByRole("heading", { name: /^Checkpoints$/i })
      ).toBeVisible();

      for (const stageLabel of CHECKPOINT_STAGE_LABELS) {
        const stage = getCheckpointStage(editor, stageLabel);
        const checkpointTable = stage.getByRole("table");

        await expect(stage).toBeVisible({ timeout: TIMEOUT_UI });
        await expect(
          stage.getByRole("button", { name: /^Upload attachments$/i })
        ).toBeEnabled();
        await expect(checkpointTable).toBeVisible();
        await verifyCheckpointTableHeaders(checkpointTable);
        await verifyCheckpointStageRows(checkpointTable);
      }
    });

    test("should persist checkpoint readiness for admin users @regression", async () => {
      const checkpointTable = getCheckpointStage(
        editor,
        CHECKPOINT_STAGE_LABELS[0]
      ).getByRole("table");
      const checkpointRow = getCheckpointRow(
        checkpointTable,
        /Establish governance/i
      );
      const readinessCheckbox = checkpointRow.getByRole("checkbox");

      await expect(readinessCheckbox).toBeEnabled();
      const wasChecked = await readinessCheckbox.isChecked();
      if (wasChecked) {
        await readinessCheckbox.uncheck({ force: true });
      } else {
        await readinessCheckbox.check({ force: true });
      }
      await expect(readinessCheckbox).toBeChecked({ checked: !wasChecked });
      await waitForAutosaveWithSectionRefresh(editor, INITIATIVES_SECTION, {
        timeoutMs: TIMEOUT_UI,
      });

      await returnToInitiativesDashboard(editor);
      const reopenedInitiative = await reopenInitiativeFromDashboard(editor);
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      const reopenedCheckpointRow = getCheckpointRow(
        getCheckpointStage(editor, CHECKPOINT_STAGE_LABELS[0]).getByRole(
          "table"
        ),
        /Establish governance/i
      );
      await expect(reopenedCheckpointRow.getByRole("checkbox")).toBeChecked({
        checked: !wasChecked,
      });
    });
  });

  test.describe("attachments and comments", () => {
    test("should open the checkpoint upload drawer for admin users @regression", async () => {
      const uploadDrawer = await openCheckpointUploadDrawer(
        editor,
        CHECKPOINT_STAGE_LABELS[0]
      );
      const fileInput = uploadDrawer.locator('input[type="file"]');

      await expect(
        uploadDrawer.getByRole("heading", {
          name: /Upload Initiative Attachments/i,
        })
      ).toBeVisible();
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeDisabled();

      await selectCheckpoint(editor, uploadDrawer, GOVERNANCE_CHECKPOINT);
      await expect(fileInput).toBeEnabled();
    });

    test("should upload and persist a checkpoint attachment for admin users @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await uploadCheckpointAttachment(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture
        );
        await expect(checkpointRow).toContainText(fixture.fileName, {
          timeout: TIMEOUT_UI,
        });

        await returnToInitiativesDashboard(editor);
        const reopenedInitiative = await reopenInitiativeFromDashboard(editor);
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

        const reopenedCheckpointRow = getCheckpointAttachmentRowByFileName(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        await expect(reopenedCheckpointRow).toContainText(fixture.fileName, {
          timeout: TIMEOUT_UI,
        });
      });
    });

    test("should manage a checkpoint attachment for admin users @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await uploadCheckpointAttachment(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture
        );
        const checkpointStatus =
          await getCheckpointStatusFromRow(checkpointRow);

        const manageButton = getManageAttachmentButton(
          checkpointRow,
          fixture.fileName
        );
        await expect(manageButton).toBeVisible({ timeout: TIMEOUT_UI });
        await manageButton.click();

        const manageDrawer = editor.page.getByRole("dialog");
        await expect(
          manageDrawer.getByRole("heading", {
            name: /^Manage Attachment$/i,
          })
        ).toBeVisible({ timeout: TIMEOUT_UI });

        await verifyManageAttachmentDrawerControls(
          manageDrawer,
          fixture.fileName,
          checkpointStatus
        );

        await manageDrawer.getByRole("button", { name: /^Close$/i }).click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });
      });
    });

    test("should save and persist checkpoint attachment changes for admin users @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await uploadCheckpointAttachment(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture
        );

        await getManageAttachmentButton(
          checkpointRow,
          fixture.fileName
        ).click();

        const manageDrawer = editor.page.getByRole("dialog");
        await expect(
          manageDrawer.getByRole("heading", {
            name: /^Manage Attachment$/i,
          })
        ).toBeVisible({ timeout: TIMEOUT_UI });

        await selectCheckpoint(
          editor,
          manageDrawer,
          /0\.2 Submit project plan to CMS/i
        );
        await manageDrawer
          .getByRole("button", { name: /^Save changes$/i })
          .click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });

        await returnToInitiativesDashboard(editor);
        const reopenedInitiative = await reopenInitiativeFromDashboard(editor);
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

        const updatedCheckpointRow = getCheckpointAttachmentRowByFileName(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        await expect(updatedCheckpointRow).toContainText(
          /0\.2\s*Submit project plan to CMS/i,
          { timeout: TIMEOUT_UI }
        );
      });
    });

    test("should delete and persist removal of a checkpoint attachment for admin users @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await uploadCheckpointAttachment(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture
        );

        await getManageAttachmentButton(
          checkpointRow,
          fixture.fileName
        ).click();

        const manageDrawer = editor.page.getByRole("dialog");
        await expect(
          manageDrawer.getByRole("heading", {
            name: /^Manage Attachment$/i,
          })
        ).toBeVisible({ timeout: TIMEOUT_UI });

        await manageDrawer
          .getByRole("button", { name: /^Delete attachment$/i })
          .click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });

        const deletedAttachmentRow = getCheckpointAttachmentRowByFileName(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        await expect(deletedAttachmentRow).toHaveCount(0);

        await waitForAutosaveWithSectionRefresh(editor, INITIATIVES_SECTION, {
          timeoutMs: TIMEOUT_UI,
        });
        await returnToInitiativesDashboard(editor);
        const reopenedInitiative = await reopenInitiativeFromDashboard(editor);
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

        await expect(
          getCheckpointAttachmentRowByFileName(
            editor,
            CHECKPOINT_STAGE_LABELS[0],
            fixture.fileName
          )
        ).toHaveCount(0);
      });
    });

    test("should add a comment to a checkpoint attachment for admin users @regression", async () => {
      const commentText = `Admin initiative comment ${createArtifactId()}`;
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await uploadCheckpointAttachment(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture
        );

        await getCommentAttachmentButton(
          checkpointRow,
          fixture.fileName
        ).click();
        const commentDrawer = editor.page.getByRole("dialog");
        const commentField = commentDrawer.getByRole("textbox", {
          name: /^Comment$/i,
        });
        const addCommentButton = commentDrawer.getByRole("button", {
          name: /^Add comment$/i,
        });

        await expect(commentField).toBeEditable();
        await commentDrawer
          .getByRole("radio", { name: /^External \(Shared with States\)$/i })
          .check();
        await commentField.fill(commentText);
        await addCommentButton.click();
        await expect(commentDrawer).toContainText(commentText, {
          timeout: TIMEOUT_UI,
        });
        await closeCommentDrawer(commentDrawer);
      });
    });

    test("should persist a checkpoint attachment comment for admin users @regression", async () => {
      const commentText = `Admin initiative comment ${createArtifactId()}`;

      await withUploadFixture(async (fixture) => {
        const checkpointRow = await uploadCheckpointAttachment(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture
        );

        await getCommentAttachmentButton(
          checkpointRow,
          fixture.fileName
        ).click();

        const commentDrawer = editor.page.getByRole("dialog");
        const commentField = commentDrawer.getByRole("textbox", {
          name: /^Comment$/i,
        });
        await commentDrawer
          .getByRole("radio", { name: /^External \(Shared with States\)$/i })
          .check();
        await commentField.fill(commentText);
        await commentDrawer
          .getByRole("button", { name: /^Add comment$/i })
          .click();
        await expect(commentDrawer).toContainText(commentText, {
          timeout: TIMEOUT_UI,
        });
        await closeCommentDrawer(commentDrawer);
        await waitForAutosaveWithSectionRefresh(editor, INITIATIVES_SECTION, {
          timeoutMs: TIMEOUT_UI,
        });

        await returnToInitiativesDashboard(editor);
        const reopenedInitiative = await reopenInitiativeFromDashboard(editor);
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

        const reopenedCheckpointRow = getCheckpointAttachmentRowByFileName(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        await getCommentAttachmentButton(
          reopenedCheckpointRow,
          fixture.fileName
        ).click();

        const reopenedCommentDrawer = editor.page.getByRole("dialog");
        await expect(reopenedCommentDrawer).toContainText(commentText, {
          timeout: TIMEOUT_UI,
        });
        await closeCommentDrawer(reopenedCommentDrawer);
      });
    });
  });
});
