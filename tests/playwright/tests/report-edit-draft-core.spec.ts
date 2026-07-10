import { test, expect } from "./fixtures/base";
import { TIMEOUT_AUTOSAVE } from "../utils/timeouts";
import { openReportSection } from "../utils/report-edit-arrange";
import {
  AOR_NAME_LABEL,
  GENERAL_INFORMATION_SECTION,
  GENERAL_INFO_FIELDS,
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

    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    await expect(editor.previousButton).toBeHidden();
    await verifyContinueVisible(editor);

    for (const field of GENERAL_INFO_FIELDS) {
      await verifyFieldIsEditable(editor, field.label);
      await editor.fillTextField(field.label, field.value);
      await verifyFieldValuePersisted(editor, field.label, field.value);
    }
  });

  test("should autosave edits with a unique value", async ({ statePage }) => {
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

    const uniqueValue = `Autosave Test ${Date.now()}`;

    await editor.fillTextField(AOR_NAME_LABEL, uniqueValue);
    await editor.page.keyboard.press("Tab");
    await expect(editor.saveStatusText).toBeVisible({
      timeout: TIMEOUT_AUTOSAVE,
    });
    await verifyFieldValuePersisted(editor, AOR_NAME_LABEL, uniqueValue);
  });
});
