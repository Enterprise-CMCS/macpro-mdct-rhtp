import { expect } from "@playwright/test";
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

export const GENERAL_INFORMATION_SECTION = "general-information";
export const INITIATIVE_ATTACHMENTS_SECTION = "initiative-attachments";
export const INITIATIVES_SECTION = "initiatives";
export const STATE_POLICY_COMMITMENTS_SECTION = "state-policy-commitments";
export const USE_OF_FUNDS_SECTION = "use-of-funds";
export const SUSTAINABILITY_AND_HIGHLIGHTS_SECTION =
  "sustainability-and-highlights";
export const REVIEW_SUBMIT_SECTION = "review-submit";

export const USE_OF_FUNDS_FIXTURE_PATH = resolve(
  process.cwd(),
  "playwright/data/use-of-funds.csv"
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

export const createRunId = (): string =>
  randomUUID().replaceAll("-", "").slice(0, 10);

export const createUniqueAorValue = (runId: string = createRunId()): string =>
  `AOR ${runId}`;

export const createUniqueGeneralInfoFields = (
  runId: string = createRunId()
): GeneralInfoField[] =>
  GENERAL_INFO_FIELDS.map(({ label }) => {
    if (label === AOR_NAME_LABEL) {
      return { label, value: createUniqueAorValue(runId) };
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

export const requireAutosaveWithSectionRefresh = async (
  editor: ReportEditorPage,
  sectionId: string,
  failureReason: string,
  options: AutosaveRefreshOptions = {}
): Promise<void> => {
  const autosaved = await waitForAutosaveWithSectionRefresh(
    editor,
    sectionId,
    options
  );

  expect(autosaved, failureReason).toBeTruthy();
};

export const confirmAutosaveIndicatorIsVisible = async (
  editor: ReportEditorPage
): Promise<void> => {
  await expect(editor.saveStatusText).toBeVisible({
    timeout: TIMEOUT_AUTOSAVE,
  });
};
