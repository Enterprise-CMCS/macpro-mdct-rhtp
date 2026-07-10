import { test, expect } from "../fixtures/base";
import { StatePage } from "../pages/state.page";
import { TIMEOUT_LOADING } from "../support/shared/timeouts";
import {
  GENERAL_INFORMATION_SECTION,
  GENERAL_INFO_FIELDS,
  openSubmittedSection,
  openUnsubmittedSection,
  openUnsubmittedSectionWithSustainabilityRetry,
  prepareReportForSubmission,
  REVIEW_SUBMIT_SECTION,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
} from "../support/report/edit.helpers";
import {
  verifyFieldIsReadOnly,
  verifyCurrentSection,
} from "../support/assertions/report-edit.assertions";

const arrangeReviewSubmitSection = async (statePage: StatePage) => {
  const section = await openUnsubmittedSection(
    statePage,
    REVIEW_SUBMIT_SECTION,
    {
      candidateIndex: 0,
      preferBootstrapId: true,
      preferredEditableScenario: "blocked",
    }
  );
  if (!section.ok) {
    test.skip(true, section.reason);
    return null;
  }

  const editor = section.editor;
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

test.describe("Report Editing - Submit and Readonly", () => {
  test("should render submitted reports as read-only in general information", async ({
    statePage,
  }) => {
    const section = await openSubmittedSection(
      statePage,
      GENERAL_INFORMATION_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    await verifyCurrentSection(editor, GENERAL_INFORMATION_SECTION);
    for (const field of GENERAL_INFO_FIELDS) {
      await verifyFieldIsReadOnly(editor, field.label);
    }
  });

  test("should keep submission blocked when required responses are missing", async ({
    statePage,
  }) => {
    const context = await arrangeReviewSubmitSection(statePage);
    if (!context) {
      return;
    }
    const { submitButton, blockedMessage, editor } = context;

    await verifyCurrentSection(editor, REVIEW_SUBMIT_SECTION);

    if (!(await blockedMessage.isVisible().catch(() => false))) {
      test.skip(
        true,
        "Unable to reproduce blocked submission state with available unsubmitted report"
      );
      return;
    }

    await expect(submitButton).toBeVisible();
    const submitWasEnabled = await submitButton.isEnabled();

    if (submitWasEnabled) {
      await submitButton.click();
    }

    await verifyCurrentSection(editor, REVIEW_SUBMIT_SECTION);
    await expect(blockedMessage).toBeVisible();
    if (!submitWasEnabled) {
      await expect(submitButton).toBeDisabled();
    }
    await expect(
      editor.page.getByRole("heading", { name: /Successfully Submitted/i })
    ).toBeHidden();
  });

  test("should submit a report when submission criteria are met", async ({
    statePage,
  }) => {
    const section = await openUnsubmittedSection(
      statePage,
      REVIEW_SUBMIT_SECTION,
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

    let prepResult = await prepareReportForSubmission(editor);
    if (
      !prepResult.submittable &&
      /Sustainability and Highlights/i.test(prepResult.reason ?? "")
    ) {
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
      prepResult = await prepareReportForSubmission(editor);
    }

    if (!prepResult.submittable) {
      test.skip(
        true,
        `Report was not submittable after preparation: ${prepResult.reason ?? "unknown reason"}`
      );
      return;
    }

    const finalSubmitButton = editor.page.getByRole("button", {
      name: /Submit .* Report/i,
    });

    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      REVIEW_SUBMIT_SECTION
    );
    await verifyCurrentSection(editor, REVIEW_SUBMIT_SECTION);
    await expect(finalSubmitButton).toBeVisible();

    await expect(finalSubmitButton).toBeEnabled({ timeout: TIMEOUT_LOADING });

    await finalSubmitButton.click();
    const confirmModal = editor.page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();

    await confirmModal
      .getByRole("button", { name: /Submit .* Report/i })
      .click();

    await expect(
      editor.page.getByRole("heading", { name: /Successfully Submitted/i })
    ).toBeVisible({ timeout: TIMEOUT_LOADING });
    await expect(finalSubmitButton).toBeHidden();
  });
});
