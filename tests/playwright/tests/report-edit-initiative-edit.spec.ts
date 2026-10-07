import { test, expect } from "./fixtures/base";
import { openEditableReportSectionForPeriodOrSkip } from "../utils/report-edit-arrange";
import {
  createArtifactId,
  getReportTestRunId,
  INITIATIVES_SECTION,
} from "../utils/report-edit-shared-helpers";
import * as initiativeEditHelpers from "../utils/report-edit-initiative-edit-helpers";
import {
  CHECKPOINT_STAGE_LABELS,
  GOVERNANCE_CHECKPOINT,
  INITIATIVE_UI_NAMES,
  ReportInitiativePage,
} from "./pageObjects/report-initiative.page";
import type { ReportPeriod } from "./pageObjects/dashboard.page";
import { TIMEOUT_AUTOSAVE, TIMEOUT_UI } from "../utils/timeouts";

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

type InitiativeSkipHandler = (reason: string) => void;

const setupAnnualInitiativeEditor = async (
  page: Parameters<typeof openEditableReportSectionForPeriodOrSkip>[0],
  skip: InitiativeSkipHandler
): Promise<{
  editor: ReportInitiativePage;
  selectedInitiativeNumberAndName: string;
}> => {
  const reportEditor = await openEditableReportSectionForPeriodOrSkip(
    page,
    REPORT_PERIOD,
    INITIATIVES_SECTION,
    skip
  );
  if (!reportEditor) {
    throw new Error(
      "openEditableReportSectionForPeriodOrSkip returned undefined without skipping the test"
    );
  }

  const editor = new ReportInitiativePage(reportEditor.page);
  await verifyReportContextFromHeader(editor);
  await expect(editor.initiativesTable).toBeVisible({ timeout: TIMEOUT_UI });

  const selectedInitiativeNumberAndName =
    await editor.openEditableInitiativeFromTable();

  return { editor, selectedInitiativeNumberAndName };
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

test.describe("Report Editing - Initiative Edit Page (Annual, Non-Admin)", () => {
  let editor: ReportInitiativePage;
  let selectedInitiativeNumberAndName = "";

  test.beforeEach(async ({ statePage }) => {
    const setup = await setupAnnualInitiativeEditor(statePage, (reason) =>
      test.skip(true, reason)
    );
    editor = setup.editor;
    selectedInitiativeNumberAndName = setup.selectedInitiativeNumberAndName;
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
      await expect(editor.initiativesTable).toBeVisible({
        timeout: TIMEOUT_UI,
      });
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
        await initiativeEditHelpers.verifyMetricsTableHeaders(metricsTable);
      await initiativeEditHelpers.verifyMetricsTableRows(
        metricsTable,
        hasPreviousValueColumn
      );
    });
  });

  test.describe("checkpoint UI", () => {
    test("should display every checkpoint stage with an upload button and steps table for non-admin users @regression", async () => {
      const checkpointsHeading = editor.checkpointsHeading;
      await expect(checkpointsHeading).toBeVisible();

      for (const stageLabel of CHECKPOINT_STAGE_LABELS) {
        const stage = editor.checkpointStage(stageLabel);
        const uploadButton = stage.getByRole("button", {
          name: INITIATIVE_UI_NAMES.button.uploadAttachments,
        });
        const checkpointTable = stage.getByRole("table");

        await expect(stage).toBeVisible({ timeout: TIMEOUT_UI });
        await expect(uploadButton).toBeVisible();
        await expect(uploadButton).toBeEnabled();
        await expect(checkpointTable).toBeVisible();
        await initiativeEditHelpers.verifyCheckpointTableHeaders(
          checkpointTable
        );
        await initiativeEditHelpers.verifyCheckpointStageRows(checkpointTable);
      }
    });

    test("should mark a checkpoint ready for CMS review for a non-admin user @regression", async () => {
      const readinessCheckbox = editor.checkpointReadinessCheckbox(
        CHECKPOINT_STAGE_LABELS[0],
        GOVERNANCE_CHECKPOINT
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
        GOVERNANCE_CHECKPOINT
      );

      await expect(readinessCheckbox).toBeEnabled();
      if (!(await readinessCheckbox.isChecked())) {
        await readinessCheckbox.check({ force: true });
        await expect(readinessCheckbox).toBeChecked();
        await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      }
      await expect(readinessCheckbox).toBeChecked();

      await editor.returnToInitiativesDashboard();
      const reopenedInitiative = await editor.openEditableInitiativeFromTable();
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      await expect(
        editor.checkpointReadinessCheckbox(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT
        )
      ).toBeChecked();
    });

    test("should open the attachment upload drawer from a checkpoint stage for non-admin users @regression", async () => {
      const uploadDrawer = await editor.openCheckpointUploadDrawer(
        CHECKPOINT_STAGE_LABELS[0]
      );
      await expect(
        uploadDrawer.getByRole("heading", {
          name: INITIATIVE_UI_NAMES.heading.uploadInitiativeAttachments,
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
        name: INITIATIVE_UI_NAMES.button.done,
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
      await initiativeEditHelpers.withUploadFixture(async (fixture) => {
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
        const reopenedInitiative =
          await editor.openEditableInitiativeFromTable();
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
      await initiativeEditHelpers.withUploadFixture(async (fixture) => {
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
          manageDrawer.getByRole("heading", {
            name: INITIATIVE_UI_NAMES.heading.manageAttachment,
          })
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
      await initiativeEditHelpers.withUploadFixture(async (fixture) => {
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
          manageDrawer.getByRole("heading", {
            name: INITIATIVE_UI_NAMES.heading.manageAttachment,
          })
        ).toBeVisible({ timeout: TIMEOUT_UI });

        await editor.selectCheckpoint(
          manageDrawer,
          /0\.2 Submit project plan to CMS/i
        );

        const saveChangesButton = manageDrawer.getByRole("button", {
          name: INITIATIVE_UI_NAMES.button.saveChanges,
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
      await initiativeEditHelpers.withUploadFixture(async (fixture) => {
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
            name: INITIATIVE_UI_NAMES.heading.addCommentToAttachment,
          })
        ).toBeVisible({ timeout: TIMEOUT_UI });

        const commentField = commentDrawer.getByRole("textbox", {
          name: INITIATIVE_UI_NAMES.field.comment,
        });
        const addCommentButton = commentDrawer.getByRole("button", {
          name: INITIATIVE_UI_NAMES.button.addComment,
        });
        await expect(commentField).toBeEditable();
        await expect(addCommentButton).toBeEnabled();

        await commentField.fill(commentText);
        const createCommentResponsePromise =
          initiativeEditHelpers.waitForCommentResponse(editor, "POST");
        await addCommentButton.click();
        const createCommentResponse = await createCommentResponsePromise;
        await initiativeEditHelpers.expectCommentResponseStatus(
          createCommentResponse,
          201
        );

        await expect(commentDrawer).toContainText(commentText, {
          timeout: TIMEOUT_UI,
        });
        await editor.closeDrawer(commentDrawer);
        // Verify comment persists after returning to dashboard and reopening
        await editor.returnToInitiativesDashboard();
        const reopenedInitiative =
          await editor.openEditableInitiativeFromTable();
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

        const reopenedCheckpointRow = editor.checkpointAttachmentRow(
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        const reopenedCommentDrawer =
          await initiativeEditHelpers.openAttachmentCommentDrawerAndVerifyPreviousComment(
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
      await initiativeEditHelpers.withUploadFixture(async (fixture) => {
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
            name: INITIATIVE_UI_NAMES.heading.addCommentToAttachment,
          })
        ).toBeVisible({ timeout: TIMEOUT_UI });

        const commentField = commentDrawer.getByRole("textbox", {
          name: INITIATIVE_UI_NAMES.field.comment,
        });
        const addCommentButton = commentDrawer.getByRole("button", {
          name: INITIATIVE_UI_NAMES.button.addComment,
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
      await initiativeEditHelpers.verifyAdminMetricControls(editor, "hidden");
    });
  });
});

test.describe("Report Editing - Initiative Edit Page (Annual, Admin)", () => {
  let editor: ReportInitiativePage;
  let selectedInitiativeNumberAndName = "";

  test.beforeEach(async ({ adminPage }) => {
    const setup = await setupAnnualInitiativeEditor(adminPage, (reason) =>
      test.skip(true, reason)
    );
    editor = setup.editor;
    selectedInitiativeNumberAndName = setup.selectedInitiativeNumberAndName;
  });

  test("should display the selected initiative heading for admin users @regression", async () => {
    const openInitiativeHeading = (
      (await editor.openInitiativeHeading.textContent()) ?? ""
    ).trim();
    expect(openInitiativeHeading).toBe(selectedInitiativeNumberAndName);
  });

  test("should display admin-only metric controls for admin users @regression", async () => {
    await initiativeEditHelpers.verifyAdminMetricControls(editor, "visible");
  });

  test("should return to the Initiatives dashboard using CTA", async () => {
    await editor.returnToInitiativesDashboard();
    await expect(editor.initiativesTable).toBeVisible({ timeout: TIMEOUT_UI });
  });

  test.describe("annual initiative fields", () => {
    test("should display annual initiative fields for admin users @regression", async () => {
      await initiativeEditHelpers.verifyAnnualInitiativeFields(editor);
    });

    test("should edit and persist annual initiative fields for admin users @regression", async () => {
      const narrativeValue = await editor.narrativeField.inputValue();
      const narrativeCleanValue = narrativeValue
        .replaceAll(/(?:\s+Admin narrative [a-f0-9]{10})+$/gi, "")
        .trimEnd();
      const narrativeEditValue = `${narrativeCleanValue} Admin narrative ${createArtifactId()}`;
      const peopleServedNumber = Math.floor(Math.random() * 1000000) + 1;
      const peopleServedInputValue = String(peopleServedNumber);
      const peopleServedDisplayValue =
        peopleServedNumber.toLocaleString("en-US");

      await editor.narrativeField.fill(narrativeCleanValue);
      await editor.narrativeField.fill(narrativeEditValue);
      await editor.peopleServedField.fill(peopleServedInputValue);
      await editor.page.keyboard.press("Tab");

      await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      await editor.returnToInitiativesDashboard();

      const reopenedInitiative = await editor.openEditableInitiativeFromTable();
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      await expect(editor.narrativeField).toHaveValue(narrativeEditValue);
      await expect(editor.peopleServedField).toHaveValue(
        peopleServedDisplayValue
      );
    });
  });

  test.describe("metrics UI", () => {
    test("should display the annual metrics table for admin users @regression", async () => {
      const metricsHeading = editor.metricsHeading;
      const metricsTable = editor.metricsTable;

      await expect(metricsHeading).toBeVisible({ timeout: TIMEOUT_UI });
      await expect(metricsTable).toBeVisible({ timeout: TIMEOUT_UI });
      const hasPreviousValueColumn =
        await initiativeEditHelpers.verifyMetricsTableHeaders(metricsTable, {
          adminControls: true,
        });
      await initiativeEditHelpers.verifyMetricsTableRows(
        metricsTable,
        hasPreviousValueColumn,
        {
          adminControls: true,
        }
      );
    });

    test("should add a metric for admin users and persist it after returning to the dashboard", async () => {
      const metric = initiativeEditHelpers.createMetricTestData(
        `Admin metric ${createArtifactId()}`,
        getRandomDateString()
      );

      await editor.addMetric(metric);
      await initiativeEditHelpers.verifyMetricRow(editor.metricsTable, metric);
      await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      await editor.returnToInitiativesDashboard();

      const reopenedInitiative = await editor.openEditableInitiativeFromTable();
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);
      await initiativeEditHelpers.verifyMetricRow(editor.metricsTable, metric);
    });

    test("should edit an active metric for admin users and persist the changes @regression", async () => {
      const originalMetric = initiativeEditHelpers.createMetricTestData(
        `Admin metric to edit ${createArtifactId()}`,
        getRandomDateString()
      );
      await editor.addMetric(originalMetric);

      const activeMetricRow = editor.metricRow(originalMetric.name);
      await expect(activeMetricRow).toBeVisible({ timeout: TIMEOUT_UI });

      const metric = initiativeEditHelpers.createMetricTestData(
        `Admin metric edited ${createArtifactId()}`,
        getRandomDateString()
      );
      await editor.editMetric(activeMetricRow, metric);
      await initiativeEditHelpers.verifyMetricRow(editor.metricsTable, metric);
      await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      await editor.returnToInitiativesDashboard();

      const reopenedInitiative = await editor.openEditableInitiativeFromTable();
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);
      await initiativeEditHelpers.verifyMetricRow(editor.metricsTable, metric);
    });

    test("should abandon a metric for admin users and persist the status @regression", async () => {
      const metric = initiativeEditHelpers.createMetricTestData(
        `Admin metric to abandon ${createArtifactId()}`,
        getRandomDateString()
      );
      await editor.addMetric(metric);

      const activeMetricRow = editor.metricRow(metric.name);
      await expect(activeMetricRow).toBeVisible({ timeout: TIMEOUT_UI });
      await editor.abandonMetric(activeMetricRow);
      await initiativeEditHelpers.verifyAbandonedMetricRow(
        editor.metricsTable,
        metric.name
      );
      await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      await editor.returnToInitiativesDashboard();

      const reopenedInitiative = await editor.openEditableInitiativeFromTable();
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);
      await initiativeEditHelpers.verifyAbandonedMetricRow(
        editor.metricsTable,
        metric.name
      );
    });
  });

  test.describe("checkpoint UI", () => {
    test("should display every annual checkpoint stage for admin users @regression", async () => {
      await expect(editor.checkpointsHeading).toBeVisible();

      for (const stageLabel of CHECKPOINT_STAGE_LABELS) {
        const stage = editor.checkpointStage(stageLabel);
        const checkpointTable = editor.checkpointTable(stageLabel);

        await expect(stage).toBeVisible({ timeout: TIMEOUT_UI });
        await expect(
          stage.getByRole("button", {
            name: INITIATIVE_UI_NAMES.button.uploadAttachments,
          })
        ).toBeEnabled();
        await expect(checkpointTable).toBeVisible();
        await initiativeEditHelpers.verifyCheckpointTableHeaders(
          checkpointTable
        );
        await initiativeEditHelpers.verifyCheckpointStageRows(checkpointTable);
      }
    });

    test("should persist checkpoint readiness for admin users @regression", async () => {
      const readinessCheckbox = editor.checkpointReadinessCheckbox(
        CHECKPOINT_STAGE_LABELS[0],
        GOVERNANCE_CHECKPOINT
      );

      await expect(readinessCheckbox).toBeEnabled();
      if (!(await readinessCheckbox.isChecked())) {
        await readinessCheckbox.check({ force: true });
        await expect(readinessCheckbox).toBeChecked();
        await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      }

      await editor.returnToInitiativesDashboard();
      const reopenedInitiative = await editor.openEditableInitiativeFromTable();
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);
      await expect(
        editor.checkpointReadinessCheckbox(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT
        )
      ).toBeChecked();
    });
  });

  test.describe("attachments and comments", () => {
    test("should open the checkpoint upload drawer for admin users @regression", async () => {
      const uploadDrawer = await editor.openCheckpointUploadDrawer(
        CHECKPOINT_STAGE_LABELS[0]
      );
      const fileInput = uploadDrawer.locator('input[type="file"]');

      await expect(
        uploadDrawer.getByRole("heading", {
          name: INITIATIVE_UI_NAMES.heading.uploadInitiativeAttachments,
        })
      ).toBeVisible();
      await expect(fileInput).toBeAttached();
      await expect(fileInput).toBeDisabled();
      await editor.selectCheckpoint(uploadDrawer, GOVERNANCE_CHECKPOINT);
      await expect(fileInput).toBeEnabled();
    });

    test("should upload and persist a checkpoint attachment for admin users @regression", async () => {
      await initiativeEditHelpers.withUploadFixture(async (fixture) => {
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
        const reopenedInitiative =
          await editor.openEditableInitiativeFromTable();
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);
        await expect(
          editor.checkpointAttachmentRow(
            CHECKPOINT_STAGE_LABELS[0],
            fixture.fileName
          )
        ).toContainText(fixture.fileName, { timeout: TIMEOUT_UI });
      });
    });

    test("should manage a checkpoint attachment for admin users @regression", async () => {
      await initiativeEditHelpers.withUploadFixture(async (fixture) => {
        const checkpointRow = await editor.uploadCheckpointAttachment(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture.filePath,
          fixture.fileName
        );
        const checkpointStatus =
          await initiativeEditHelpers.getCheckpointStatusFromRow(checkpointRow);
        const manageDrawer = await editor.openManageAttachment(
          checkpointRow,
          fixture.fileName
        );
        await initiativeEditHelpers.verifyManageAttachmentDrawerControls(
          manageDrawer,
          fixture.fileName,
          checkpointStatus
        );
        await manageDrawer.getByRole("button", { name: /^Close$/i }).click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });
      });
    });

    test("should save and persist checkpoint attachment changes for admin users @regression", async () => {
      await initiativeEditHelpers.withUploadFixture(async (fixture) => {
        const checkpointRow = await editor.uploadCheckpointAttachment(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture.filePath,
          fixture.fileName
        );
        const manageDrawer = await editor.openManageAttachment(
          checkpointRow,
          fixture.fileName
        );
        await editor.selectCheckpoint(
          manageDrawer,
          /0\.2 Submit project plan to CMS/i
        );
        const checkpointSelect = manageDrawer
          .locator(INITIATIVE_UI_NAMES.selector.checkpoint)
          .first();
        await expect(checkpointSelect).toBeEnabled();
        const selectedCheckpointValue = await checkpointSelect.inputValue();

        const reportSaveRequestPromise = editor.page.waitForRequest(
          (request) => {
            if (
              request.method() !== "PUT" ||
              !request.url().includes("/reports/")
            ) {
              return false;
            }

            const payload = request.postDataJSON();
            const attachments = payload.pages
              .flatMap(
                (page: { elements?: Array<{ answer?: unknown }> }) =>
                  page.elements ?? []
              )
              .flatMap((element: { answer?: unknown }) =>
                Array.isArray(element.answer) ? element.answer : []
              ) as Array<{
              attachment?: { name?: string };
              checkpoint?: string;
            }>;
            const fixtureAttachment = attachments.find(
              (attachment) => attachment.attachment?.name === fixture.fileName
            );

            return fixtureAttachment?.checkpoint === selectedCheckpointValue;
          },
          { timeout: TIMEOUT_AUTOSAVE }
        );
        await manageDrawer
          .getByRole("button", {
            name: INITIATIVE_UI_NAMES.button.saveChanges,
          })
          .click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });

        const reportSaveRequest = await reportSaveRequestPromise;
        const reportSaveResponse = await reportSaveRequest.response();
        expect(reportSaveResponse?.status()).toBeGreaterThanOrEqual(200);
        expect(reportSaveResponse?.status()).toBeLessThan(300);

        await editor.returnToInitiativesDashboard();
        const reopenedInitiative =
          await editor.openEditableInitiativeFromTable();
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);
        await expect(
          editor.checkpointAttachmentRow(
            CHECKPOINT_STAGE_LABELS[0],
            fixture.fileName
          )
        ).toHaveCount(1);
      });
    });

    test("should delete and persist removal of a checkpoint attachment for admin users @regression", async () => {
      await initiativeEditHelpers.withUploadFixture(async (fixture) => {
        const checkpointRow = await editor.uploadCheckpointAttachment(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture.filePath,
          fixture.fileName
        );
        const manageDrawer = await editor.openManageAttachment(
          checkpointRow,
          fixture.fileName
        );
        await manageDrawer
          .getByRole("button", {
            name: INITIATIVE_UI_NAMES.button.deleteAttachment,
          })
          .click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });
        await expect(
          editor.checkpointAttachmentRow(
            CHECKPOINT_STAGE_LABELS[0],
            fixture.fileName
          )
        ).toHaveCount(0);

        await editor.returnToInitiativesDashboard();
        const reopenedInitiative =
          await editor.openEditableInitiativeFromTable();
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);
        await expect(
          editor.checkpointAttachmentRow(
            CHECKPOINT_STAGE_LABELS[0],
            fixture.fileName
          )
        ).toHaveCount(0);
      });
    });

    test("should persist a checkpoint attachment comment for admin users @regression", async () => {
      const commentText = `Admin initiative comment ${getReportTestRunId()}`;

      await initiativeEditHelpers.withUploadFixture(async (fixture) => {
        const checkpointRow = await editor.uploadCheckpointAttachment(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture.filePath,
          fixture.fileName
        );
        await editor
          .commentAttachmentButton(checkpointRow, fixture.fileName)
          .click();

        const commentDrawer = editor.page.getByRole("dialog");
        const commentField = commentDrawer.getByRole("textbox", {
          name: INITIATIVE_UI_NAMES.field.comment,
        });
        await commentDrawer
          .getByRole("radio", { name: /^External \(Shared with States\)$/i })
          .check();
        await commentField.fill(commentText);
        const createCommentResponsePromise =
          initiativeEditHelpers.waitForCommentResponse(editor, "POST");
        await commentDrawer
          .getByRole("button", {
            name: INITIATIVE_UI_NAMES.button.addComment,
          })
          .click();
        const createCommentResponse = await createCommentResponsePromise;
        await initiativeEditHelpers.expectCommentResponseStatus(
          createCommentResponse,
          201
        );
        await expect(commentDrawer).toContainText(commentText, {
          timeout: TIMEOUT_UI,
        });
        await editor.closeDrawer(commentDrawer);
        await editor.returnToInitiativesDashboard();
        const reopenedInitiative =
          await editor.openEditableInitiativeFromTable();
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

        const reopenedCheckpointRow = editor.checkpointAttachmentRow(
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        const reopenedCommentDrawer =
          await initiativeEditHelpers.openAttachmentCommentDrawerAndVerifyPreviousComment(
            editor,
            reopenedCheckpointRow,
            fixture.fileName,
            commentText,
            { disabled: true }
          );
        await editor.closeDrawer(reopenedCommentDrawer);
      });
    });
  });
});
