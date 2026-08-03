import { expect, type Locator } from "@playwright/test";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import {
  STATE_POLICY_COMMITMENTS_SECTION,
  OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH,
  escapeRegExp,
} from "./report-edit-shared-helpers";
import { TIMEOUT_AUTOSAVE, TIMEOUT_UI } from "./timeouts";

const COMMITMENT_TOGGLE_NAME = /^[A-Z]\.\d+\./;
const COMMITMENT_LINK_LABEL = /^Link(?:\s*\d+)?$/i;
const COMMITMENT_NOTES_LABEL = /^Notes(?:\s*\(optional\))?$/i;

export type CommitmentEdits = {
  statusValue: string;
  linkValue: string;
  notesValue: string;
  attachmentFileName: string;
};

const getCommitmentStatusSelect = (container: Locator): Locator =>
  container.locator('select[name="commitment-status"]').first();

const getCommitmentLinkValues = async (container: Locator): Promise<string[]> =>
  container.getByLabel(COMMITMENT_LINK_LABEL).evaluateAll((elements) =>
    elements
      .map((element) => {
        if (!(element instanceof HTMLInputElement)) {
          return "";
        }

        return element.value.trim();
      })
      .filter((value) => value.length > 0)
  );

const setCommitmentStatus = async (
  container: Locator
): Promise<string | null> => {
  const statusField = getCommitmentStatusSelect(container);
  await statusField
    .waitFor({ state: "attached", timeout: TIMEOUT_UI })
    .catch(() => null);

  const currentValue = await statusField.inputValue().catch(() => null);
  if (currentValue === null) {
    return null;
  }

  const selectedStatus = await statusField
    .evaluate((el: Element): string | null => {
      if (!(el instanceof HTMLSelectElement)) {
        return null;
      }

      const current: string = el.value;
      const options: string[] = [...el.options]
        .map((option: HTMLOptionElement) => option.value)
        .filter((value): value is string => value.length > 0);

      const nextValue =
        options.find((value) => value !== current) ?? options[0] ?? null;

      return nextValue;
    })
    .catch(() => null);

  if (!selectedStatus) {
    return null;
  }

  await statusField.selectOption(selectedStatus).catch(() => null);

  const updatedValue = await statusField.inputValue().catch(() => null);
  return updatedValue ?? null;
};

const getCommitmentStatusValue = async (
  container: Locator
): Promise<string | null> => {
  const statusField = getCommitmentStatusSelect(container);
  await statusField
    .waitFor({ state: "attached", timeout: TIMEOUT_UI })
    .catch(() => null);
  return statusField.inputValue().catch(() => null);
};

export const openFirstCommitmentAccordion = async (
  editor: ReportEditorPage
): Promise<Locator | null> => {
  const firstCommitmentToggle = editor.page
    .getByRole("button", { name: COMMITMENT_TOGGLE_NAME })
    .first();

  await firstCommitmentToggle
    .waitFor({ state: "visible", timeout: TIMEOUT_UI })
    .catch(() => null);

  if (!(await firstCommitmentToggle.isVisible().catch(() => false))) {
    return null;
  }

  const isExpanded =
    (await firstCommitmentToggle.getAttribute("aria-expanded")) === "true";
  if (!isExpanded) {
    await firstCommitmentToggle.click();
  }

  return firstCommitmentToggle.locator(
    "xpath=ancestor::*[.//button[@aria-expanded]][1]"
  );
};

export const verifyCommitmentSectionLoaded = async (
  editor: ReportEditorPage
): Promise<void> => {
  expect(editor.getCurrentSectionId()).toBe(STATE_POLICY_COMMITMENTS_SECTION);
  await expect(
    editor.page
      .locator("h1")
      .filter({ hasText: "State Policy Commitments" })
      .first()
  ).toBeVisible();
};

export const applyCommitmentEdits = async (
  editor: ReportEditorPage,
  commitmentContainer: Locator,
  runId: string
): Promise<CommitmentEdits | null> => {
  const statusValue = await setCommitmentStatus(commitmentContainer);
  if (!statusValue) {
    return null;
  }

  const addLinkButton = commitmentContainer
    .getByRole("button", { name: /^Add\s+link$/i })
    .first();
  await addLinkButton.waitFor({ state: "attached", timeout: TIMEOUT_UI });
  await expect(addLinkButton).toBeVisible({ timeout: TIMEOUT_UI });

  const linkInputs = commitmentContainer.getByLabel(COMMITMENT_LINK_LABEL);
  const existingLinkCount = await linkInputs.count();
  await addLinkButton.scrollIntoViewIfNeeded();
  await addLinkButton.click();

  const linkValue = `https://example.test/commitment/${runId}`;
  await expect(linkInputs).toHaveCount(existingLinkCount + 1, {
    timeout: TIMEOUT_UI,
  });
  const linkInput = linkInputs.nth(existingLinkCount);
  await expect(linkInput).toBeVisible({ timeout: TIMEOUT_UI });
  await linkInput.fill(linkValue);

  const notesValue = `Commitment note ${runId}`;
  const notesField = commitmentContainer
    .getByLabel(COMMITMENT_NOTES_LABEL)
    .first();
  await expect(notesField).toBeVisible({ timeout: TIMEOUT_UI });
  await notesField.fill(notesValue);

  const uploadButton = commitmentContainer
    .getByRole("button", { name: /^Upload\s+Attachments$/i })
    .first();
  await expect(uploadButton).toBeVisible({ timeout: TIMEOUT_UI });
  await uploadButton.scrollIntoViewIfNeeded();
  await uploadButton.click();

  const dialog = editor.page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: TIMEOUT_UI });
  const fileInput = dialog.locator("input[type='file']").first();
  await fileInput.setInputFiles(OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH);
  await dialog.getByRole("button", { name: /^Done$/i }).click();
  await expect(dialog).toBeHidden({ timeout: TIMEOUT_UI });

  await editor.page.keyboard.press("Tab");
  await expect(editor.saveStatusText).toBeVisible({
    timeout: TIMEOUT_AUTOSAVE,
  });

  return {
    statusValue,
    linkValue,
    notesValue,
    attachmentFileName: "obligated-and-spent-funds.csv",
  };
};

export const verifyCommitmentValues = async (
  commitmentContainer: Locator,
  expected: CommitmentEdits
): Promise<boolean> => {
  const statusValue = await getCommitmentStatusValue(commitmentContainer);
  if (!statusValue) {
    return false;
  }

  expect(statusValue).toBe(expected.statusValue);
  await expect(
    commitmentContainer.getByLabel(COMMITMENT_NOTES_LABEL).first()
  ).toHaveValue(expected.notesValue);

  const persistedLinkValues =
    await getCommitmentLinkValues(commitmentContainer);
  expect(persistedLinkValues).toContain(expected.linkValue);

  const escapedAttachmentFileName = escapeRegExp(expected.attachmentFileName);
  await expect(
    commitmentContainer
      .getByText(new RegExp(escapedAttachmentFileName, "i"))
      .first()
  ).toBeVisible();

  return true;
};
