import { test, expect } from "./fixtures/base";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import {
  INITIATIVE_ATTACHMENTS_SECTION,
  INITIATIVES_SECTION,
  REVIEW_SUBMIT_SECTION,
  STATE_POLICY_COMMITMENTS_SECTION,
  SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
  USE_OF_FUNDS_SECTION,
} from "../utils/report-edit-helpers";
import {
  verifyCurrentSection,
  verifyContinueVisible,
  verifyPreviousVisible,
} from "../utils/report-edit-assertions";

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
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      INITIATIVE_ATTACHMENTS_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

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
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      INITIATIVES_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

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
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      STATE_POLICY_COMMITMENTS_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

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
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      USE_OF_FUNDS_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

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
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      SUSTAINABILITY_AND_HIGHLIGHTS_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

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
  });

  test("should render the review and submit section shell for an unsubmitted report @regression", async ({
    statePage,
  }) => {
    const editor = await openReportSectionOrSkip(
      statePage,
      "unsubmitted",
      REVIEW_SUBMIT_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!editor) {
      return;
    }

    await verifyCurrentSection(editor, REVIEW_SUBMIT_SECTION);
    await expect(
      editor.page.getByRole("heading", { name: "Review & Submit" })
    ).toBeVisible();
    await expect(editor.continueButton).toBeHidden();
    await expect(editor.previousButton).toBeHidden();
  });
});
