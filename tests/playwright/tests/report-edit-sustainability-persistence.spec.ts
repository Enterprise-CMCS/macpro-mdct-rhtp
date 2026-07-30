import { test, expect } from "./fixtures/base";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import { verifyFieldValue } from "../utils/report-edit-assertions";
import {
  GENERAL_INFORMATION_SECTION,
  SUCCESS_STORIES_LABEL,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
  SUSTAINABILITY_PLANNING_LABEL,
  SUSTAINABILITY_TEST_DATA,
  confirmAutosaveIndicatorIsVisible,
} from "../utils/report-edit-helpers";

test.describe("Report Editing - Sustainability Persistence", () => {
  test("should fill Sustainability and Highlights text areas", async ({
    statePage,
  }) => {
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    await editor.fillTextField(
      SUCCESS_STORIES_LABEL,
      SUSTAINABILITY_TEST_DATA.successStories
    );
    await editor.fillTextField(
      SUSTAINABILITY_PLANNING_LABEL,
      SUSTAINABILITY_TEST_DATA.sustainabilityPlan
    );

    await verifyFieldValue(
      editor,
      SUCCESS_STORIES_LABEL,
      SUSTAINABILITY_TEST_DATA.successStories
    );
    await verifyFieldValue(
      editor,
      SUSTAINABILITY_PLANNING_LABEL,
      SUSTAINABILITY_TEST_DATA.sustainabilityPlan
    );
  });

  test("should update autosave indicator when editing Sustainability and Highlights @regression", async ({
    statePage,
  }) => {
    // Arrange
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    const saveIndicator = () => editor.saveStatusText;

    await expect(saveIndicator()).toBeHidden();

    // Act
    await editor.fillTextField(
      SUSTAINABILITY_PLANNING_LABEL,
      SUSTAINABILITY_TEST_DATA.sustainabilityPlan
    );
    await editor.fillTextField(
      SUCCESS_STORIES_LABEL,
      SUSTAINABILITY_TEST_DATA.successStories
    );
    await editor.page.keyboard.press("Tab");

    // Assert
    await confirmAutosaveIndicatorIsVisible(editor);
  });

  test("should edit text fields in Sustainability and Highlights and verify persistence @regression", async ({
    statePage,
  }) => {
    // Arrange
    const editorResult = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editorResult) {
      return;
    }
    let editor = editorResult;

    const { reportType, state, reportId } = editor.getCurrentRouteParams();

    // Act
    await editor.fillTextField(
      SUSTAINABILITY_PLANNING_LABEL,
      SUSTAINABILITY_TEST_DATA.sustainabilityPlan
    );
    await editor.fillTextField(
      SUCCESS_STORIES_LABEL,
      SUSTAINABILITY_TEST_DATA.successStories
    );

    await editor.navigateToSectionAndBack(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );

    // Assert
    await verifyFieldValue(
      editor,
      SUCCESS_STORIES_LABEL,
      SUSTAINABILITY_TEST_DATA.successStories
    );
    await verifyFieldValue(
      editor,
      SUSTAINABILITY_PLANNING_LABEL,
      SUSTAINABILITY_TEST_DATA.sustainabilityPlan
    );
  });
});
