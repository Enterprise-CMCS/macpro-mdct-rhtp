import { test, expect } from "../fixtures/base";
import { ReportEditorPage } from "../pages/report-editor.page";
import { openReportSection } from "../support/report/arrange";
import {
  INITIATIVE_ATTACHMENTS_SECTION,
  INITIATIVES_SECTION,
  REVIEW_SUBMIT_SECTION,
  STATE_POLICY_COMMITMENTS_SECTION,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
  USE_OF_FUNDS_SECTION,
} from "../support/report/edit.helpers";
import {
  verifyCurrentSection,
  verifyContinueVisible,
  verifyPreviousVisible,
} from "../support/assertions/report-edit.assertions";

const verifySectionNavState = async (
  editor: ReportEditorPage,
  options: { hasPrevious: boolean; hasContinue: boolean }
) => {
  if (options.hasPrevious) {
    await verifyPreviousVisible(editor);
  } else {
    await expect(editor.previousButton).toBeHidden();
  }

  if (options.hasContinue) {
    await verifyContinueVisible(editor);
  } else {
    await expect(editor.continueButton).toBeHidden();
  }
};

test.describe("Report Editing - Section Rendering", () => {
  test("should render the initiative attachments section for an unsubmitted report @regression", async ({
    statePage,
  }) => {
    const section = await openReportSection(
      statePage,
      "unsubmitted",
      INITIATIVE_ATTACHMENTS_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    await verifyCurrentSection(editor, INITIATIVE_ATTACHMENTS_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: true,
      hasContinue: true,
    });
    await expect(
      editor.page.getByRole("heading", { name: "Initiative Attachments" })
    ).toBeVisible();
    await expect(editor.page.getByRole("table").first()).toBeVisible();
  });

  test("should render the initiatives section for an unsubmitted report @regression", async ({
    statePage,
  }) => {
    const section = await openReportSection(
      statePage,
      "unsubmitted",
      INITIATIVES_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    await verifyCurrentSection(editor, INITIATIVES_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: true,
      hasContinue: true,
    });
    await expect(
      editor.page.getByRole("heading", { name: "Initiatives" })
    ).toBeVisible();
  });

  test("should render the state policy commitments section for an unsubmitted report @regression", async ({
    statePage,
  }) => {
    const section = await openReportSection(
      statePage,
      "unsubmitted",
      STATE_POLICY_COMMITMENTS_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    await verifyCurrentSection(editor, STATE_POLICY_COMMITMENTS_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: true,
      hasContinue: true,
    });
    await expect(
      editor.page.getByRole("heading", { name: "State Policy Commitments" })
    ).toBeVisible();
  });

  test("should render the use of funds section for an unsubmitted report @regression", async ({
    statePage,
  }) => {
    const section = await openReportSection(
      statePage,
      "unsubmitted",
      USE_OF_FUNDS_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    await verifyCurrentSection(editor, USE_OF_FUNDS_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: true,
      hasContinue: true,
    });
    await expect(
      editor.page.getByRole("heading", { name: "Use of Funds" })
    ).toBeVisible();
    await expect(
      editor.page.getByRole("button", { name: /Add Use of Funds/i })
    ).toBeVisible();
  });

  test("should render the sustainability and highlights section for an unsubmitted report @regression", async ({
    statePage,
  }) => {
    const section = await openReportSection(
      statePage,
      "unsubmitted",
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION
    );
    if (!section.ok) {
      test.skip(true, section.reason);
      return;
    }
    const editor = section.editor;

    await verifyCurrentSection(editor, SUSTAINABILITY_AND_HIGHLIGHTS_SECTION);
    await verifySectionNavState(editor, {
      hasPrevious: true,
      hasContinue: true,
    });
    await expect(
      editor.page.getByRole("heading", {
        name: "Sustainability and Highlights",
      })
    ).toBeVisible();
    await expect(
      editor.page.getByText("Success Stories", { exact: true })
    ).toBeVisible();
    await expect(
      editor.page.getByText("Sustainability Planning", { exact: true })
    ).toBeVisible();
    await expect(
      editor.page.getByLabel(
        /Share success stories that you want to highlight as result of your State’s implementation of the RHT Program\./
      )
    ).toBeVisible();
    await expect(
      editor.page.getByLabel(
        /What are the most significant updates or changes to your sustainability plan based on the past year’s experiences, successes, and challenges\?/
      )
    ).toBeVisible();
  });

  test("should render the review and submit section for an unsubmitted report @regression", async ({
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

    await verifyCurrentSection(editor, REVIEW_SUBMIT_SECTION);
    await expect(
      editor.page.getByRole("heading", { name: "Review & Submit" })
    ).toBeVisible();
    await expect(
      editor.page.getByText("Ready to Submit?", { exact: true })
    ).toBeVisible();
    const blockedMessage = editor.page.getByText(
      "Your form is not ready for submission",
      {
        exact: true,
      }
    );
    const finalSubmitButton = editor.page.getByRole("button", {
      name: /Submit .* Report/i,
    });

    if (await blockedMessage.isVisible().catch(() => false)) {
      await expect(blockedMessage).toBeVisible();
      await expect(
        editor.page.getByRole("button", { name: /Submit for Review/i })
      ).toBeVisible();
    } else {
      await expect(finalSubmitButton).toBeVisible();
    }
    await expect(editor.continueButton).toBeHidden();
    await expect(editor.previousButton).toBeHidden();
  });
});
