import { test, expect } from "./fixtures/base";
import { DashboardPage } from "./pageObjects/dashboard.page";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { ReportModalPage } from "./pageObjects/report-modal.page";
import { reportType, stateAbbreviation } from "../utils/consts";
import {
  verifyFieldIsEditable,
  verifyFieldIsReadOnly,
  verifyAutosaved,
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

  const verifyFieldsReadOnly = async (
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

  /**
   * Shared Arrange logic: navigate to dashboard, ensure a report exists (create if needed),
   * open report, and navigate to General Information section.
   * For "unsubmitted" state: creates report if dashboard is empty.
   * For "submitted" state: skips if not available (submitted reports require business workflow).
   * Returns editor instance positioned at the General Information section.
   */
  const navigateToGeneralInfoSection = async (
    statePage: any,
    targetState: "unsubmitted" | "submitted"
  ) => {
    const dashboard = new DashboardPage(statePage.page);
    const editor = new ReportEditorPage(statePage.page);
    const modal = new ReportModalPage(statePage.page);

    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
    let dashboardState = await dashboard.getDashboardState();

    // For unsubmitted reports: create if dashboard is empty
    if (targetState === "unsubmitted" && dashboardState === "empty") {
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
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION
    );

    return editor;
  };

  test("should allow a state user to edit text fields on an unsubmitted report", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await navigateToGeneralInfoSection(statePage, "unsubmitted");
    if (!editor) return;

    // Assert — all fields are enabled and editable
    await verifyFieldsEditable(editor, GENERAL_INFO_FIELDS);

    // Act — fill each field with test data
    await fillFields(editor, GENERAL_INFO_FIELDS);

    // Assert — values were successfully filled
    await verifyFieldValues(editor, GENERAL_INFO_FIELDS);

    // Assert/Act — proceed using in-form navigation controls and return
    await verifyContinueVisible(editor);
    await editor.clickContinue();
    await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);

    await verifyPreviousVisible(editor);
    await editor.clickPrevious();
    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);

    // Assert — previous navigation returns to the form with existing values intact
    await verifyFieldValues(editor, GENERAL_INFO_FIELDS);
  });

  test("should autosave edits and persist them after a page reload", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await navigateToGeneralInfoSection(statePage, "unsubmitted");
    if (!editor) return;

    const uniqueValue = `Autosave Test ${Date.now()}`;

    // Act — fill a field with a unique value and wait for autosave
    await editor.fillTextField(AOR_NAME_LABEL, uniqueValue);
    await verifyAutosaved(editor);

    // Act — reload the page and re-navigate to the same section
    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION
    );

    // Assert — value survived the reload
    await verifyFieldValuePersisted(editor, AOR_NAME_LABEL, uniqueValue);
  });

  test("should progress through initiative attachments to initiatives and back", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await navigateToGeneralInfoSection(statePage, "unsubmitted");
    if (!editor) return;

    // Act — navigate forward to Initiative Attachments
    await verifyContinueVisible(editor);
    await editor.clickContinue();

    // Assert — Initiative Attachments section renders expected content
    await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);
    await expect(
      editor.page.getByRole("heading", { name: "Initiative Attachments" })
    ).toBeVisible();
    await expect(editor.page.getByRole("table").first()).toBeVisible();

    // Act — continue to Initiatives section
    await verifyContinueVisible(editor);
    await editor.clickContinue();

    // Assert — Initiatives section renders expected content
    await verifyCurrentSection(editor, INITIATIVES_SECTION);
    await expect(
      editor.page.getByRole("heading", { name: "Initiatives" })
    ).toBeVisible();

    // Act/Assert — navigate backward section by section
    await verifyPreviousVisible(editor);
    await editor.clickPrevious();
    await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);

    await verifyPreviousVisible(editor);
    await editor.clickPrevious();
    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
  });

  test("should progress through state policy commitments and use of funds, then navigate back", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await navigateToGeneralInfoSection(statePage, "unsubmitted");
    if (!editor) return;

    // Act — advance to State Policy Commitments
    await verifyContinueVisible(editor);
    await editor.clickContinue();
    await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);

    await verifyContinueVisible(editor);
    await editor.clickContinue();
    await verifyCurrentSection(editor, INITIATIVES_SECTION);

    await verifyContinueVisible(editor);
    await editor.clickContinue();

    // Assert — State Policy Commitments section renders expected content
    await verifyCurrentSection(editor, STATE_POLICY_COMMITMENTS_SECTION);
    await expect(
      editor.page.getByRole("heading", { name: "State Policy Commitments" })
    ).toBeVisible();

    // Act — continue to Use of Funds
    await verifyContinueVisible(editor);
    await editor.clickContinue();

    // Assert — Use of Funds section renders expected content
    await verifyCurrentSection(editor, USE_OF_FUNDS_SECTION);
    await expect(
      editor.page.getByRole("heading", { name: "Use of Funds" })
    ).toBeVisible();
    await expect(
      editor.page.getByRole("button", { name: /Add Use of Funds/i })
    ).toBeVisible();

    // Act/Assert — navigate back through the same sections
    await verifyPreviousVisible(editor);
    await editor.clickPrevious();
    await verifyCurrentSection(editor, STATE_POLICY_COMMITMENTS_SECTION);

    await verifyPreviousVisible(editor);
    await editor.clickPrevious();
    await verifyCurrentSection(editor, INITIATIVES_SECTION);

    await verifyPreviousVisible(editor);
    await editor.clickPrevious();
    await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);
  });

  test("should display fields as read-only for a submitted report", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await navigateToGeneralInfoSection(statePage, "submitted");
    if (!editor) return;

    // Assert — all fields are disabled and read-only
    await verifyFieldsReadOnly(editor, GENERAL_INFO_FIELDS);
  });
});
