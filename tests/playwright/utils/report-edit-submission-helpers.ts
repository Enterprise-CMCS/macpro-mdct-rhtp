import { expect } from "@playwright/test";
import { DashboardPage } from "../tests/pageObjects/dashboard.page";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import type { StatePage } from "../tests/pageObjects/state.page";
import { reportType, stateAbbreviation } from "./consts";
import {
  openReportSection,
  type OpenReportSectionResult,
} from "./report-edit-arrange";
import {
  createRunId,
  editGeneralInformationFields,
  GENERAL_INFO_FIELDS,
  GENERAL_INFORMATION_SECTION,
  INITIATIVES_SECTION,
  REVIEW_SUBMIT_SECTION,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
  USE_OF_FUNDS_FIXTURE_PATH,
  USE_OF_FUNDS_SECTION,
} from "./report-edit-shared-helpers";
import { TIMEOUT_LOADING, TIMEOUT_UI } from "./timeouts";

const REPORT_TYPE = reportType;
const STATE = stateAbbreviation;

export const SUCCESS_STORIES_LABEL = /success stories/i;
export const SUSTAINABILITY_PLANNING_LABEL = /sustainability plan/i;

const SUSTAINABILITY_RUN_ID =
  process.env.GITHUB_RUN_ID ??
  process.env.CI_PIPELINE_ID ??
  Math.floor(Date.now() / (10 * 60 * 1000)).toString();

export const SUSTAINABILITY_TEST_DATA = {
  successStories:
    "This is a test success story demonstrating measurable outcomes from RHT implementation." +
    ` Run: ${SUSTAINABILITY_RUN_ID}`,
  sustainabilityPlan:
    "Our sustainability strategy includes long-term funding commitments and workforce development partnerships." +
    ` Run: ${SUSTAINABILITY_RUN_ID}`,
};

export const createSustainabilityTestData = (runId: string = createRunId()) => {
  const testId = `${runId}-${Math.floor(Math.random() * 10000)}`;
  return {
    successStories:
      "This is a test success story demonstrating measurable outcomes from RHT implementation." +
      ` Test: ${testId}`,
    sustainabilityPlan:
      "Our sustainability strategy includes long-term funding commitments and workforce development partnerships." +
      ` Test: ${testId}`,
  };
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

export const sustainabilityFieldsEditable = async (
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

export type SustainabilityFieldValues = {
  successStories: string;
  sustainabilityPlan: string;
};

export const fillSustainabilityFields = async (
  editor: ReportEditorPage,
  values: SustainabilityFieldValues
): Promise<void> => {
  const successStoriesField = editor.getTextField(SUCCESS_STORIES_LABEL);
  const planningField = editor.getTextField(SUSTAINABILITY_PLANNING_LABEL);

  await expect(successStoriesField).toBeEnabled();
  await expect(planningField).toBeEnabled();

  await editor.fillTextField(SUCCESS_STORIES_LABEL, values.successStories);
  await editor.fillTextField(
    SUSTAINABILITY_PLANNING_LABEL,
    values.sustainabilityPlan
  );

  // Validate data entry before save assertions so failures distinguish input vs persistence issues.
  await expect(successStoriesField).toHaveValue(values.successStories);
  await expect(planningField).toHaveValue(values.sustainabilityPlan);

  // Blur the final edited field to trigger autosave.
  await editor.page.keyboard.press("Tab");
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

export const openSustainabilityEditorOrSkip = async (
  statePage: StatePage,
  onSkip: (reason: string) => void
): Promise<ReportEditorPage | undefined> => {
  const opened = await openUnsubmittedSectionWithSustainabilityRetry(
    statePage,
    SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
  );

  if (!opened.ok) {
    onSkip(opened.reason);
    return undefined;
  }

  return opened.editor;
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
    `Success story for submission ${Date.now()}`
  );
  await editor.fillTextField(
    SUSTAINABILITY_PLANNING_LABEL,
    `Sustainability plan for submission ${Date.now()}`
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

  const uniqueSuffix = `${Date.now()}`;
  const initiativeNumber = uniqueSuffix.slice(-6);
  const initiativeName = `Initiative ${uniqueSuffix}`;
  const expectedDisplayName = `${initiativeNumber}: ${initiativeName}`;

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

  if (/^Initiatives$/i.test(title)) {
    return completeInitiativesForSubmission(editor);
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

export type SubmissionPreparationResult = {
  submittable: boolean;
  reason?: string;
};

export type SubmissionOutcome = {
  submitted: boolean;
  reason?: string;
};

export const isEnvironmentInterruptionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /Target page, context or browser has been closed/i.test(message);
};

export const prepareReportForSubmissionWithTimeout = async (
  editor: ReportEditorPage,
  timeoutMs = 90000
): Promise<SubmissionPreparationResult> => {
  const timeoutResult: SubmissionPreparationResult = {
    submittable: false,
    reason: SUBMISSION_PREPARATION_TIMEOUT_REASON,
  };

  return Promise.race([
    prepareReportForSubmission(editor),
    new Promise<SubmissionPreparationResult>((resolve) => {
      setTimeout(() => resolve(timeoutResult), timeoutMs);
    }),
  ]);
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
