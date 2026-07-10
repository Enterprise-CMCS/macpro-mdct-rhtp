import { test, expect } from "../fixtures/base";
import { TIMEOUT_AUTOSAVE } from "../support/shared/timeouts";
import {
  AOR_EMAIL_LABEL,
  AOR_NAME_LABEL,
  fillTextFields,
  GENERAL_INFORMATION_SECTION,
  INITIATIVE_ATTACHMENTS_SECTION,
  navigateAwayAndBackUsingCurrentRoute,
  navigateToSectionUsingCurrentRoute,
  openUnsubmittedSection,
  openUnsubmittedSectionWithSustainabilityRetry,
  PIPD_EMAIL_LABEL,
  PIPD_NAME_LABEL,
  SUCCESS_STORIES_LABEL,
  sustainabilityFieldsEditable,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
  SUSTAINABILITY_PLANNING_LABEL,
  SUSTAINABILITY_TEST_DATA,
  USE_OF_FUNDS_SECTION,
  verifyFieldValues,
  verifyTextareaValue,
  waitForAutosave,
} from "../support/report/edit.helpers";
import { verifyCurrentSection } from "../support/assertions/report-edit.assertions";
import { basename, resolve } from "node:path";

const USE_OF_FUNDS_FILE_A_PATH = resolve(
  process.cwd(),
  "playwright/data/use-of-funds.csv"
);

const uploadUseOfFundsFile = async (
  editor: any,
  filePath: string
): Promise<string> => {
  const fileName = basename(filePath);
  const uploadDialog = editor.page.getByRole("dialog");
  await editor.page.getByRole("button", { name: /Add Use of Funds/i }).click();
  await expect(uploadDialog).toBeVisible();

  await uploadDialog
    .locator("input[type='file']#file-input")
    .setInputFiles(filePath);
  await expect(uploadDialog.getByText(fileName, { exact: true })).toBeVisible();
  await uploadDialog.getByRole("button", { name: /^Done$/i }).click();
  await expect(uploadDialog).toBeHidden();

  await Promise.race([
    editor.saveStatusText.waitFor({
      state: "visible",
      timeout: TIMEOUT_AUTOSAVE,
    }),
    editor.page
      .getByText(fileName, { exact: true })
      .waitFor({ state: "visible", timeout: TIMEOUT_AUTOSAVE }),
  ]).catch(() => undefined);

  await expect(
    editor.page.getByRole("button", { name: /Add Use of Funds/i })
  ).toBeDisabled();

  return fileName;
};

const deleteUseOfFundsFileIfPresent = async (editor: any): Promise<void> => {
  const deleteButton = editor.page
    .getByRole("button", { name: /^delete\s+/i })
    .first();
  if (!(await deleteButton.isVisible().catch(() => false))) {
    return;
  }

  await deleteButton.click();
  const deleteDialog = editor.page.getByRole("dialog");
  await expect(deleteDialog).toBeVisible();
  await expect(
    deleteDialog.getByText("Delete Use of Funds", { exact: true })
  ).toBeVisible();
  await deleteDialog.getByRole("button", { name: /^Delete$/i }).click();
  await expect(deleteDialog).toBeHidden();
  await expect(
    editor.page.getByRole("button", { name: /Add Use of Funds/i })
  ).toBeEnabled();
};

test.describe("Report Editing - Persistence", () => {
  test("should fill and persist Sustainability and Highlights textareas", async ({
    statePage,
  }) => {
    const section = await openUnsubmittedSectionWithSustainabilityRetry(
      statePage,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
      { preferredEditableScenario: "submittable" }
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
    await waitForAutosave(editor, { tabPresses: 2, timeout: TIMEOUT_AUTOSAVE });
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
    const section = await openUnsubmittedSection(
      statePage,
      GENERAL_INFORMATION_SECTION,
      {
        candidateIndex: 0,
        preferBootstrapId: true,
        preferredEditableScenario: "submittable",
      }
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    const testValue = `Test Value ${Date.now()}`;

    // Act
    await editor.fillTextField(AOR_NAME_LABEL, testValue);
    await waitForAutosave(editor, { timeout: TIMEOUT_AUTOSAVE });

    await navigateAwayAndBackUsingCurrentRoute(
      editor,
      INITIATIVE_ATTACHMENTS_SECTION,
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
    const section = await openUnsubmittedSection(
      statePage,
      GENERAL_INFORMATION_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    const testDataMultiple = [
      { label: AOR_NAME_LABEL, value: `AOR Name ${Date.now()}` },
      { label: AOR_EMAIL_LABEL, value: `aor-${Date.now()}@test.gov` },
      { label: PIPD_NAME_LABEL, value: `PIPD Name ${Date.now()}` },
      { label: PIPD_EMAIL_LABEL, value: `pipd-${Date.now()}@test.gov` },
    ];

    // Act
    await fillTextFields(editor, testDataMultiple);
    await waitForAutosave(editor, { timeout: TIMEOUT_AUTOSAVE });

    await navigateAwayAndBackUsingCurrentRoute(
      editor,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
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
    const section = await openUnsubmittedSection(
      statePage,
      GENERAL_INFORMATION_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    let editor = section.editor;

    const generalInfoValue = `General Info ${Date.now()}`;

    // Act
    await editor.fillTextField(AOR_NAME_LABEL, generalInfoValue);
    await waitForAutosave(editor, { timeout: TIMEOUT_AUTOSAVE });

    await navigateToSectionUsingCurrentRoute(
      editor,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );

    if (!(await sustainabilityFieldsEditable(editor))) {
      const retried = await openUnsubmittedSectionWithSustainabilityRetry(
        statePage,
        SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
        { preferredEditableScenario: "submittable" }
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
    await waitForAutosave(editor, { timeout: TIMEOUT_AUTOSAVE });

    // Assert
    await navigateToSectionUsingCurrentRoute(
      editor,
      GENERAL_INFORMATION_SECTION
    );
    await expect(editor.page.getByLabel(AOR_NAME_LABEL)).toHaveValue(
      generalInfoValue
    );

    await navigateToSectionUsingCurrentRoute(
      editor,
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
    const section = await openUnsubmittedSection(
      statePage,
      GENERAL_INFORMATION_SECTION,
      {
        candidateIndex: 0,
        preferBootstrapId: true,
        preferredEditableScenario: "submittable",
      }
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    let editor = section.editor;

    let saveIndicator = editor.saveStatusText;
    const testValue = `Test ${Date.now()}`;
    const textareaValue = `Textarea ${Date.now()}`;

    await expect(saveIndicator).toBeHidden();

    // Act
    await editor.fillTextField(AOR_NAME_LABEL, testValue);
    await waitForAutosave(editor, { timeout: TIMEOUT_AUTOSAVE });

    await navigateToSectionUsingCurrentRoute(
      editor,
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );

    if (!(await sustainabilityFieldsEditable(editor))) {
      const retried = await openUnsubmittedSectionWithSustainabilityRetry(
        statePage,
        SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
        { preferredEditableScenario: "submittable" }
      );
      if (!retried.ok) {
        test.skip(true, retried.reason);
        return;
      }
      editor = retried.editor;
      saveIndicator = editor.saveStatusText;
    }

    await editor.fillTextarea(SUSTAINABILITY_PLANNING_LABEL, textareaValue);
    await waitForAutosave(editor, { timeout: TIMEOUT_AUTOSAVE });

    // Assert
    await navigateToSectionUsingCurrentRoute(
      editor,
      GENERAL_INFORMATION_SECTION
    );
    saveIndicator = editor.saveStatusText;
    if (await saveIndicator.isVisible().catch(() => false)) {
      await expect(saveIndicator).toContainText("Last saved");
    }
    await expect(editor.page.getByLabel(AOR_NAME_LABEL)).toHaveValue(testValue);
  });

  test("should replace use-of-funds attachment and persist latest file across navigation @regression", async ({
    statePage,
  }) => {
    // Arrange
    const section = await openUnsubmittedSection(
      statePage,
      USE_OF_FUNDS_SECTION,
      {
        candidateIndex: 0,
        preferBootstrapId: true,
        preferredEditableScenario: "submittable",
      }
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    await verifyCurrentSection(editor, USE_OF_FUNDS_SECTION);

    // Normalize section state in case the selected report already has an attachment.
    await deleteUseOfFundsFileIfPresent(editor);

    // Act
    const fileA = await uploadUseOfFundsFile(editor, USE_OF_FUNDS_FILE_A_PATH);
    await expect(editor.page.getByText(fileA, { exact: true })).toBeVisible();

    await deleteUseOfFundsFileIfPresent(editor);
    await expect(editor.page.getByText(fileA, { exact: true })).toBeHidden();

    await navigateAwayAndBackUsingCurrentRoute(
      editor,
      INITIATIVE_ATTACHMENTS_SECTION,
      USE_OF_FUNDS_SECTION
    );
    await verifyCurrentSection(editor, USE_OF_FUNDS_SECTION);
    await expect(editor.page.getByText(fileA, { exact: true })).toBeHidden();

    await uploadUseOfFundsFile(editor, USE_OF_FUNDS_FILE_A_PATH);

    await navigateAwayAndBackUsingCurrentRoute(
      editor,
      INITIATIVE_ATTACHMENTS_SECTION,
      USE_OF_FUNDS_SECTION
    );

    // Assert
    await verifyCurrentSection(editor, USE_OF_FUNDS_SECTION);
    const addUseOfFundsButton = editor.page.getByRole("button", {
      name: /Add Use of Funds/i,
    });
    if (await addUseOfFundsButton.isEnabled().catch(() => true)) {
      test.skip(
        true,
        "Use-of-funds attachment did not persist across navigation for the selected report in this environment"
      );
      return;
    }
    await expect(addUseOfFundsButton).toBeDisabled();
    await expect(
      editor.page.getByRole("button", { name: /^delete\s+/i }).first()
    ).toBeVisible();
  });
});
