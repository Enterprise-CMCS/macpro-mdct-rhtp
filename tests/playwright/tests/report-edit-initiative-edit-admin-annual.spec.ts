import { test, expect } from "./fixtures/base";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  createArtifactId,
  INITIATIVES_SECTION,
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
  openReportFromDashboard,
  openCheckpointUploadDrawer,
  openInitiativeFromList,
  selectCheckpoint,
  uploadCheckpointAttachment,
  verifyAdminMetricControls,
  verifyCheckpointStageRows,
  verifyCheckpointTableHeaders,
  verifyEditableAnnualInitiativeFields,
  verifyInitiativesDashboardVisible,
  verifyManageAttachmentDrawerControls,
  verifyMetricsTableHeaders,
  verifyMetricsTableRows,
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
      await verifyEditableAnnualInitiativeFields(editor);
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
      await readinessCheckbox.check({ force: true });
      await expect(readinessCheckbox).toBeChecked();

      await returnToInitiativesDashboard(editor);
      const reopenedInitiative = await reopenInitiativeFromDashboard(editor);
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      const reopenedCheckpointRow = getCheckpointRow(
        getCheckpointStage(editor, CHECKPOINT_STAGE_LABELS[0]).getByRole(
          "table"
        ),
        /Establish governance/i
      );
      await expect(reopenedCheckpointRow.getByRole("checkbox")).toBeChecked();
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
        await commentField.fill(commentText);
        await addCommentButton.click();
        await expect(commentDrawer).toContainText(commentText, {
          timeout: TIMEOUT_UI,
        });
        await closeCommentDrawer(commentDrawer);
      });
    });
  });
});
