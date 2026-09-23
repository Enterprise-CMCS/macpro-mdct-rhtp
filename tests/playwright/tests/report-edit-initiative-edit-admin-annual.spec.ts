import { test, expect } from "./fixtures/base";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  createArtifactId,
  getReportTestRunId,
  INITIATIVES_SECTION,
} from "../utils/report-edit-shared-helpers";
import {
  CHECKPOINT_STAGE_LABELS,
  GOVERNANCE_CHECKPOINT,
  getCheckpointStatusFromRow,
  createMetricTestData,
  openAttachmentCommentDrawerAndVerifyPreviousComment,
  verifyAdminMetricControls,
  verifyCheckpointStageRows,
  verifyCheckpointTableHeaders,
  verifyManageAttachmentDrawerControls,
  verifyMetricsTableHeaders,
  verifyMetricsTableRows,
  verifyAbandonedMetricRow,
  verifyMetricRow,
  expectCommentResponseStatus,
  waitForCommentResponse,
  withUploadFixture,
} from "../utils/report-edit-initiative-edit-helpers";
import { ReportInitiativePage } from "./pageObjects/report-initiative.page";
import { TIMEOUT_AUTOSAVE, TIMEOUT_UI } from "../utils/timeouts";

const REPORT_PERIOD_LABEL = /Annual Report/i;

const verifyReportContextFromHeader = async (
  editor: ReportInitiativePage,
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
  let editor: ReportInitiativePage;
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

    editor = new ReportInitiativePage(result.page);
    await editor.openReportFromDashboard("annual");
    await verifyReportContextFromHeader(editor, REPORT_PERIOD_LABEL);

    await expect(editor.initiativesTable).toBeVisible({ timeout: TIMEOUT_UI });
    selectedInitiativeNumberAndName = await editor.openInitiativeFromList();
  });

  test("should display the selected initiative heading for admin users @regression", async () => {
    const openInitiativeHeading = (
      (await editor.openInitiativeHeading.textContent()) ?? ""
    ).trim();
    expect(openInitiativeHeading).toBe(selectedInitiativeNumberAndName);
  });

  test("should display admin-only metric controls for admin users @regression", async () => {
    await verifyAdminMetricControls(editor, "visible");
  });

  test("should return to the Initiatives dashboard using CTA", async () => {
    await editor.returnToInitiativesDashboard();
    await editor.expectInitiativesDashboardVisible();
  });

  test.describe("annual initiative fields", () => {
    test("should display annual initiative fields for admin users @regression", async () => {
      await editor.expectVisibleAnnualInitiativeFields();
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
      const peopleServedDisplayValue =
        peopleServedNumber.toLocaleString("en-US");

      await editor.fillTextField(/^Narrative/i, narrativeCleanValue);
      await editor.fillTextField(/^Narrative/i, narrativeEditValue);
      await editor.fillTextField(
        /Number of people served/i,
        peopleServedInputValue
      );
      await editor.page.keyboard.press("Tab");

      await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);

      await editor.returnToInitiativesDashboard();

      const reopenedInitiative = await editor.reopenInitiativeFromDashboard();
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
      const metricsHeading = editor.metricsHeading;
      const metricsTable = editor.metricsTable;

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

      await editor.addMetric(metric);

      const metricsTable = editor.metricsTable;
      await verifyMetricRow(metricsTable, metric);

      await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      await editor.returnToInitiativesDashboard();

      const reopenedInitiative = await editor.reopenInitiativeFromDashboard();
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      await verifyMetricRow(editor.metricsTable, metric);
    });

    test("should edit an active metric for admin users and persist the changes @regression", async () => {
      const metricsTable = editor.metricsTable;
      const originalMetric = createMetricTestData(
        `Admin metric to edit ${createArtifactId()}`,
        getRandomDateString()
      );
      await editor.addMetric(originalMetric);

      const activeMetricRow = editor.metricRow(originalMetric.name);
      await expect(activeMetricRow).toBeVisible({ timeout: TIMEOUT_UI });

      const metric = createMetricTestData(
        `Admin metric edited ${createArtifactId()}`,
        getRandomDateString()
      );

      await editor.editMetric(activeMetricRow, metric);

      await verifyMetricRow(metricsTable, metric);

      await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      await editor.returnToInitiativesDashboard();

      const reopenedInitiative = await editor.reopenInitiativeFromDashboard();
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      await verifyMetricRow(editor.metricsTable, metric);
    });

    test("should abandon a metric for admin users and persist the status @regression", async () => {
      const metricsTable = editor.metricsTable;
      const metric = createMetricTestData(
        `Admin metric to abandon ${createArtifactId()}`,
        getRandomDateString()
      );

      await editor.addMetric(metric);

      const activeMetricRow = editor.metricRow(metric.name);
      await expect(activeMetricRow).toBeVisible({ timeout: TIMEOUT_UI });

      await editor.abandonMetric(activeMetricRow);
      await verifyAbandonedMetricRow(metricsTable, metric.name);

      await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      await editor.returnToInitiativesDashboard();

      const reopenedInitiative = await editor.reopenInitiativeFromDashboard();
      expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

      await verifyAbandonedMetricRow(editor.metricsTable, metric.name);
    });
  });

  test.describe("checkpoint UI", () => {
    test("should display every annual checkpoint stage for admin users @regression", async () => {
      await expect(
        editor.page.getByRole("heading", { name: /^Checkpoints$/i })
      ).toBeVisible();

      for (const stageLabel of CHECKPOINT_STAGE_LABELS) {
        const stage = editor.checkpointStage(stageLabel);
        const checkpointTable = editor.checkpointTable(stageLabel);

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
      const readinessCheckbox = editor.checkpointReadinessCheckbox(
        CHECKPOINT_STAGE_LABELS[0],
        /Establish governance/i
      );

      await expect(readinessCheckbox).toBeEnabled();
      const wasChecked = await readinessCheckbox.isChecked();
      if (!wasChecked) {
        await readinessCheckbox.check({ force: true });
        await expect(readinessCheckbox).toBeChecked();
        await editor.waitForAutosaveWithSectionRefresh(INITIATIVES_SECTION);
      }

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
  });

  test.describe("attachments and comments", () => {
    test("should open the checkpoint upload drawer for admin users @regression", async () => {
      const uploadDrawer = await editor.openCheckpointUploadDrawer(
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

      await editor.selectCheckpoint(uploadDrawer, GOVERNANCE_CHECKPOINT);
      await expect(fileInput).toBeEnabled();
    });

    test("should upload and persist a checkpoint attachment for admin users @regression", async () => {
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

    test("should manage a checkpoint attachment for admin users @regression", async () => {
      await withUploadFixture(async (fixture) => {
        const checkpointRow = await editor.uploadCheckpointAttachment(
          CHECKPOINT_STAGE_LABELS[0],
          GOVERNANCE_CHECKPOINT,
          fixture.filePath,
          fixture.fileName
        );
        const checkpointStatus =
          await getCheckpointStatusFromRow(checkpointRow);

        const manageDrawer = await editor.openManageAttachment(
          checkpointRow,
          fixture.fileName
        );

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
          .locator('select[name="checkpoint"]')
          .first();
        await expect(checkpointSelect).toBeEnabled();
        const selectedCheckpointValue = await checkpointSelect.inputValue();
        expect(selectedCheckpointValue).toBeTruthy();

        const reportSaveResponsePromise = editor.page.waitForResponse(
          (response) => {
            if (
              response.request().method() !== "PUT" ||
              !response.url().includes("/reports/")
            ) {
              return false;
            }

            const payload = response.request().postDataJSON();
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

            expect(fixtureAttachment).toMatchObject({
              checkpoint: selectedCheckpointValue,
            });
            return true;
          },
          { timeout: TIMEOUT_AUTOSAVE }
        );
        await manageDrawer
          .getByRole("button", { name: /^Save changes$/i })
          .click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });
        await reportSaveResponsePromise;

        await editor.returnToInitiativesDashboard();
        const reopenedInitiative = await editor.reopenInitiativeFromDashboard();
        expect(reopenedInitiative).toBe(selectedInitiativeNumberAndName);

        const updatedAttachmentRow = editor.checkpointAttachmentRow(
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        await expect(updatedAttachmentRow).toHaveCount(1);
        await expect(updatedAttachmentRow).toContainText(fixture.fileName, {
          timeout: TIMEOUT_UI,
        });
      });
    });

    test("should delete and persist removal of a checkpoint attachment for admin users @regression", async () => {
      await withUploadFixture(async (fixture) => {
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
          .getByRole("button", { name: /^Delete attachment$/i })
          .click();
        await expect(manageDrawer).toBeHidden({ timeout: TIMEOUT_UI });

        const deletedAttachmentRow = editor.checkpointAttachmentRow(
          CHECKPOINT_STAGE_LABELS[0],
          fixture.fileName
        );
        await expect(deletedAttachmentRow).toHaveCount(0);

        await editor.returnToInitiativesDashboard();
        const reopenedInitiative = await editor.reopenInitiativeFromDashboard();
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

      await withUploadFixture(async (fixture) => {
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
          name: /^Comment$/i,
        });
        await commentDrawer
          .getByRole("radio", { name: /^External \(Shared with States\)$/i })
          .check();
        await commentField.fill(commentText);
        const createCommentResponsePromise = waitForCommentResponse(
          editor,
          "POST"
        );
        await commentDrawer
          .getByRole("button", { name: /^Add comment$/i })
          .click();
        const createCommentResponse = await createCommentResponsePromise;
        await expectCommentResponseStatus(createCommentResponse, 201);
        await expect(commentDrawer).toContainText(commentText, {
          timeout: TIMEOUT_UI,
        });
        await editor.closeDrawer(commentDrawer);
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
  });
});
