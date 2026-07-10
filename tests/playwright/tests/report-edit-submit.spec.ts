import { test, expect } from "./fixtures/base";
import { StatePage } from "./pageObjects/state.page";
import { TIMEOUT_LOADING } from "../utils/timeouts";
import { openReportSection } from "../utils/report-edit-arrange";
import {
  GENERAL_INFORMATION_SECTION,
  GENERAL_INFO_FIELDS,
  prepareReportForSubmission,
  REVIEW_SUBMIT_SECTION,
} from "../utils/report-edit-helpers";
import {
  verifyFieldIsReadOnly,
  verifyCurrentSection,
} from "../utils/report-edit-assertions";

const arrangeReviewSubmitSection = async (statePage: StatePage) => {
  const section = await openReportSection(
    statePage,
    "unsubmitted",
    REVIEW_SUBMIT_SECTION
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
    const section = await openReportSection(
      statePage,
      "submitted",
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
    const section = await openReportSection(
      statePage,
      "unsubmitted",
      REVIEW_SUBMIT_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    const finalSubmitButton = editor.page.getByRole("button", {
      name: /Submit .* Report/i,
    });

    const prepResult = await prepareReportForSubmission(editor);
    const { reportType, state, reportId } = editor.getCurrentRouteParams();
    await editor.navigateToSection(
      reportType,
      state,
      reportId,
      REVIEW_SUBMIT_SECTION
    );
    await verifyCurrentSection(editor, REVIEW_SUBMIT_SECTION);
    await expect(finalSubmitButton).toBeVisible();

    if (!prepResult.submittable) {
      console.warn(
        `Skipping final submission test: ${prepResult.reason ?? "report not submittable"}`
      );
      test.skip(true, prepResult.reason ?? "report not submittable");
      return;
    }

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
