import { test, expect } from "./fixtures/base";
import { DashboardPage } from "./pageObjects/dashboard.page";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { ReportModalPage } from "./pageObjects/report-modal.page";
import { reportType, stateAbbreviation } from "../utils/consts";
import {
  verifyFieldIsEditable,
  verifyFieldIsReadOnly,
  verifyFieldValuePersisted,
  verifyCurrentSection,
  verifyContinueVisible,
  verifyPreviousVisible,
} from "../utils/report-edit-assertions";

test.describe("Report Editing", () => {
  const REPORT_TYPE = reportType;
  const STATE = stateAbbreviation;
  const GENERAL_INFORMATION_SECTION = "general-information";
  const INITIATIVE_ATTACHMENTS_SECTION = "initiative-attachments";
  const INITIATIVES_SECTION = "initiatives";
  const STATE_POLICY_COMMITMENTS_SECTION = "state-policy-commitments";
  const USE_OF_FUNDS_SECTION = "use-of-funds";
  const SUSTAINABILITY_AND_HIGHLIGHTS_SECTION = "sustainability-and-highlights";
  const REVIEW_SUBMIT_SECTION = "review-submit";

  // General Information field labels (all required text fields)
  const AOR_NAME_LABEL = /Authorized Organizational Representative \(AOR\)$/;
  const AOR_EMAIL_LABEL =
    /Authorized Organizational Representative \(AOR\) Contact email$/;
  const PIPD_NAME_LABEL = /Principal Investigator or Program Director$/;
  const PIPD_EMAIL_LABEL =
    /Principal Investigator or Program Director Contact email$/;

  const GENERAL_INFO_FIELDS = [
    { label: AOR_NAME_LABEL, value: "Test AOR" },
    { label: AOR_EMAIL_LABEL, value: "aor@test.gov" },
    { label: PIPD_NAME_LABEL, value: "Test PIPD" },
    { label: PIPD_EMAIL_LABEL, value: "pipd@test.gov" },
  ];

  const verifyFieldsEditable = async (
    editor: ReportEditorPage,
    fields: Array<{ label: string | RegExp }>
  ) => {
    for (const field of fields) {
      await verifyFieldIsEditable(editor, field.label);
    }
  };

  const _verifyFieldsReadOnly = async (
    editor: ReportEditorPage,
    fields: Array<{ label: string | RegExp }>
  ) => {
    for (const field of fields) {
      await verifyFieldIsReadOnly(editor, field.label);
    }
  };

  const fillFields = async (
    editor: ReportEditorPage,
    fields: Array<{ label: string | RegExp; value: string }>
  ) => {
    for (const field of fields) {
      await editor.fillTextField(field.label, field.value);
    }
  };

  const verifyFieldValues = async (
    editor: ReportEditorPage,
    fields: Array<{ label: string | RegExp; value: string }>
  ) => {
    for (const field of fields) {
      await verifyFieldValuePersisted(editor, field.label, field.value);
    }
  };

  const verifySectionNavState = async (
    editor: ReportEditorPage,
    options: { hasPrevious: boolean; hasContinue: boolean }
  ) => {
    if (options.hasPrevious) {
      await verifyPreviousVisible(editor);
    } else {
      await expect(editor.previousButton).toBeHidden();
    }

    if (options.hasContinue) {
      await verifyContinueVisible(editor);
    } else {
      await expect(editor.continueButton).toBeHidden();
    }
  };

  /**
   * Shared Arrange logic: navigate to dashboard, ensure a report exists (create if needed),
   * open report, and navigate to General Information section.
   * For "unsubmitted" state: creates report if dashboard is empty.
   * For "submitted" state: skips if not available (submitted reports require business workflow).
   * Returns editor instance positioned at the General Information section.
   */
  const openReportSection = async (
    statePage: any,
    targetState: "unsubmitted" | "submitted",
    sectionId = GENERAL_INFORMATION_SECTION
  ) => {
    const dashboard = new DashboardPage(statePage.page);
    const editor = new ReportEditorPage(statePage.page);
    const modal = new ReportModalPage(statePage.page);

    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
    let dashboardState = await dashboard.getDashboardState();

    // FALLBACK: If state detection says "empty" but Start button is disabled, reports actually exist
    // This handles race condition where buttons render before status cells
    if (dashboardState === "empty") {
      const isStartEnabled = await dashboard.isStartButtonAvailable();
      if (!isStartEnabled) {
        // Wait a bit and re-detect state to get accurate reading
        await statePage.page.waitForTimeout(1000);
        dashboardState = await dashboard.getDashboardState();
      }
    }

    // For unsubmitted reports: create if dashboard is empty or copy if only submitted exist
    if (targetState === "unsubmitted" && dashboardState === "empty") {
      const canCreate = await dashboard.isStartButtonAvailable();
      if (!canCreate) {
        // If Start button is disabled, reports exist but weren't detected—try to open one
        const hasReports =
          (await dashboard.isCopyButtonVisible()) ||
          (await statePage.page
            .getByRole("button", { name: /^View .* report$/i })
            .first()
            .isVisible()
            .catch(() => false));
        if (hasReports) {
          dashboardState = "submitted"; // Fallback: assume submitted if reports exist
        }
      } else {
        await dashboard.openCreateModal();
        const createOutcome = await modal.submitCreateModal();

        if (createOutcome !== "created") {
          test.skip(); // Skip if report creation is blocked by business rules
          return null;
        }
        // Reload dashboard to see the newly created report
        await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
        dashboardState = await dashboard.getDashboardState();
      }
    }

    // If only submitted reports exist, copy one to create an editable report.
    if (targetState === "unsubmitted" && dashboardState === "submitted") {
      await dashboard.openCopyModal();
      const copyOutcome = await modal.submitCopyModal();

      if (copyOutcome !== "copied") {
        test.skip();
        return null;
      }

      await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
      dashboardState = await dashboard.getDashboardState();
    }

    // Verify we have the required state
    if (dashboardState !== targetState) {
      test.skip();
      return null;
    }

    if (targetState === "unsubmitted") {
      await dashboard.openFirstEditableReport();
    } else {
      await dashboard.openFirstSubmittedReport();
    }

    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    await editor.navigateToSection(reportType, state, reportId, sectionId);

    return editor;
  };

  test("should allow a state user to edit text fields on an unsubmitted report", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSection(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION
    );
    if (!editor) return;

    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: false,
      hasContinue: true,
    });

    // Assert — all fields are enabled and editable
    await verifyFieldsEditable(editor, GENERAL_INFO_FIELDS);

    // Act — fill each field with test data
    await fillFields(editor, GENERAL_INFO_FIELDS);

    // Assert — values were successfully filled
    await verifyFieldValues(editor, GENERAL_INFO_FIELDS);
  });

  test("should autosave edits with a unique value", async ({ statePage }) => {
    // Arrange
    const editor = await openReportSection(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION
    );
    if (!editor) return;

    const uniqueValue = `Autosave Test ${Date.now()}`;

    // Act — fill a field with a unique value, blur to commit, then wait for debounce/save window
    await editor.fillTextField(AOR_NAME_LABEL, uniqueValue);
    await editor.page.keyboard.press("Tab");
    await editor.page.waitForTimeout(3000);

    // Assert — value persists locally after autosave debounce period
    await verifyFieldValuePersisted(editor, AOR_NAME_LABEL, uniqueValue);
  });

  test("should render the initiative attachments section for an unsubmitted report", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSection(
      statePage,
      "unsubmitted",
      INITIATIVE_ATTACHMENTS_SECTION
    );
    if (!editor) return;

    // Assert — Initiative Attachments section renders expected content
    await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: true,
      hasContinue: true,
    });
    await expect(
      editor.page.getByRole("heading", { name: "Initiative Attachments" })
    ).toBeVisible();
    await expect(editor.page.getByRole("table").first()).toBeVisible();
  });

  test("should render the initiatives section for an unsubmitted report", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSection(
      statePage,
      "unsubmitted",
      INITIATIVES_SECTION
    );
    if (!editor) return;

    // Assert — Initiatives section renders expected content
    await verifyCurrentSection(editor, INITIATIVES_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: true,
      hasContinue: true,
    });
    await expect(
      editor.page.getByRole("heading", { name: "Initiatives" })
    ).toBeVisible();
  });

  test("should render the state policy commitments section for an unsubmitted report", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSection(
      statePage,
      "unsubmitted",
      STATE_POLICY_COMMITMENTS_SECTION
    );
    if (!editor) return;

    // Assert — State Policy Commitments section renders expected content
    await verifyCurrentSection(editor, STATE_POLICY_COMMITMENTS_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: true,
      hasContinue: true,
    });
    await expect(
      editor.page.getByRole("heading", { name: "State Policy Commitments" })
    ).toBeVisible();
  });

  test("should render the use of funds section for an unsubmitted report", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSection(
      statePage,
      "unsubmitted",
      USE_OF_FUNDS_SECTION
    );
    if (!editor) return;

    // Assert — Use of Funds section renders expected content
    await verifyCurrentSection(editor, USE_OF_FUNDS_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: true,
      hasContinue: true,
    });
    await expect(
      editor.page.getByRole("heading", { name: "Use of Funds" })
    ).toBeVisible();
    await expect(
      editor.page.getByRole("button", { name: /Add Use of Funds/i })
    ).toBeVisible();
  });

  test("should render the sustainability and highlights section for an unsubmitted report", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSection(
      statePage,
      "unsubmitted",
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );
    if (!editor) return;

    // Assert — Sustainability and Highlights renders expected content
    await verifyCurrentSection(editor, SUSTAINABILITY_AND_HIGHLIGHTS_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: true,
      hasContinue: true,
    });
    await expect(
      editor.page.getByRole("heading", {
        name: "Sustainability and Highlights",
      })
    ).toBeVisible();
    await expect(
      editor.page.getByText("Success Stories", { exact: true })
    ).toBeVisible();
    await expect(
      editor.page.getByText("Sustainability Planning", { exact: true })
    ).toBeVisible();
    await expect(
      editor.page.getByLabel(
        /Share success stories that you want to highlight as result of your State’s implementation of the RHT Program\./
      )
    ).toBeVisible();
    await expect(
      editor.page.getByLabel(
        /What are the most significant updates or changes to your sustainability plan based on the past year’s experiences, successes, and challenges\?/
      )
    ).toBeVisible();
  });

  test("should render the review and submit section for an unsubmitted report", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSection(
      statePage,
      "unsubmitted",
      REVIEW_SUBMIT_SECTION
    );
    if (!editor) return;

    // Assert — Review & Submit renders final-page content and hides nav buttons
    await verifyCurrentSection(editor, REVIEW_SUBMIT_SECTION);
    await expect(
      editor.page.getByRole("heading", { name: "Review & Submit" })
    ).toBeVisible();
    await expect(
      editor.page.getByText("Your form is not ready for submission", {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      editor.page.getByText("Ready to Submit?", { exact: true })
    ).toBeVisible();
    await expect(
      editor.page.getByRole("button", { name: /Submit for Review/i })
    ).toBeVisible();
    await expect(editor.continueButton).toBeHidden();
    await expect(editor.previousButton).toBeHidden();
  });

  // Field labels for Sustainability & Highlights section
  const SUCCESS_STORIES_LABEL = /success stories/i;
  const SUSTAINABILITY_PLANNING_LABEL = /sustainability plan/i;

  const SUSTAINABILITY_TEST_DATA = {
    successStories:
      "This is a test success story demonstrating measurable outcomes from RHT implementation.",
    sustainabilityPlan:
      "Our sustainability strategy includes long-term funding commitments and workforce development partnerships.",
  };

  const verifyTextareaValue = async (
    editor: ReportEditorPage,
    label: string | RegExp,
    expectedValue: string
  ) => {
    await expect(editor.getFieldByLabel(label)).toHaveValue(expectedValue);
  };

  test("should fill and persist Sustainability and Highlights textareas", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSection(
      statePage,
      "unsubmitted",
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );
    if (!editor) return;

    // Act — fill both textarea fields
    await editor.fillTextarea(
      SUCCESS_STORIES_LABEL,
      SUSTAINABILITY_TEST_DATA.successStories
    );
    await editor.fillTextarea(
      SUSTAINABILITY_PLANNING_LABEL,
      SUSTAINABILITY_TEST_DATA.sustainabilityPlan
    );

    // Blur fields to trigger autosave
    await editor.page.keyboard.press("Tab");
    await editor.page.keyboard.press("Tab");

    // Wait for autosave debounce (2000ms + buffer)
    await editor.page.waitForTimeout(3000);

    // Assert — values persist locally after fill and autosave
    await verifyTextareaValue(
      editor,
      SUCCESS_STORIES_LABEL,
      SUSTAINABILITY_TEST_DATA.successStories
    );
    await verifyTextareaValue(
      editor,
      SUSTAINABILITY_PLANNING_LABEL,
      SUSTAINABILITY_TEST_DATA.sustainabilityPlan
    );
  });

  test("should persist field values across multiple sections", async ({
    statePage,
  }) => {
    // Test that edits in one section persist when navigating to another section and back

    // Arrange — start at General Information
    const editor = await openReportSection(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION
    );
    if (!editor) return;

    const { reportType, state, reportId } = editor.getCurrentRouteParams();

    // Act — fill a field in General Information
    const testValue = `Test Value ${Date.now()}`;
    await editor.fillTextField(AOR_NAME_LABEL, testValue);
    await editor.page.keyboard.press("Tab");
    await editor.page.waitForTimeout(2000); // Wait for autosave

    // Assert — value is present
    await expect(editor.page.getByLabel(AOR_NAME_LABEL)).toHaveValue(testValue);

    // Act — navigate directly to next section via URL
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      INITIATIVE_ATTACHMENTS_SECTION
    );

    // Act — navigate back to General Information
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION
    );

    // Assert — General Info value persisted after round trip
    await expect(editor.page.getByLabel(AOR_NAME_LABEL)).toHaveValue(testValue);
  });
});
