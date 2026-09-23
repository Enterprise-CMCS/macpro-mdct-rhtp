import { test, expect } from "./fixtures/base";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  getReportTestRunId,
  INITIATIVES_SECTION,
} from "../utils/report-edit-shared-helpers";
import {
  CHECKPOINT_STAGE_LABELS,
  GOVERNANCE_CHECKPOINT,
  openAttachmentCommentDrawerAndVerifyPreviousComment,
  verifyAdminMetricControls,
  verifyCheckpointStageRows,
  verifyCheckpointTableHeaders,
  verifyMetricsTableHeaders,
  verifyMetricsTableRows,
  expectCommentResponseStatus,
  waitForCommentResponse,
  withUploadFixture,
} from "../utils/report-edit-initiative-edit-helpers";
import {
  ReportInitiativePage,
  type ReportPeriod,
} from "./pageObjects/report-initiative.page";
import { TIMEOUT_UI } from "../utils/timeouts";

const REPORT_PERIOD: ReportPeriod = "annual";
const REPORT_PERIOD_LABEL = /Annual Report/i;

const verifyReportContextFromHeader = async (
  editor: ReportInitiativePage
): Promise<void> => {
  await expect(
    editor.page
      .locator("#header p")
      .filter({ hasText: REPORT_PERIOD_LABEL })
      .first()
  ).toBeVisible({ timeout: TIMEOUT_UI });
};

test.describe("Report Editing - Initiative Edit Page (Annual, Non-Admin)", () => {
  let editor: ReportInitiativePage;
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

    editor = new ReportInitiativePage(result.page);
    await editor.openReportFromDashboard(REPORT_PERIOD);
    await verifyReportContextFromHeader(editor);

    await expect(editor.initiativesTable).toBeVisible({ timeout: TIMEOUT_UI });
    selectedInitiativeNumberAndName = await editor.openInitiativeFromList();
  });

  test.describe("report and initiative navigation", () => {
    test("should display an initiative heading that matches the selected initiative correctly for non-admin users @regression", async () => {
      const openInitiativeHeading = (
        (await editor.openInitiativeHeading.textContent()) ?? ""
      ).trim();
      expect(openInitiativeHeading).toBe(selectedInitiativeNumberAndName);
    });

    test("should return to the initiatives dashboard from initiative edit for non-admin users @regression", async () => {
      await editor.returnToInitiativesDashboard();
      await editor.expectInitiativesDashboardVisible();
    });
  });

  test.describe("annual initiative fields", () => {
    test("should display a Narrative label, prepopulated editable text area, and be required for non-admin users @regression", async () => {
      await expect(editor.narrativeRequiredLabel).toBeVisible();
      await expect(editor.narrativeField).toBeVisible();
      await expect(editor.narrativeField).toHaveValue(/\S+/);
    });

    test("should display a Number of people served label, editable text area, and be required for non-admin users @regression", async () => {
      await expect(editor.peopleServedRequiredLabel).toBeVisible();
      await expect(editor.peopleServedField).toBeVisible();
      await expect(editor.peopleServedField).toBeEditable();
    });
  });

  test.describe("metrics UI", () => {
    test("should display the Metrics heading and table for non-admin users @regression", async () => {
      const metricsHeading = editor.metricsHeading;
      const metricsTable = editor.metricsTable;

      await expect(metricsHeading).toBeVisible({ timeout: TIMEOUT_UI });
      await expect(metricsTable).toBeVisible({ timeout: TIMEOUT_UI });
      const hasPreviousValueColumn =
        await verifyMetricsTableHeaders(metricsTable);
      await verifyMetricsTableRows(metricsTable, hasPreviousValueColumn);
    });
  });

  test.describe("checkpoint UI", () => {
    test("should display every checkpoint stage with an upload button and steps table for non-admin users @regression", async () => {
      const checkpointsHeading = editor.checkpointsHeading;
      await expect(checkpointsHeading).toBeVisible();

      for (const stageLabel of CHECKPOINT_STAGE_LABELS) {
        const stage = editor.checkpointStage(stageLabel);
        const uploadButton = stage.getByRole("button", {
          name: /^Upload attachments$/i,
        });
        const checkpointTable = stage.getByRole("table");

        await expect(stage).toBeVisible({ timeout: TIMEOUT_UI });
        await expect(uploadButton).toBeVisible();
        await expect(uploadButton).toBeEnabled();
        await expect(checkpointTable).toBeVisible();
        await verifyCheckpointTableHeaders(checkpointTable);
        await verifyCheckpointStageRows(checkpointTable);
      }
    });

    test("should mark a checkpoint ready for CMS review for a non-admin user @regression", async () => {
      const readinessCheckbox = editor.checkpointReadinessCheckbox(
        CHECKPOINT_STAGE_LABELS[0],
        /Establish governance/i
      );

      await expect(readinessCheckbox).toBeVisible();
      await expect(readinessCheckbox).toBeEnabled();
      if (!(await readinessCheckbox.isChecked())) {
        await readinessCheckbox.check({ force: true });
        await expect(readinessCheckbox).toBeChecked();
        await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      }
      await expect(readinessCheckbox).toBeChecked();
    });

    test("should persist checkpoint readiness after reopening the initiative for a non-admin user @regression", async () => {
      const readinessCheckbox = editor.checkpointReadinessCheckbox(
        CHECKPOINT_STAGE_LABELS[0],
        /Establish governance/i
      );

      await expect(readinessCheckbox).toBeEnabled();
      if (!(await readinessCheckbox.isChecked())) {
        await readinessCheckbox.check({ force: true });
        await expect(readinessCheckbox).toBeChecked();
        await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      }
      await expect(readinessCheckbox).toBeChecked();

      await editor.returnToInitiativesDashboard();
      const reopenedInitiative = await editor.reopenInitiativeFromDashboard();
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      await expect(
        editor.checkpointReadinessCheckbox(
          CHECKPOINT_STAGE_LABELS[0],
          /Establish governance/i
        )
      ).toBeChecked();
    });

    test("should open the attachment upload drawer from a checkpoint stage for non-admin users @regression", async () => {
      const uploadDrawer = await editor.openCheckpointUploadDrawer(
        CHECKPOINT_STAGE_LABELS[0]
      );
      await expect(
        uploadDrawer.getByRole("heading", {
          name: /Upload Initiative Attachments/i,
        })
      ).toBeVisible();

      const initiativeChoices = uploadDrawer.getByRole("checkbox");
      const checkpointDropdown = uploadDrawer
        .getByRole("button", {
          name: /Which stage\/checkpoint does this attachment apply to\?/i,
        })
        .first();
      const fileDropArea = uploadDrawer.getByLabel("file drop area");
      const fileInput = uploadDrawer.locator('input[type="file"]');
      const doneButton = uploadDrawer.getByRole("button", {
        name: /^Done$/i,
      });

      await expect(initiativeChoices.first()).toBeVisible();
      await expect(checkpointDropdown).toBeVisible();
      await expect(fileDropArea).toBeVisible();
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeDisabled();
      await expect(fileInput).toHaveAttribute("accept", /\./);
      await expect(doneButton).toBeVisible();

      await editor.selectCheckpoint(uploadDrawer, GOVERNANCE_CHECKPOINT);

      await expect(fileInput).toBeEnabled();
    });

    test("should upload and persist a checkpoint attachment for a non-admin user @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await editor.uploadCheckpointAttachment(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture.filePath,
          fixture.fileName
        );
        await expect(checkpointRow).toContainText(fixture.fileName, {
          timeout: TIMEOUT_UI,
        });
        await editor.returnToInitiativesDashboard();
        const reopenedInitiative = await editor.reopenInitiativeFromDashboard();
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

        const reopenedCheckpointRow = editor.checkpointAttachmentRow(
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        await expect(reopenedCheckpointRow).toContainText(fixture.fileName, {
          timeout: TIMEOUT_UI,
        });
      });
    });

    test("should open manage and comment controls for a checkpoint attachment for a non-admin user @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await editor.uploadCheckpointAttachment(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture.filePath,
          fixture.fileName
        );
        const manageButton = editor.manageAttachmentButton(
          checkpointRow,
          fixture.fileName
        );
        const commentButton = editor.commentAttachmentButton(
          checkpointRow,
          fixture.fileName
        );

        await expect(manageButton).toBeVisible({ timeout: TIMEOUT_UI });
        await expect(commentButton).toBeVisible({ timeout: TIMEOUT_UI });

        await manageButton.click();
        const manageDrawer = editor.page.getByRole("dialog");
        await expect(
          manageDrawer.getByRole("heading", { name: /^Manage Attachment$/i })
        ).toBeVisible({ timeout: TIMEOUT_UI });
        await manageDrawer.getByRole("button", { name: /^Close$/i }).click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });

        const commentDrawer = await editor.openCommentDrawer(
          checkpointRow,
          fixture.fileName
        );
        await editor.closeDrawer(commentDrawer);
      });
    });

    test("should save checkpoint changes from the Manage Attachment drawer for a non-admin user @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const uploadedRow = await editor.uploadCheckpointAttachment(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture.filePath,
          fixture.fileName
        );
        const manageButton = editor.manageAttachmentButton(
          uploadedRow,
          fixture.fileName
        );
        await expect(manageButton).toBeVisible({ timeout: TIMEOUT_UI });
        await manageButton.click();

        const manageDrawer = editor.page.getByRole("dialog");
        await expect(
          manageDrawer.getByRole("heading", { name: /^Manage Attachment$/i })
        ).toBeVisible({ timeout: TIMEOUT_UI });

        await editor.selectCheckpoint(
          manageDrawer,
          /0\.2 Submit project plan to CMS/i
        );

        const saveChangesButton = manageDrawer.getByRole("button", {
          name: /^Save changes$/i,
        });
        await expect(saveChangesButton).toBeEnabled();
        const reportSaveResponsePromise = editor.waitForSaveResponse();
        await saveChangesButton.click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });
        await reportSaveResponsePromise;

        const updatedCheckpointRow = editor.checkpointAttachmentRow(
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        await expect(updatedCheckpointRow).toContainText(fixture.fileName, {
          timeout: TIMEOUT_UI,
        });
      });
    });

    test("should submit and persist a comment for a checkpoint attachment for a non-admin user @regression", async () => {
      const commentText = `Initiative attachment comment ${getReportTestRunId()}`;
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await editor.uploadCheckpointAttachment(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture.filePath,
          fixture.fileName
        );
        await expect(checkpointRow).toContainText(fixture.fileName, {
          timeout: TIMEOUT_UI,
        });
        await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
        const commentButton = editor.commentAttachmentButton(
          checkpointRow,
          fixture.fileName
        );
        await expect(commentButton).toBeVisible({ timeout: TIMEOUT_UI });
        await commentButton.click();

        const commentDrawer = editor.page.getByRole("dialog");
        await expect(
          commentDrawer.getByRole("heading", {
            name: /^Add comment to attachment$/i,
          })
        ).toBeVisible({ timeout: TIMEOUT_UI });

        const commentField = commentDrawer.getByRole("textbox", {
          name: /^Comment$/i,
        });
        const addCommentButton = commentDrawer.getByRole("button", {
          name: /^Add comment$/i,
        });
        await expect(commentField).toBeEditable();
        await expect(addCommentButton).toBeEnabled();

        await commentField.fill(commentText);
        const createCommentResponsePromise = waitForCommentResponse(
          editor,
          "POST"
        );
        await addCommentButton.click();
        const createCommentResponse = await createCommentResponsePromise;
        await expectCommentResponseStatus(createCommentResponse, 201);

        await expect(commentDrawer).toContainText(commentText, {
          timeout: TIMEOUT_UI,
        });
        await editor.closeDrawer(commentDrawer);
        // Verify comment persists after returning to dashboard and reopening
        await editor.returnToInitiativesDashboard();
        const reopenedInitiative = await editor.reopenInitiativeFromDashboard();
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

        const reopenedCheckpointRow = editor.checkpointAttachmentRow(
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        const reopenedCommentDrawer =
          await openAttachmentCommentDrawerAndVerifyPreviousComment(
            editor,
            reopenedCheckpointRow,
            fixture.fileName,
            commentText,
            { disabled: true }
          );
        await editor.closeDrawer(reopenedCommentDrawer);
      });
    });

    test("should require comment text before submitting an attachment comment for a non-admin user @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await editor.uploadCheckpointAttachment(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture.filePath,
          fixture.fileName
        );
        await expect(checkpointRow).toContainText(fixture.fileName, {
          timeout: TIMEOUT_UI,
        });

        await editor
          .commentAttachmentButton(checkpointRow, fixture.fileName)
          .click();

        const commentDrawer = editor.page.getByRole("dialog");
        await expect(
          commentDrawer.getByRole("heading", {
            name: /^Add comment to attachment$/i,
          })
        ).toBeVisible({ timeout: TIMEOUT_UI });

        const commentField = commentDrawer.getByRole("textbox", {
          name: /^Comment$/i,
        });
        const addCommentButton = commentDrawer.getByRole("button", {
          name: /^Add comment$/i,
        });

        await expect(commentField).toHaveValue("");
        await addCommentButton.click();
        await expect(
          editor.page.getByText(/A comment is required\./i)
        ).toBeVisible({ timeout: TIMEOUT_UI });

        await editor.closeDrawer(commentDrawer);
      });
    });
  });

  test.describe("permission UI", () => {
    test("should hide admin-only metric controls for non-admin users @regression", async () => {
      await verifyAdminMetricControls(editor, "hidden");
    });
  });
});
