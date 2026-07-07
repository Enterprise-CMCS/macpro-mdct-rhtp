import { expect } from "@playwright/test";
import { resolve } from "node:path";
import { DashboardPage } from "../tests/pageObjects/dashboard.page";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import { reportType, stateAbbreviation } from "./consts";
import {
  openReportSection,
  type OpenReportSectionResult,
} from "./report-edit-arrange";
import { TIMEOUT_AUTOSAVE } from "./timeouts";

const REPORT_TYPE = reportType;
const STATE = stateAbbreviation;

export type ReportEditLabel = string | RegExp;

export type GeneralInfoField = {
  label: ReportEditLabel;
  value: string;
};

export const GENERAL_INFORMATION_SECTION = "general-information";
export const INITIATIVE_ATTACHMENTS_SECTION = "initiative-attachments";
export const INITIATIVES_SECTION = "initiatives";
export const STATE_POLICY_COMMITMENTS_SECTION = "state-policy-commitments";
export const USE_OF_FUNDS_SECTION = "use-of-funds";
export const SUSTAINABILITY_AND_HIGHLIGHTS_SECTION =
  "sustainability-and-highlights";
export const REVIEW_SUBMIT_SECTION = "review-submit";

const USE_OF_FUNDS_FIXTURE_PATH = resolve(
  process.cwd(),
  "playwright/fixtures/use-of-funds.csv"
);

export const AOR_NAME_LABEL =
  /Authorized Organizational Representative \(AOR\)$/;
export const AOR_EMAIL_LABEL =
  /Authorized Organizational Representative \(AOR\) Contact email$/;
export const PIPD_NAME_LABEL = /Principal Investigator or Program Director$/;
export const PIPD_EMAIL_LABEL =
  /Principal Investigator or Program Director Contact email$/;

export const GENERAL_INFO_FIELDS: GeneralInfoField[] = [
  { label: AOR_NAME_LABEL, value: "Test AOR" },
  { label: AOR_EMAIL_LABEL, value: "aor@test.gov" },
  { label: PIPD_NAME_LABEL, value: "Test PIPD" },
  { label: PIPD_EMAIL_LABEL, value: "pipd@test.gov" },
];

export const SUCCESS_STORIES_LABEL = /success stories/i;
export const SUSTAINABILITY_PLANNING_LABEL = /sustainability plan/i;

export const SUSTAINABILITY_TEST_DATA = {
  successStories:
    "This is a test success story demonstrating measurable outcomes from RHT implementation.",
  sustainabilityPlan:
    "Our sustainability strategy includes long-term funding commitments and workforce development partnerships.",
};

const SUSTAINABILITY_RETRY_INTERRUPTED_REASON =
  "Sustainability section retry was interrupted before a writable report was found";
const SUSTAINABILITY_READ_ONLY_REASON =
  "Sustainability fields are read-only on available unsubmitted reports";
const NO_EDITABLE_REPORT_REASON =
  "No editable report candidates were available";

export const verifyTextareaValue = async (
  editor: ReportEditorPage,
  label: ReportEditLabel,
  expectedValue: string
): Promise<void> => {
  await expect(editor.getFieldByLabel(label)).toHaveValue(expectedValue);
};

export const sustainabilityFieldsEditable = async (
  editor: ReportEditorPage
): Promise<boolean> => {
  const [successEnabled, planningEnabled] = await Promise.all([
    editor
      .getFieldByLabel(SUCCESS_STORIES_LABEL)
      .isEnabled()
      .catch(() => false),
    editor
      .getFieldByLabel(SUSTAINABILITY_PLANNING_LABEL)
      .isEnabled()
      .catch(() => false),
  ]);

  return successEnabled && planningEnabled;
};

export const openUnsubmittedSectionWithSustainabilityRetry = async (
  statePage: any,
  sectionId: string
): Promise<OpenReportSectionResult> => {
  const dashboard = new DashboardPage(statePage.page);
  await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
  const editableCount = await dashboard.getEditableReportCount();
  const maxAttempts = Math.min(Math.max(editableCount, 2), 3);

  let sawReadOnlySustainability = false;
  let lastFailureReason = NO_EDITABLE_REPORT_REASON;

  const openCandidate = async (
    candidateIndex: number
  ): Promise<OpenReportSectionResult> => {
    try {
      return await openReportSection(
        statePage,
        "unsubmitted",
        sectionId,
        candidateIndex
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/Target page, context or browser has been closed/i.test(message)) {
        return {
          ok: false,
          reason: SUSTAINABILITY_RETRY_INTERRUPTED_REASON,
        };
      }

      throw error;
    }
  };

  const openWritableCandidate = async (
    candidateIndex: number
  ): Promise<OpenReportSectionResult> => {
    const opened = await openCandidate(candidateIndex);
    if (!opened.ok) {
      return opened;
    }

    if (await sustainabilityFieldsEditable(opened.editor)) {
      return opened;
    }

    sawReadOnlySustainability = true;
    return { ok: false, reason: SUSTAINABILITY_READ_ONLY_REASON };
  };

  for (let i = 0; i < maxAttempts; i++) {
    const opened = await openWritableCandidate(i);

    if (!opened.ok) {
      lastFailureReason = opened.reason;
      continue;
    }

    return opened;
  }

  if (sawReadOnlySustainability) {
    return {
      ok: false,
      reason: SUSTAINABILITY_READ_ONLY_REASON,
    };
  }

  return { ok: false, reason: lastFailureReason };
};

const fillGeneralInformationFields = async (
  editor: ReportEditorPage
): Promise<void> => {
  for (const field of GENERAL_INFO_FIELDS) {
    await editor.fillTextField(field.label, field.value);
  }
};

const getIncompleteReviewSections = async (
  editor: ReportEditorPage
): Promise<Array<{ title: string; status: string }>> => {
  const rows = editor.page.locator("table tbody tr");
  const rowCount = await rows.count();
  const incomplete: Array<{ title: string; status: string }> = [];

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const title = (await row.getByRole("cell").nth(0).textContent())?.trim();
    const statusText = (
      await row.getByRole("cell").nth(1).textContent()
    )?.trim();

    if (!title || !statusText) continue;
    if (!/complete/i.test(statusText)) {
      incomplete.push({ title, status: statusText });
    }
  }

  return incomplete;
};

const completeGeneralInformationForSubmission = async (
  editor: ReportEditorPage
): Promise<void> => {
  const { reportType, state, reportId } = editor.getCurrentRouteParams();
  await editor.navigateToSection(
    reportType,
    state,
    reportId,
    GENERAL_INFORMATION_SECTION
  );
  await fillGeneralInformationFields(editor);
  await editor.page.keyboard.press("Tab");
  await expect(editor.saveStatusText).toBeVisible({
    timeout: TIMEOUT_AUTOSAVE,
  });
};

const completeSustainabilityForSubmission = async (
  editor: ReportEditorPage
): Promise<boolean> => {
  const { reportType, state, reportId } = editor.getCurrentRouteParams();
  await editor.navigateToSection(
    reportType,
    state,
    reportId,
    SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
  );

  if (!(await sustainabilityFieldsEditable(editor))) {
    return false;
  }

  await editor.fillTextarea(
    SUCCESS_STORIES_LABEL,
    `Success story for submission ${Date.now()}`
  );
  await editor.fillTextarea(
    SUSTAINABILITY_PLANNING_LABEL,
    `Sustainability plan for submission ${Date.now()}`
  );
  await editor.page.keyboard.press("Tab");
  await expect(editor.saveStatusText).toBeVisible({
    timeout: TIMEOUT_AUTOSAVE,
  });

  return true;
};

const completeUseOfFundsForSubmission = async (
  editor: ReportEditorPage
): Promise<void> => {
  const { reportType, state, reportId } = editor.getCurrentRouteParams();
  await editor.navigateToSection(
    reportType,
    state,
    reportId,
    USE_OF_FUNDS_SECTION
  );

  const addUseOfFundsButton = editor.page.getByRole("button", {
    name: /Add Use of Funds/i,
  });

  if (await addUseOfFundsButton.isEnabled()) {
    await addUseOfFundsButton.click();
    const uploadDialog = editor.page.getByRole("dialog");
    await expect(uploadDialog).toBeVisible();

    await uploadDialog
      .locator("input[type='file']#file-input")
      .setInputFiles(USE_OF_FUNDS_FIXTURE_PATH);
    await expect(uploadDialog.getByText("use-of-funds.csv")).toBeVisible();

    await uploadDialog.getByRole("button", { name: /^Done$/i }).click();
    await expect(uploadDialog).toBeHidden();
  }
};

const completeSectionByTitle = async (
  editor: ReportEditorPage,
  title: string
): Promise<boolean> => {
  if (/^General Information$/i.test(title)) {
    await completeGeneralInformationForSubmission(editor);
    return true;
  }

  if (/^Sustainability and Highlights$/i.test(title)) {
    return completeSustainabilityForSubmission(editor);
  }

  if (/^Use of Funds$/i.test(title)) {
    await completeUseOfFundsForSubmission(editor);
    return true;
  }

  return false;
};

const ensureReportIsSubmittable = async (
  editor: ReportEditorPage
): Promise<{ submittable: boolean; reason?: string }> => {
  const { reportType, state, reportId } = editor.getCurrentRouteParams();
  const finalSubmitButton = editor.page.getByRole("button", {
    name: /Submit .* Report/i,
  });

  for (let attempt = 0; attempt < 5; attempt++) {
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      REVIEW_SUBMIT_SECTION
    );
    await expect(finalSubmitButton).toBeVisible();

    if (await finalSubmitButton.isEnabled()) {
      return { submittable: true };
    }

    const incompleteSections = await getIncompleteReviewSections(editor);
    if (incompleteSections.length === 0) {
      break;
    }

    const unhandled: string[] = [];
    for (const section of incompleteSections) {
      const handled = await completeSectionByTitle(editor, section.title);
      if (!handled) {
        unhandled.push(`${section.title} (${section.status})`);
      }
    }

    if (unhandled.length > 0) {
      return {
        submittable: false,
        reason: `Unable to auto-complete required sections: ${unhandled.join(", ")}`,
      };
    }
  }

  const remaining = await getIncompleteReviewSections(editor);
  return {
    submittable: false,
    reason:
      remaining.length > 0
        ? `Report still incomplete after auto-completion: ${remaining
            .map((s) => `${s.title} (${s.status})`)
            .join(", ")}`
        : "Report was not submittable after auto-completion attempts",
  };
};

export const prepareReportForSubmission = async (
  editor: ReportEditorPage
): Promise<{ submittable: boolean; reason?: string }> => {
  await completeGeneralInformationForSubmission(editor);
  const sustainabilityCompleted =
    await completeSustainabilityForSubmission(editor);
  if (!sustainabilityCompleted) {
    return {
      submittable: false,
      reason: "Sustainability fields are read-only for the available report",
    };
  }
  await completeUseOfFundsForSubmission(editor);
  return ensureReportIsSubmittable(editor);
};
