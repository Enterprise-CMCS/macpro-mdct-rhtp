import { test, expect } from "./fixtures/base";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { TIMEOUT_AUTOSAVE } from "../utils/timeouts";
import { openReportSection } from "../utils/report-edit-arrange";
import {
  AOR_EMAIL_LABEL,
  AOR_NAME_LABEL,
  GENERAL_INFORMATION_SECTION,
  INITIATIVE_ATTACHMENTS_SECTION,
  openUnsubmittedSectionWithSustainabilityRetry,
  PIPD_EMAIL_LABEL,
  PIPD_NAME_LABEL,
  SUCCESS_STORIES_LABEL,
  sustainabilityFieldsEditable,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
  SUSTAINABILITY_PLANNING_LABEL,
  SUSTAINABILITY_TEST_DATA,
  verifyTextareaValue,
} from "../utils/report-edit-helpers";
import {
  verifyFieldValuePersisted,
  verifyCurrentSection,
} from "../utils/report-edit-assertions";

test.describe("Report Editing - Persistence", () => {
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

  test("should fill and persist Sustainability and Highlights textareas", async ({
    statePage,
  }) => {
    const section = await openUnsubmittedSectionWithSustainabilityRetry(
      statePage,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    await editor.fillTextarea(
      SUCCESS_STORIES_LABEL,
      SUSTAINABILITY_TEST_DATA.successStories
    );
    await editor.fillTextarea(
      SUSTAINABILITY_PLANNING_LABEL,
      SUSTAINABILITY_TEST_DATA.sustainabilityPlan
    );
    await editor.page.keyboard.press("Tab");
    await editor.page.keyboard.press("Tab");
    await expect(editor.saveStatusText).toBeVisible({
      timeout: TIMEOUT_AUTOSAVE,
    });
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

  test("should persist field values across multiple sections @regression", async ({
    statePage,
  }) => {
    // Arrange
    const section = await openReportSection(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    const testValue = `Test Value ${Date.now()}`;

    // Act
    await editor.fillTextField(AOR_NAME_LABEL, testValue);
    await editor.page.keyboard.press("Tab");
    await editor.saveStatusText.waitFor({
      state: "visible",
      timeout: TIMEOUT_AUTOSAVE,
    });

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
    const section = await openReportSection(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    const testDataMultiple = [
      { label: AOR_NAME_LABEL, value: `AOR Name ${Date.now()}` },
      { label: AOR_EMAIL_LABEL, value: `aor-${Date.now()}@test.gov` },
      { label: PIPD_NAME_LABEL, value: `PIPD Name ${Date.now()}` },
      { label: PIPD_EMAIL_LABEL, value: `pipd-${Date.now()}@test.gov` },
    ];

    // Act
    await fillFields(editor, testDataMultiple);
    await editor.page.keyboard.press("Tab");
    await editor.saveStatusText.waitFor({
      state: "visible",
      timeout: TIMEOUT_AUTOSAVE,
    });

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

  test("should edit text and textarea fields across sections and verify all persist @regression", async ({
    statePage,
  }) => {
    // Arrange
    const section = await openReportSection(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    let editor = section.editor;

    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    const generalInfoValue = `General Info ${Date.now()}`;

    // Act
    await editor.fillTextField(AOR_NAME_LABEL, generalInfoValue);
    await editor.page.keyboard.press("Tab");
    await editor.saveStatusText.waitFor({
      state: "visible",
      timeout: TIMEOUT_AUTOSAVE,
    });

    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );

    if (!(await sustainabilityFieldsEditable(editor))) {
      const retried = await openUnsubmittedSectionWithSustainabilityRetry(
        statePage,
        SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
      );
      if (!retried.ok) {
        test.skip(true, retried.reason);
        return;
      }
      editor = retried.editor;
    }

    const successStoriesValue = `Success Stories ${Date.now()}`;
    const sustainabilityValue = `Sustainability Plan ${Date.now()}`;

    await editor.fillTextarea(SUCCESS_STORIES_LABEL, successStoriesValue);
    await editor.fillTextarea(
      SUSTAINABILITY_PLANNING_LABEL,
      sustainabilityValue
    );
    await editor.page.keyboard.press("Tab");
    await editor.saveStatusText.waitFor({
      state: "visible",
      timeout: TIMEOUT_AUTOSAVE,
    });

    const activeParamsAfterRetry = editor.getCurrentRouteParams();

    // Assert
    await editor.navigateToSection(
      activeParamsAfterRetry.reportType,
      activeParamsAfterRetry.state,
      activeParamsAfterRetry.reportId,
      GENERAL_INFORMATION_SECTION
    );
    await expect(editor.page.getByLabel(AOR_NAME_LABEL)).toHaveValue(
      generalInfoValue
    );

    const activeParamsForSustainability = editor.getCurrentRouteParams();

    await editor.navigateToSection(
      activeParamsForSustainability.reportType,
      activeParamsForSustainability.state,
      activeParamsForSustainability.reportId,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );
    await verifyTextareaValue(
      editor,
      SUCCESS_STORIES_LABEL,
      successStoriesValue
    );
    await verifyTextareaValue(
      editor,
      SUSTAINABILITY_PLANNING_LABEL,
      sustainabilityValue
    );
  });

  test("should update autosave indicator when editing across sections @regression", async ({
    statePage,
  }) => {
    // Arrange
    const section = await openReportSection(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    let editor = section.editor;

    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    const saveIndicator = editor.saveStatusText;
    const testValue = `Test ${Date.now()}`;
    const textareaValue = `Textarea ${Date.now()}`;

    await expect(saveIndicator).toBeHidden();

    // Act
    await editor.fillTextField(AOR_NAME_LABEL, testValue);
    await editor.page.keyboard.press("Tab");
    await saveIndicator.waitFor({
      state: "visible",
      timeout: TIMEOUT_AUTOSAVE,
    });

    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );

    if (!(await sustainabilityFieldsEditable(editor))) {
      const retried = await openUnsubmittedSectionWithSustainabilityRetry(
        statePage,
        SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
      );
      if (!retried.ok) {
        test.skip(true, retried.reason);
        return;
      }
      editor = retried.editor;
    }

    await editor.fillTextarea(SUSTAINABILITY_PLANNING_LABEL, textareaValue);
    await editor.page.keyboard.press("Tab");
    await saveIndicator.waitFor({
      state: "visible",
      timeout: TIMEOUT_AUTOSAVE,
    });

    const activeParamsAfterRetry = editor.getCurrentRouteParams();

    // Assert
    await editor.navigateToSection(
      activeParamsAfterRetry.reportType,
      activeParamsAfterRetry.state,
      activeParamsAfterRetry.reportId,
      GENERAL_INFORMATION_SECTION
    );
    await expect(saveIndicator).toBeVisible();
    await expect(saveIndicator).toContainText("Last saved");
    await expect(editor.page.getByLabel(AOR_NAME_LABEL)).toHaveValue(testValue);
  });
});
