import { expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import { TIMEOUT_AUTOSAVE } from "./timeouts";

export type ReportEditLabel = string | RegExp;

export type GeneralInfoField = {
  label: ReportEditLabel;
  value: string;
};

export type GeneralInfoFillMode = "overwrite" | "fill-empty";

export const escapeRegExp = (str: string): string =>
  str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

export const GENERAL_INFORMATION_SECTION = "general-information";
export const INITIATIVE_ATTACHMENTS_SECTION = "initiative-attachments";
export const INITIATIVES_SECTION = "initiatives";
export const STATE_POLICY_COMMITMENTS_SECTION = "state-policy-commitments";
export const OBLIGATED_AND_SPENT_FUNDS_SECTION = "obligated-and-spent-funds";
export const SUSTAINABILITY_AND_HIGHLIGHTS_SECTION =
  "sustainability-and-highlights";
export const REVIEW_SUBMIT_SECTION = "review-submit";

export const OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH = resolve(
  process.cwd(),
  "playwright/data/obligated-and-spent-funds.csv"
);

export const AOR_NAME_LABEL =
  /^Authorized Organizational Representative\s*\(AOR\)\s*(?:Required)?\s*$/i;
export const AOR_EMAIL_LABEL =
  /^Authorized Organizational Representative\s*\(AOR\)\s*Contact email\s*(?:Required)?\s*$/i;
export const PIPD_NAME_LABEL =
  /^Principal Investigator or Program Director\s*(?:Required)?\s*$/i;
export const PIPD_EMAIL_LABEL =
  /^Principal Investigator or Program Director\s*Contact email\s*(?:Required)?\s*$/i;

export const GENERAL_INFO_FIELDS: GeneralInfoField[] = [
  { label: AOR_NAME_LABEL, value: "Test AOR" },
  { label: AOR_EMAIL_LABEL, value: "aor@test.gov" },
  { label: PIPD_NAME_LABEL, value: "Test PIPD" },
  { label: PIPD_EMAIL_LABEL, value: "pipd@test.gov" },
];

const normalizeRunId = (id: string): string => {
  const cleaned = id.replaceAll(/[^a-f0-9]/gi, "").slice(0, 10);
  return cleaned.length > 0 ? cleaned : "";
};

const REPORT_TEST_RUN_ID = (() => {
  const envId =
    process.env.PW_TEST_RUN_ID ??
    process.env.GITHUB_RUN_ID ??
    process.env.CI_PIPELINE_ID;

  if (envId) {
    const normalized = normalizeRunId(envId);
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return randomUUID().replaceAll("-", "").slice(0, 10);
})();

export const getReportTestRunId = (): string => REPORT_TEST_RUN_ID;

export const createRunId = (): string =>
  randomUUID().replaceAll("-", "").slice(0, 10);

export const createUniqueGeneralInfoFields = (
  runId: string = getReportTestRunId()
): GeneralInfoField[] =>
  GENERAL_INFO_FIELDS.map(({ label }) => {
    if (label === AOR_NAME_LABEL) {
      return { label, value: `AOR Name ${runId}` };
    }

    if (label === AOR_EMAIL_LABEL) {
      return { label, value: `aor-${runId}@test.gov` };
    }

    if (label === PIPD_NAME_LABEL) {
      return { label, value: `PIPD Name ${runId}` };
    }

    if (label === PIPD_EMAIL_LABEL) {
      return { label, value: `pipd-${runId}@test.gov` };
    }

    return { label, value: `General Info ${runId}` };
  });

const toSixDigitNumber = (seed: string): string => {
  let hash = 0;
  for (const char of seed) {
    const codePoint = char.codePointAt(0) ?? 0;
    hash = (hash * 31 + codePoint) % 1000000;
  }

  return String(hash).padStart(6, "0");
};

export const createRunScopedInitiativeValues = (
  scope: string,
  runId: string = getReportTestRunId()
): {
  initiativeNumber: string;
  initiativeName: string;
  expectedDisplayName: string;
} => {
  const seed = `${runId}-${scope}`;
  const initiativeNumber = toSixDigitNumber(seed);
  const initiativeName = `Initiative ${seed}`;

  return {
    initiativeNumber,
    initiativeName,
    expectedDisplayName: `${initiativeNumber}: ${initiativeName}`,
  };
};

export const editGeneralInformationFields = async (
  editor: ReportEditorPage,
  fields: GeneralInfoField[],
  mode: GeneralInfoFillMode = "overwrite"
): Promise<void> => {
  for (const field of fields) {
    if (mode === "fill-empty") {
      const input = editor.getTextField(field.label);
      const currentValue = await input.inputValue().catch(() => "");
      if (currentValue.trim().length > 0) {
        continue;
      }
    }

    await editor.fillTextField(field.label, field.value);
  }
};

type AutosaveRefreshOptions = {
  timeoutMs?: number;
  fallbackSectionId?: string;
};

type UploadViaDialogOptions = {
  filePath: string;
  fileInputSelector?: string;
  expectedFileName?: string | RegExp;
  timeoutMs?: number;
};

export const waitForAutosaveWithSectionRefresh = async (
  editor: ReportEditorPage,
  sectionId: string,
  options: AutosaveRefreshOptions = {}
): Promise<boolean> => {
  const timeoutMs = options.timeoutMs ?? TIMEOUT_AUTOSAVE;
  const fallbackSectionId =
    options.fallbackSectionId ?? INITIATIVE_ATTACHMENTS_SECTION;

  const waitForAutosaveVisible = async () =>
    editor.saveStatusText
      .waitFor({ state: "visible", timeout: timeoutMs })
      .then(() => true)
      .catch(() => false);

  const autosaveVisible = await waitForAutosaveVisible();

  if (autosaveVisible) {
    return true;
  }

  const { reportType, state, reportId } = editor.getCurrentRouteParams();
  if (fallbackSectionId !== sectionId) {
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      fallbackSectionId
    );
  }
  await editor.navigateToSection(reportType, state, reportId, sectionId);

  return waitForAutosaveVisible();
};

export const confirmAutosaveIndicatorIsVisible = async (
  editor: ReportEditorPage
): Promise<void> => {
  await expect(editor.saveStatusText).toBeVisible({
    timeout: TIMEOUT_AUTOSAVE,
  });
};

export const uploadFileViaDialog = async (
  page: Page,
  options: UploadViaDialogOptions
): Promise<void> => {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: options.timeoutMs });

  await dialog
    .locator(options.fileInputSelector ?? "input[type='file']")
    .setInputFiles(options.filePath);

  if (options.expectedFileName) {
    await expect(dialog.getByText(options.expectedFileName)).toBeVisible({
      timeout: options.timeoutMs,
    });
  }

  const doneButton = dialog.getByRole("button", { name: /^Done$/i });
  await expect(doneButton).toBeVisible({ timeout: options.timeoutMs });
  await doneButton.click();
  await expect(dialog).toBeHidden({ timeout: options.timeoutMs });
};
