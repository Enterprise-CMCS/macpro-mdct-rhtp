import { test, expect } from "./fixtures/base";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { TIMEOUT_AUTOSAVE } from "../utils/timeouts";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  AOR_EMAIL_LABEL,
  AOR_NAME_LABEL,
  createUniqueAorValue,
  editGeneralInformationFields,
  GENERAL_INFORMATION_SECTION,
  INITIATIVE_ATTACHMENTS_SECTION,
  PIPD_EMAIL_LABEL,
  PIPD_NAME_LABEL,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
  waitForAutosaveIndicator,
} from "../utils/report-edit-helpers";
import {
  verifyFieldValuePersisted,
  verifyCurrentSection,
} from "../utils/report-edit-assertions";

test.describe("Report Editing - General Information Persistence", () => {
  const fillFields = async (
    editor: ReportEditorPage,
    fields: Array<{ label: string | RegExp; value: string }>
  ) => editGeneralInformationFields(editor, fields);

  const verifyFieldValues = async (
    editor: ReportEditorPage,
    fields: Array<{ label: string | RegExp; value: string }>
  ) => {
    for (const field of fields) {
      await verifyFieldValuePersisted(editor, field.label, field.value);
    }
  };

  test("should persist General Information field values via Initiative Attachments navigation @regression", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    const testValue = createUniqueAorValue();

    // Act
    await editor.fillTextField(AOR_NAME_LABEL, testValue);
    await editor.page.keyboard.press("Tab");
    await waitForAutosaveIndicator(editor, TIMEOUT_AUTOSAVE);

    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      INITIATIVE_ATTACHMENTS_SECTION
    );
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION
    );

    // Assert
    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    await expect(editor.page.getByLabel(AOR_NAME_LABEL)).toHaveValue(testValue);
  });

  test("should edit multiple General Information fields and verify persistence @regression", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    const testDataMultiple = [
      { label: AOR_NAME_LABEL, value: createUniqueAorValue() },
      { label: AOR_EMAIL_LABEL, value: `aor-${Date.now()}@test.gov` },
      { label: PIPD_NAME_LABEL, value: `PIPD Name ${Date.now()}` },
      { label: PIPD_EMAIL_LABEL, value: `pipd-${Date.now()}@test.gov` },
    ];

    // Act
    await fillFields(editor, testDataMultiple);
    await editor.page.keyboard.press("Tab");
    await waitForAutosaveIndicator(editor, TIMEOUT_AUTOSAVE);

    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION
    );

    // Assert
    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    await verifyFieldValues(editor, testDataMultiple);
  });
});
