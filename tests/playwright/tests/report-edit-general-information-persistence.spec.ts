import { test } from "./fixtures/base";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { TIMEOUT_AUTOSAVE } from "../utils/timeouts";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  AOR_EMAIL_LABEL,
  AOR_NAME_LABEL,
  createUniqueAorValue,
  editGeneralInformationFields,
  GENERAL_INFORMATION_SECTION,
  getReportTestRunId,
  PIPD_EMAIL_LABEL,
  PIPD_NAME_LABEL,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
  waitForAutosaveWithSectionRefresh,
} from "../utils/report-edit-shared-helpers";
import {
  verifyFieldValue,
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
      await verifyFieldValue(editor, field.label, field.value);
    }
  };

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
    const runId = getReportTestRunId();
    const testDataMultiple = [
      { label: AOR_NAME_LABEL, value: createUniqueAorValue(runId) },
      { label: AOR_EMAIL_LABEL, value: `aor-${runId}@test.gov` },
      { label: PIPD_NAME_LABEL, value: `PIPD Name ${runId}` },
      { label: PIPD_EMAIL_LABEL, value: `pipd-${runId}@test.gov` },
    ];

    // Act
    await fillFields(editor, testDataMultiple);
    await editor.page.keyboard.press("Tab");
    await waitForAutosaveWithSectionRefresh(
      editor,
      GENERAL_INFORMATION_SECTION,
      {
        timeoutMs: TIMEOUT_AUTOSAVE,
      }
    );

    await editor.navigateToSectionAndBack(
      reportType,
      state,
      reportId,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
      GENERAL_INFORMATION_SECTION
    );

    // Assert
    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    await verifyFieldValues(editor, testDataMultiple);
  });
});
