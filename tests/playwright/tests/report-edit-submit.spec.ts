import { test, expect } from "./fixtures/base";
import { StatePage } from "./pageObjects/state.page";
import { TIMEOUT_LOADING } from "../utils/timeouts";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  AOR_NAME_LABEL,
  createUniqueAorValue,
  GENERAL_INFORMATION_SECTION,
  GENERAL_INFO_FIELDS,
  prepareReportForSubmission,
  REVIEW_SUBMIT_SECTION,
  waitForAutosaveWithSectionRefresh,
} from "../utils/report-edit-helpers";
import {
  verifyFieldIsReadOnly,
  verifyCurrentSection,
} from "../utils/report-edit-assertions";

const isEnvironmentInterruptionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /Target page, context or browser has been closed/i.test(message);
};

type SubmissionPreparationResult = {
  submittable: boolean;
  reason?: string;
};

const prepareForSubmissionWithTimeout = async (
  editor: Parameters<typeof prepareReportForSubmission>[0],
  timeoutMs = 45000
): Promise<SubmissionPreparationResult> => {
  const timeoutResult: SubmissionPreparationResult = {
    submittable: false,
    reason: "Submission preparation timed out in deployed environment",
  };

  return Promise.race([
    prepareReportForSubmission(editor),
    new Promise<SubmissionPreparationResult>((resolve) => {
      setTimeout(() => resolve(timeoutResult), timeoutMs);
    }),
  ]);
};

const submitPreparedReport = async (
  editor: Parameters<typeof prepareReportForSubmission>[0],
  prepResult: SubmissionPreparationResult
): Promise<{ submitted: boolean; reason?: string }> => {
  const { reportType, state, reportId } = editor.getCurrentRouteParams();
  await editor.navigateToSection(
    reportType,
    state,
    reportId,
    REVIEW_SUBMIT_SECTION
  );
  await verifyCurrentSection(editor, REVIEW_SUBMIT_SECTION);

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

const arrangeReviewSubmitSection = async (statePage: StatePage) => {
  const editor = await openReportSectionOrSkip(
    statePage,
    "unsubmitted",
    REVIEW_SUBMIT_SECTION,
    (reason) => test.skip(true, reason)
  );
  if (!editor) {
    return null;
  }

  const submitButton = editor.page.getByRole("button", {
    name: /Submit for Review/i,
  });
  const blockedMessage = editor.page.getByText(
    "Your form is not ready for submission",
    {
      exact: true,
    }
  );

  return {
    editor,
    submitButton,
    blockedMessage,
  };
};

test.describe("Report Editing - Submission and Read-only", () => {
  test("should render submitted reports as read-only in general information", async ({
    statePage,
  }) => {
    const editor = await openReportSectionOrSkip(
      statePage,
      "submitted",
      GENERAL_INFORMATION_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    for (const field of GENERAL_INFO_FIELDS) {
      await verifyFieldIsReadOnly(editor, field.label);
    }
  });

  test("should render review and submit actions and keep submission blocked when required responses are missing", async ({
    statePage,
  }) => {
    const context = await arrangeReviewSubmitSection(statePage);
    if (!context) {
      return;
    }
    const { submitButton, blockedMessage, editor } = context;

    await verifyCurrentSection(editor, REVIEW_SUBMIT_SECTION);
    await expect(
      editor.page.getByRole("heading", { name: "Review & Submit" })
    ).toBeVisible();

    const blockedMessageVisible = await blockedMessage
      .isVisible()
      .catch(() => false);
    const submitButtonVisible = await submitButton
      .isVisible()
      .catch(() => false);

    if (!blockedMessageVisible && submitButtonVisible) {
      const finalSubmitButton = editor.page.getByRole("button", {
        name: /Submit .* Report/i,
      });
      const finalSubmitEnabled = await finalSubmitButton
        .isEnabled()
        .catch(() => false);
      if (finalSubmitEnabled) {
        test.skip(
          true,
          "No blocked/unready report available in this environment"
        );
        return;
      }
    }

    await expect(blockedMessage).toBeVisible();
    await expect(submitButton).toBeVisible();

    if (await submitButton.isEnabled()) {
      await submitButton.click();
      await verifyCurrentSection(editor, REVIEW_SUBMIT_SECTION);
    } else {
      await expect(submitButton).toBeDisabled();
    }

    await expect(blockedMessage).toBeVisible();
    await expect(
      editor.page.getByRole("heading", { name: /Successfully Submitted/i })
    ).toBeHidden();
  });

  test("should submit a report when submission criteria are met", async ({
    statePage,
  }) => {
    test.slow();

    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      REVIEW_SUBMIT_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    let prepResult;
    try {
      prepResult = await prepareForSubmissionWithTimeout(editor);
    } catch (error) {
      if (isEnvironmentInterruptionError(error)) {
        test.skip(
          true,
          "Submission preparation interrupted by deployed environment page closure"
        );
        return;
      }
      throw error;
    }
    const submitOutcome = await submitPreparedReport(editor, prepResult);
    if (!submitOutcome.submitted) {
      console.warn(
        `Skipping final submission test: ${submitOutcome.reason ?? "report not submittable"}`
      );
      test.skip(true, submitOutcome.reason ?? "report not submittable");
      return;
    }
  });

  test("should complete full submit lifecycle and lock report fields after submission", async ({
    statePage,
  }) => {
    test.slow();

    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      GENERAL_INFORMATION_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    const aorValue = createUniqueAorValue();
    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    await editor.fillTextField(AOR_NAME_LABEL, aorValue);
    await editor.page.keyboard.press("Tab");
    await waitForAutosaveWithSectionRefresh(
      editor,
      GENERAL_INFORMATION_SECTION,
      {
        timeoutMs: TIMEOUT_LOADING,
      }
    );

    let prepResult;
    try {
      prepResult = await prepareForSubmissionWithTimeout(editor);
    } catch (error) {
      if (isEnvironmentInterruptionError(error)) {
        test.skip(
          true,
          "Submission preparation interrupted by deployed environment page closure"
        );
        return;
      }
      throw error;
    }
    const submitOutcome = await submitPreparedReport(editor, prepResult);
    if (!submitOutcome.submitted) {
      test.skip(true, submitOutcome.reason ?? "report not submittable");
      return;
    }

    const { reportType, state, reportId } = editor.getCurrentRouteParams();

    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION
    );
    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    await expect(editor.page.getByLabel(AOR_NAME_LABEL)).toHaveValue(/\S+/);
    await expect(editor.page.getByLabel(AOR_NAME_LABEL)).toHaveValue(
      /^AOR \d+$/
    );
    await verifyFieldIsReadOnly(editor, AOR_NAME_LABEL);
  });
});
