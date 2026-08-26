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
  getCheckpointRow,
  getCheckpointStage,
  getCommentAttachmentButton,
  getManageAttachmentButton,
  getOpenInitiativeHeadingText,
  openReportFromDashboard,
  openCheckpointUploadDrawer,
  openInitiativeFromList,
  reopenInitiativeFromDashboard,
  returnToInitiativesDashboard,
  selectCheckpoint,
  uploadCheckpointAttachment,
  verifyAdminMetricControls,
  verifyCheckpointStageRows,
  verifyCheckpointTableHeaders,
  verifyMetricsTableHeaders,
  verifyMetricsTableRows,
  withUploadFixture,
  type ReportPeriod,
} from "../utils/report-edit-initiative-edit-helpers";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { TIMEOUT_UI } from "../utils/timeouts";

const REPORT_PERIOD: ReportPeriod = "annual";
const REPORT_PERIOD_LABEL = /Annual Report/i;

const verifyReportContextFromHeader = async (
  editor: ReportEditorPage
): Promise<void> => {
  await expect(
    editor.page
      .locator("#header p")
      .filter({ hasText: REPORT_PERIOD_LABEL })
      .first()
  ).toBeVisible({ timeout: TIMEOUT_UI });
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
    await openReportFromDashboard(editor, REPORT_PERIOD);
    await verifyReportContextFromHeader(editor);

    const table = editor.page.getByRole("table");
    await expect(table).toBeVisible({ timeout: TIMEOUT_UI });
    selectedInitiativeNumberAndName = await openInitiativeFromList(
      editor,
      table
    );
  });

  test.describe("report and initiative navigation", () => {
    test("should display an initiative heading that matches the selected initiative correctly for non-admin users @regression", async () => {
      const openInitiativeHeading = await getOpenInitiativeHeadingText(editor);
      expect(openInitiativeHeading).toBe(selectedInitiativeNumberAndName);
    });

    test("should return to the initiatives dashboard from initiative edit for non-admin users @regression", async () => {
      await returnToInitiativesDashboard(editor);

      const initiativesTable = editor.page.getByRole("table").filter({
        has: editor.page.getByRole("columnheader", { name: "Initiative" }),
      });
      await expect(initiativesTable).toBeVisible({
        timeout: TIMEOUT_UI,
      });
    });
  });

  test.describe("annual initiative fields", () => {
    test("should display a Narrative label, prepopulated editable text area, and be required for non-admin users @regression", async () => {
      const narrativeRequiredLabel = editor.page
        .locator("label")
        .filter({ hasText: /^NarrativeRequired$/i });
      const narrativeTextArea = editor.page.getByRole("textbox", {
        name: /^Narrative/i,
      });

      await expect(narrativeRequiredLabel).toBeVisible();
      await expect(narrativeTextArea).toBeVisible();
      await expect(narrativeTextArea).toHaveValue(/\S+/); // Ensure the text area is prepopulated with non-whitespace content
    });

    test("should display a Number of people served label, editable text area, and be required for non-admin users @regression", async () => {
      const peopleServedRequiredLabel = editor.page
        .locator("label")
        .filter({ hasText: /^Number of people servedRequired$/i });
      const peopleServedTextArea = editor.page.getByRole("textbox", {
        name: /Number of people served/i,
      });

      await expect(peopleServedRequiredLabel).toBeVisible();
      await expect(peopleServedTextArea).toBeVisible();
      await expect(peopleServedTextArea).toBeEditable();
    });
  });

  test.describe("metrics UI", () => {
    test("should display the Metrics heading and table for non-admin users @regression", async () => {
      const metricsHeading = editor.page.getByRole("heading", {
        name: /^Track Initiative Performance Metrics\s*Required$/i,
      });
      const metricsTable = editor.page.getByRole("table").filter({
        has: editor.page.getByRole("columnheader", { name: "Metric" }),
      });

      await expect(metricsHeading).toBeVisible({ timeout: TIMEOUT_UI });
      await expect(metricsTable).toBeVisible({ timeout: TIMEOUT_UI });
      const hasPreviousValueColumn =
        await verifyMetricsTableHeaders(metricsTable);
      await verifyMetricsTableRows(metricsTable, hasPreviousValueColumn);
    });
  });

  test.describe("checkpoint UI", () => {
    test("should display every checkpoint stage with an upload button and steps table for non-admin users @regression", async () => {
      const checkpointsHeading = editor.page.getByRole("heading", {
        name: /^Checkpoints$/i,
      });
      await expect(checkpointsHeading).toBeVisible();

      for (const stageLabel of CHECKPOINT_STAGE_LABELS) {
        const stage = getCheckpointStage(editor, stageLabel);
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
      const firstStage = getCheckpointStage(editor, CHECKPOINT_STAGE_LABELS[0]);
      const checkpointTable = firstStage.getByRole("table");
      const firstCheckpointRow = getCheckpointRow(
        checkpointTable,
        /Establish governance/i
      );
      const readinessCheckbox = firstCheckpointRow.getByRole("checkbox");

      await expect(readinessCheckbox).toBeVisible();
      await expect(readinessCheckbox).toBeEnabled();
      await expect(readinessCheckbox).not.toBeChecked();

      // Chakra's visual checkbox control covers the native input, so force the state change.
      await readinessCheckbox.check({ force: true });

      await expect(readinessCheckbox).toBeChecked();
    });

    test("should persist checkpoint readiness after reopening the initiative for a non-admin user @regression", async () => {
      const firstStage = getCheckpointStage(editor, CHECKPOINT_STAGE_LABELS[0]);
      const checkpointTable = firstStage.getByRole("table");
      const checkpointRow = getCheckpointRow(
        checkpointTable,
        /Establish governance/i
      );
      const readinessCheckbox = checkpointRow.getByRole("checkbox");

      await expect(readinessCheckbox).toBeEnabled();
      // Chakra's visual checkbox control covers the native input, so force the state change.
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

    test("should open the attachment upload drawer from a checkpoint stage for non-admin users @regression", async () => {
      const uploadDrawer = await openCheckpointUploadDrawer(
        editor,
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

      await selectCheckpoint(editor, uploadDrawer, GOVERNANCE_CHECKPOINT);

      await expect(fileInput).toBeEnabled();
    });

    test("should upload and persist a checkpoint attachment for a non-admin user @regression", async () => {
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

        const reopenedCheckpointRow = getCheckpointStage(
          editor,
          CHECKPOINT_STAGE_LABELS[0]
        )
          .getByRole("table")
          .locator("tbody")
          .getByRole("row")
          .filter({ hasText: fixture.fileName })
          .first();
        await expect(reopenedCheckpointRow).toContainText(fixture.fileName, {
          timeout: TIMEOUT_UI,
        });
      });
    });

    test("should open manage and comment controls for a checkpoint attachment for a non-admin user @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await uploadCheckpointAttachment(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture
        );
        const manageButton = getManageAttachmentButton(
          checkpointRow,
          fixture.fileName
        );
        const commentButton = getCommentAttachmentButton(
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

        await commentButton.click();
        const commentDrawer = editor.page.getByRole("dialog");
        await expect(
          commentDrawer.getByRole("heading", {
            name: /^Add comment to attachment$/i,
          })
        ).toBeVisible({ timeout: TIMEOUT_UI });
        await closeCommentDrawer(commentDrawer);
      });
    });

    test("should save checkpoint changes from the Manage Attachment drawer for a non-admin user @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const uploadedRow = await uploadCheckpointAttachment(
          editor,
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture
        );
        const manageButton = getManageAttachmentButton(
          uploadedRow,
          fixture.fileName
        );
        await expect(manageButton).toBeVisible({ timeout: TIMEOUT_UI });
        await manageButton.click();

        const manageDrawer = editor.page.getByRole("dialog");
        await expect(
          manageDrawer.getByRole("heading", { name: /^Manage Attachment$/i })
        ).toBeVisible({ timeout: TIMEOUT_UI });

        await selectCheckpoint(
          editor,
          manageDrawer,
          /0\.2 Submit project plan to CMS/i
        );

        const saveChangesButton = manageDrawer.getByRole("button", {
          name: /^Save changes$/i,
        });
        await expect(saveChangesButton).toBeEnabled();
        await saveChangesButton.click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });

        const updatedCheckpointRow = getCheckpointRow(
          getCheckpointStage(editor, CHECKPOINT_STAGE_LABELS[0]).getByRole(
            "table"
          ),
          fixture.fileName
        );
        await expect(updatedCheckpointRow).toContainText(
          /0\.2\s*Submit project plan to CMS/i,
          { timeout: TIMEOUT_UI }
        );
      });
    });

    test("should submit a comment for a checkpoint attachment for a non-admin user @regression", async () => {
      const commentText = `Initiative attachment comment ${createArtifactId()}`;
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
        const commentButton = getCommentAttachmentButton(
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
        await addCommentButton.click();

        await expect(commentDrawer).toContainText(commentText, {
          timeout: TIMEOUT_UI,
        });
        await closeCommentDrawer(commentDrawer);
      });
    });

    test("should require comment text before submitting an attachment comment for a non-admin user @regression", async () => {
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

        await getCommentAttachmentButton(
          checkpointRow,
          fixture.fileName
        ).click();

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

        await closeCommentDrawer(commentDrawer);
      });
    });
  });

  test.describe("permission UI", () => {
    test("should hide admin-only metric controls for non-admin users @regression", async () => {
      await verifyAdminMetricControls(editor, "hidden");
    });
  });
});
