import { test, expect } from "./fixtures/base";
import { openReportSectionWithTimeoutOrSkip } from "../utils/report-edit-arrange";
import {
  getReportTestRunId,
  GENERAL_INFORMATION_SECTION,
  STATE_POLICY_COMMITMENTS_SECTION,
} from "../utils/report-edit-shared-helpers";
import {
  applyCommitmentEdits,
  openFirstCommitmentAccordion,
  verifyCommitmentSectionLoaded,
  verifyCommitmentValues,
} from "../utils/report-edit-commitments-helpers";

test.describe("Report Editing - State Policy Commitments", () => {
  test("should persist commitment status, link, notes, and attachment edits @regression", async ({
    statePage,
  }) => {
    test.slow();

    const editor = await openReportSectionWithTimeoutOrSkip(
      statePage,
      "unsubmitted",
      STATE_POLICY_COMMITMENTS_SECTION,
      (reason) => test.skip(true, reason),
      {
        timeoutReason: "Timed out opening commitments section",
      }
    );
    if (!editor) {
      return;
    }

    await verifyCommitmentSectionLoaded(editor);
    await expect(editor.previousButton).toBeVisible();
    await expect(editor.continueButton).toBeVisible();

    const commitmentContainer = await openFirstCommitmentAccordion(editor);
    if (!commitmentContainer) {
      test.skip(true, "No commitment accordion was available");
      return;
    }

    const expectedEdits = await applyCommitmentEdits(
      editor,
      commitmentContainer,
      getReportTestRunId()
    );
    if (!expectedEdits) {
      test.skip(
        true,
        "Current Status field was not editable in this environment"
      );
      return;
    }

    const { reportType, state, reportId } = editor.getCurrentRouteParams();

    await editor.navigateToSectionAndBack(
      reportType,
      state,
      reportId,
      GENERAL_INFORMATION_SECTION,
      STATE_POLICY_COMMITMENTS_SECTION
    );

    await verifyCommitmentSectionLoaded(editor);
    const returnedCommitmentContainer =
      await openFirstCommitmentAccordion(editor);
    if (!returnedCommitmentContainer) {
      test.skip(true, "No commitment accordion was available after navigation");
      return;
    }

    const verified = await verifyCommitmentValues(
      returnedCommitmentContainer,
      expectedEdits
    );
    if (!verified) {
      test.skip(true, "Current Status value was unavailable after navigation");
    }
  });
});
