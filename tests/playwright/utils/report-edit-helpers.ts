import { expect } from "@playwright/test";
import { resolve } from "node:path";
import { DashboardPage } from "../tests/pageObjects/dashboard.page";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import type { StatePage } from "../tests/pageObjects/state.page";
import { reportType, stateAbbreviation } from "./consts";
import {
  openReportSection,
  type OpenReportSectionResult,
} from "./report-edit-arrange";
import { TIMEOUT_AUTOSAVE, TIMEOUT_LOADING } from "./timeouts";

const REPORT_TYPE = reportType;
const STATE = stateAbbreviation;

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

export const createUniqueAorValue = (): string => `AOR ${Date.now()}`;

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

type AutosaveRefreshOptions = {
  timeoutMs?: number;
  fallbackSectionId?: string;
};

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
  statePage: StatePage,
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

export const editGeneralInformationFields = async (
  editor: ReportEditorPage,
  fields: GeneralInfoField[],
  mode: GeneralInfoFillMode = "overwrite"
): Promise<void> => {
  for (const field of fields) {
    if (mode === "fill-empty") {
      const input = editor.getFieldByLabel(field.label);
      const currentValue = await input.inputValue().catch(() => "");
      if (currentValue.trim().length > 0) {
        continue;
      }
    }

    await editor.fillTextField(field.label, field.value);
  }
};

export const waitForAutosaveWithSectionRefresh = async (
  editor: ReportEditorPage,
  sectionId: string,
  options: AutosaveRefreshOptions = {}
): Promise<boolean> => {
  const timeoutMs = options.timeoutMs ?? TIMEOUT_AUTOSAVE;
  const fallbackSectionId =
    options.fallbackSectionId ?? INITIATIVE_ATTACHMENTS_SECTION;

  const autosaveVisible = await editor.saveStatusText
    .isVisible({ timeout: timeoutMs })
    .catch(() => false);

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

  return editor.saveStatusText
    .isVisible({ timeout: timeoutMs })
    .catch(() => false);
};

export const waitForAutosaveIndicator = async (
  editor: ReportEditorPage,
  timeoutMs = TIMEOUT_AUTOSAVE
): Promise<void> => {
  await expect(editor.saveStatusText).toBeVisible({ timeout: timeoutMs });
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
    // Section is complete if status contains "complete" or appears to be done
    const isComplete =
      /complete|done|✓/i.test(statusText) || statusText.length === 0;
    if (!isComplete) {
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
  await editGeneralInformationFields(editor, GENERAL_INFO_FIELDS, "fill-empty");
  await editor.page.keyboard.press("Tab");
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

  return true;
};

const completeUseOfFundsForSubmission = async (
  editor: ReportEditorPage
): Promise<boolean> => {
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

  if (!(await addUseOfFundsButton.isEnabled())) {
    return false;
  }

  await addUseOfFundsButton.click();
  const uploadDialog = editor.page.getByRole("dialog");
  await expect(uploadDialog).toBeVisible();

  await uploadDialog
    .locator("input[type='file']#file-input")
    .setInputFiles(USE_OF_FUNDS_FIXTURE_PATH);
  await expect(uploadDialog.getByText("use-of-funds.csv")).toBeVisible();

  await uploadDialog.getByRole("button", { name: /^Done$/i }).click();
  await expect(uploadDialog).toBeHidden();

  return true;
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
    return completeUseOfFundsForSubmission(editor);
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
  const submitForReviewButton = editor.page.getByRole("button", {
    name: /^Submit for Review$/i,
  });

  const waitForFinalSubmitEnabled = async (): Promise<boolean> => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const enabled = await finalSubmitButton
        .isEnabled({ timeout: TIMEOUT_LOADING * 2 })
        .catch(() => false);
      if (enabled) {
        return true;
      }

      if (attempt < 2) {
        await editor.navigateToSection(
          reportType,
          state,
          reportId,
          REVIEW_SUBMIT_SECTION
        );
        await expect(finalSubmitButton).toBeVisible();
      }
    }

    return false;
  };

  let previousIncompleteSignature = "";

  // Navigate to review section and wait for button
  await editor.navigateToSection(
    reportType,
    state,
    reportId,
    REVIEW_SUBMIT_SECTION
  );
  await expect(finalSubmitButton).toBeVisible();

  // Require enabled state to avoid false positives from visible-but-disabled buttons.
  const isEnabled = await waitForFinalSubmitEnabled();

  if (isEnabled) {
    return { submittable: true };
  }

  // If button not clickable, check for incomplete sections
  for (let attempt = 0; attempt < 3; attempt++) {
    const incompleteSections = await getIncompleteReviewSections(editor);
    if (incompleteSections.length === 0) {
      break;
    }

    const currentIncompleteSignature = incompleteSections
      .map((s) => `${s.title}:${s.status}`)
      .join("|");
    if (
      attempt > 0 &&
      currentIncompleteSignature === previousIncompleteSignature
    ) {
      return {
        submittable: false,
        reason:
          "Report completion made no progress between attempts; required sections remain incomplete",
      };
    }
    previousIncompleteSignature = currentIncompleteSignature;

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
  if (remaining.length === 0) {
    const finalEnabled = await waitForFinalSubmitEnabled();

    if (finalEnabled) {
      return { submittable: true };
    }

    const reviewVisible = await submitForReviewButton
      .isVisible()
      .catch(() => false);
    const reviewEnabled = reviewVisible
      ? await submitForReviewButton.isEnabled().catch(() => false)
      : false;

    if (reviewEnabled) {
      await submitForReviewButton.click();

      const enabledAfterReview = await waitForFinalSubmitEnabled();
      if (enabledAfterReview) {
        return { submittable: true };
      }
    }

    return {
      submittable: false,
      reason:
        "Report reached Review & Submit but final submit remains disabled after Submit for Review",
    };
  }

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
