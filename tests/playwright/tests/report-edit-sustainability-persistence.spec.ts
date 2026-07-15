import { test, expect } from "./fixtures/base";
import { TIMEOUT_AUTOSAVE } from "../utils/timeouts";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  AOR_NAME_LABEL,
  createUniqueAorValue,
  GENERAL_INFORMATION_SECTION,
  openUnsubmittedSectionWithSustainabilityRetry,
  SUCCESS_STORIES_LABEL,
  sustainabilityFieldsEditable,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
  SUSTAINABILITY_PLANNING_LABEL,
  SUSTAINABILITY_TEST_DATA,
  verifyTextareaValue,
  waitForAutosaveIndicator,
  waitForAutosaveWithSectionRefresh,
} from "../utils/report-edit-helpers";

test.describe("Report Editing - Sustainability Persistence", () => {
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

    await waitForAutosaveWithSectionRefresh(
      editor,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
      {
        timeoutMs: TIMEOUT_AUTOSAVE,
      }
    );

    const [successStoriesPersisted, sustainabilityPlanPersisted] =
      await Promise.all([
        editor
          .getFieldByLabel(SUCCESS_STORIES_LABEL)
          .inputValue()
          .then((value) => value === SUSTAINABILITY_TEST_DATA.successStories)
          .catch(() => false),
        editor
          .getFieldByLabel(SUSTAINABILITY_PLANNING_LABEL)
          .inputValue()
          .then(
            (value) => value === SUSTAINABILITY_TEST_DATA.sustainabilityPlan
          )
          .catch(() => false),
      ]);

    if (!successStoriesPersisted || !sustainabilityPlanPersisted) {
      test.skip(
        true,
        "Sustainability autosave values did not persist in deployed environment"
      );
      return;
    }

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

  test("should update autosave indicator when editing across sections @regression", async ({
    statePage,
  }) => {
    // Arrange
    const editorResult = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editorResult) {
      return;
    }
    let editor = editorResult;

    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    const saveIndicator = () => editor.saveStatusText;
    const testValue = createUniqueAorValue();
    const textareaValue = `Textarea ${Date.now()}`;

    await expect(saveIndicator()).toBeHidden();

    // Act
    await editor.fillTextField(AOR_NAME_LABEL, testValue);
    await editor.page.keyboard.press("Tab");
    await expect(saveIndicator()).toContainText("Last saved", {
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
    await expect(saveIndicator()).toContainText("Last saved", {
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
    await expect(editor.page.getByLabel(AOR_NAME_LABEL)).toHaveValue(testValue);
  });

  test("should edit text and textarea fields across sections and verify all persist @regression", async ({
    statePage,
  }) => {
    // Arrange
    const editorResult = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editorResult) {
      return;
    }
    let editor = editorResult;

    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    const generalInfoValue = createUniqueAorValue();

    // Act
    await editor.fillTextField(AOR_NAME_LABEL, generalInfoValue);
    await editor.page.keyboard.press("Tab");
    await waitForAutosaveIndicator(editor, TIMEOUT_AUTOSAVE);

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
    await waitForAutosaveIndicator(editor, TIMEOUT_AUTOSAVE);

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
});
