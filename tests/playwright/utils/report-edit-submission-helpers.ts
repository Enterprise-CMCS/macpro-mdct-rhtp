import { expect } from "@playwright/test";
import { DashboardPage } from "../tests/pageObjects/dashboard.page";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import type { StatePage } from "../tests/pageObjects/state.page";
import { reportType, stateAbbreviation } from "./consts";
import {
  isEnvironmentInterruptionError,
  openReportSection,
  type OpenReportSectionResult,
} from "./report-edit-arrange";
import {
  createRunScopedInitiativeValues,
  editGeneralInformationFields,
  GENERAL_INFO_FIELDS,
  GENERAL_INFORMATION_SECTION,
  getReportTestRunId,
  INITIATIVES_SECTION,
  OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH,
  OBLIGATED_AND_SPENT_FUNDS_SECTION,
  REVIEW_SUBMIT_SECTION,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
} from "./report-edit-shared-helpers";
import { TIMEOUT_LOADING, TIMEOUT_UI } from "./timeouts";

const REPORT_TYPE = reportType;
const STATE = stateAbbreviation;

export const SUCCESS_STORIES_LABEL = /success stories/i;
export const SUSTAINABILITY_PLANNING_LABEL = /sustainability plan/i;

const REPORT_TEST_RUN_ID = getReportTestRunId();

export const SUSTAINABILITY_TEST_DATA = {
  successStories:
    "This is a test success story demonstrating measurable outcomes from RHT implementation." +
    ` Run: ${REPORT_TEST_RUN_ID}`,
  sustainabilityPlan:
    "Our sustainability strategy includes long-term funding commitments and workforce development partnerships." +
    ` Run: ${REPORT_TEST_RUN_ID}`,
};

const SUSTAINABILITY_RETRY_INTERRUPTED_REASON =
  "Sustainability section retry was interrupted before a writable report was found";
const SUSTAINABILITY_READ_ONLY_REASON =
  "Sustainability fields are read-only on available unsubmitted reports";
const NO_EDITABLE_REPORT_REASON =
  "No editable report candidates were available";

const SUBMISSION_PREPARATION_TIMEOUT_REASON =
  "Submission preparation timed out in deployed environment";
const SUBMISSION_PREPARATION_INTERRUPTED_REASON =
  "Submission preparation interrupted by deployed environment page closure";

const sustainabilityFieldsEditable = async (
  editor: ReportEditorPage
): Promise<boolean> => {
  const [successEnabled, planningEnabled] = await Promise.all([
    editor
      .getTextField(SUCCESS_STORIES_LABEL)
      .isEnabled()
      .catch(() => false),
    editor
      .getTextField(SUSTAINABILITY_PLANNING_LABEL)
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

  await editor.fillTextField(
    SUCCESS_STORIES_LABEL,
    `Success story for submission ${REPORT_TEST_RUN_ID}`
  );
  await editor.fillTextField(
    SUSTAINABILITY_PLANNING_LABEL,
    `Sustainability plan for submission ${REPORT_TEST_RUN_ID}`
  );
  await editor.page.keyboard.press("Tab");

  return true;
};

const completeInitiativesForSubmission = async (
  editor: ReportEditorPage
): Promise<boolean> => {
  const { reportType, state, reportId } = editor.getCurrentRouteParams();
  await editor.navigateToSection(
    reportType,
    state,
    reportId,
    INITIATIVES_SECTION
  );

  const addInitiativeButton = editor.page.getByRole("button", {
    name: /^Add initiative$/i,
  });

  const canAddInitiative = await addInitiativeButton
    .waitFor({ state: "visible", timeout: TIMEOUT_UI })
    .then(() => true)
    .catch(() => false);
  if (!canAddInitiative) {
    const existingInitiativeVisible = await editor.page
      .getByText(/^\d{1,6}:\s+.+/)
      .first()
      .isVisible()
      .catch(() => false);
    return existingInitiativeVisible;
  }

  const { initiativeNumber, initiativeName, expectedDisplayName } =
    createRunScopedInitiativeValues("submit-readiness", REPORT_TEST_RUN_ID);

  await addInitiativeButton.click();

  const initiativeModal = editor.page.getByRole("dialog");
  await expect(initiativeModal).toBeVisible({ timeout: TIMEOUT_UI });
  await expect(
    initiativeModal.getByRole("heading", { name: /^Add Initiative$/i })
  ).toBeVisible({ timeout: TIMEOUT_UI });

  await initiativeModal
    .getByRole("textbox", { name: /^Initiative Number$/i })
    .fill(initiativeNumber);
  await initiativeModal
    .getByRole("textbox", { name: /^Initiative Name$/i })
    .fill(initiativeName);

  await initiativeModal.getByRole("button", { name: /^Save$/i }).click();
  await expect(initiativeModal).toBeHidden({ timeout: TIMEOUT_UI });

  await expect(editor.page.getByText(expectedDisplayName).first()).toBeVisible({
    timeout: TIMEOUT_UI,
  });

  return true;
};

const completeObligatedAndSpentFundsForSubmission = async (
  editor: ReportEditorPage
): Promise<boolean> => {
  const { reportType, state, reportId } = editor.getCurrentRouteParams();
  await editor.navigateToSection(
    reportType,
    state,
    reportId,
    OBLIGATED_AND_SPENT_FUNDS_SECTION
  );

  const addObligatedAndSpentFundsButton = editor.page.getByRole("button", {
    name: /Add Obligated and Spent Funds/i,
  });

  if (!(await addObligatedAndSpentFundsButton.isEnabled())) {
    return false;
  }

  await addObligatedAndSpentFundsButton.click();

  const budgetDropdown = editor.page
    .getByRole("button", {
      name: /Which budget period does this document apply to?/i,
    })
    .first();
  await expect(budgetDropdown).toBeVisible();
  await expect(budgetDropdown).toBeEnabled();
  await budgetDropdown.click();
  const budgetOption = editor.page.getByRole("option", {
    name: /Budget Period 1/i,
  });
  await expect(budgetOption).toBeVisible();
  await budgetOption.click();

  const uploadDialog = editor.page.getByRole("dialog");
  await expect(uploadDialog).toBeVisible();

  const fileInput = uploadDialog.locator('input[type="file"]');
  await expect(fileInput).toBeEnabled();
  await fileInput.setInputFiles(OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH);
  await expect(
    uploadDialog.getByRole("heading", { name: /^Upload Status$/i })
  ).toBeVisible({ timeout: TIMEOUT_UI });
  await expect(
    uploadDialog.getByText(OBLIGATED_AND_SPENT_FUNDS_FIXTURE_PATH, {
      exact: true,
    })
  ).toBeVisible({ timeout: TIMEOUT_UI });

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

  if (/^Initiatives$/i.test(title)) {
    return completeInitiativesForSubmission(editor);
  }

  if (/^Obligated and Spent Funds$/i.test(title)) {
    return completeObligatedAndSpentFundsForSubmission(editor);
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
  const requestFeedbackButton = editor.page.getByRole("button", {
    name: /^Request PO Feedback$/i,
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

  await editor.navigateToSection(
    reportType,
    state,
    reportId,
    REVIEW_SUBMIT_SECTION
  );
  await expect(finalSubmitButton).toBeVisible();

  const isEnabled = await waitForFinalSubmitEnabled();

  if (isEnabled) {
    return { submittable: true };
  }

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

    const reviewVisible = await requestFeedbackButton
      .isVisible()
      .catch(() => false);
    const reviewEnabled = reviewVisible
      ? await requestFeedbackButton.isEnabled().catch(() => false)
      : false;

    if (reviewEnabled) {
      await requestFeedbackButton.click();

      const enabledAfterReview = await waitForFinalSubmitEnabled();
      if (enabledAfterReview) {
        return { submittable: true };
      }
    }

    return {
      submittable: false,
      reason:
        "Report reached Review & Submit but final submit remains disabled after Request PO Feedback",
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
  await completeObligatedAndSpentFundsForSubmission(editor);
  return ensureReportIsSubmittable(editor);
};

export type SubmissionPreparationResult = {
  submittable: boolean;
  reason?: string;
};

export type SubmissionOutcome = {
  submitted: boolean;
  reason?: string;
};

export const prepareReportForSubmissionWithTimeout = async (
  editor: ReportEditorPage,
  timeoutMs = 90000
): Promise<SubmissionPreparationResult> => {
  const timeoutResult: SubmissionPreparationResult = {
    submittable: false,
    reason: SUBMISSION_PREPARATION_TIMEOUT_REASON,
  };

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      prepareReportForSubmission(editor),
      new Promise<SubmissionPreparationResult>((resolve) => {
        timeoutId = setTimeout(() => resolve(timeoutResult), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const submitPreparedReport = async (
  editor: ReportEditorPage,
  prepResult: SubmissionPreparationResult
): Promise<SubmissionOutcome> => {
  const { reportType, state, reportId } = editor.getCurrentRouteParams();
  await editor.navigateToSection(
    reportType,
    state,
    reportId,
    REVIEW_SUBMIT_SECTION
  );

  const finalSubmitButton = editor.page.getByRole("button", {
    name: /Submit .* Report/i,
  });
  await expect(finalSubmitButton).toBeVisible();

  if (!prepResult.submittable) {
    return {
      submitted: false,
      reason: prepResult.reason ?? "report not submittable",
    };
  }

  await expect(finalSubmitButton).toBeEnabled({ timeout: TIMEOUT_LOADING });
  await finalSubmitButton.click();

  const confirmModal = editor.page.getByRole("dialog");
  await expect(confirmModal).toBeVisible({ timeout: TIMEOUT_LOADING });
  await confirmModal.getByRole("button", { name: /Submit .* Report/i }).click();

  await expect(
    editor.page.getByRole("heading", { name: /Successfully Submitted/i })
  ).toBeVisible({ timeout: TIMEOUT_LOADING });
  await expect(finalSubmitButton).toBeHidden();

  return { submitted: true };
};

export const prepareAndSubmitReport = async (
  editor: ReportEditorPage,
  timeoutMs = 90000
): Promise<SubmissionOutcome> => {
  try {
    const prepResult = await prepareReportForSubmissionWithTimeout(
      editor,
      timeoutMs
    );
    return submitPreparedReport(editor, prepResult);
  } catch (error) {
    if (isEnvironmentInterruptionError(error)) {
      return {
        submitted: false,
        reason: SUBMISSION_PREPARATION_INTERRUPTED_REASON,
      };
    }

    throw error;
  }
};
