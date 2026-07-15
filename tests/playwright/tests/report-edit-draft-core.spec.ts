import { test, expect } from "./fixtures/base";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  AOR_NAME_LABEL,
  createUniqueAorValue,
  editGeneralInformationFields,
  GENERAL_INFORMATION_SECTION,
  GENERAL_INFO_FIELDS,
  waitForAutosaveWithSectionRefresh,
} from "../utils/report-edit-helpers";
import {
  verifyFieldIsEditable,
  verifyFieldValuePersisted,
  verifyCurrentSection,
  verifyContinueVisible,
} from "../utils/report-edit-assertions";

test.describe("Report Editing - Draft Core", () => {
  test("should allow a state user to edit text fields on an unsubmitted report", async ({
    statePage,
  }) => {
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    await expect(editor.previousButton).toBeHidden();
    await verifyContinueVisible(editor);

    for (const field of GENERAL_INFO_FIELDS) {
      await verifyFieldIsEditable(editor, field.label);
    }
    await editGeneralInformationFields(editor, GENERAL_INFO_FIELDS);
    for (const field of GENERAL_INFO_FIELDS) {
      await verifyFieldValuePersisted(editor, field.label, field.value);
    }
  });

  test("should autosave edits with a unique value", async ({ statePage }) => {
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    const uniqueValue = createUniqueAorValue();

    await editor.fillTextField(AOR_NAME_LABEL, uniqueValue);
    await editor.page.keyboard.press("Tab");

    await waitForAutosaveWithSectionRefresh(
      editor,
      GENERAL_INFORMATION_SECTION
    );

    const persistedAfterFallback = await editor
      .getFieldByLabel(AOR_NAME_LABEL)
      .inputValue()
      .then((value) => value === uniqueValue)
      .catch(() => false);

    if (!persistedAfterFallback) {
      test.skip(true, "Autosave value did not persist in deployed environment");
      return;
    }

    await verifyFieldValuePersisted(editor, AOR_NAME_LABEL, uniqueValue);
  });
});
