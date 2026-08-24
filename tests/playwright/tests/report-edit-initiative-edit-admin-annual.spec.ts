import { test, expect } from "./fixtures/base";
import { openReportSectionOrSkip } from "../utils/report-edit-arrange";
import { INITIATIVES_SECTION } from "../utils/report-edit-shared-helpers";
import {
  getOpenInitiativeHeadingText,
  openReportFromDashboard,
  openInitiativeFromList,
  verifyAdminMetricControls,
  type ReportPeriod,
} from "../utils/report-edit-initiative-edit-helpers";
import { ReportEditorPage } from "./pageObjects/report-editor.page";
import { TIMEOUT_UI } from "../utils/timeouts";

const REPORT_PERIOD: ReportPeriod = "annual";
const REPORT_PERIOD_LABEL = /Annual Report/i;

const verifyReportContextFromHeader = async (
  editor: ReportEditorPage,
  reportPeriodLabel: RegExp
): Promise<void> => {
  await expect(
    editor.page
      .locator("#header p")
      .filter({ hasText: reportPeriodLabel })
      .first()
  ).toBeVisible({ timeout: TIMEOUT_UI });
};

test.describe("Report Editing - Initiative Edit Page (Annual, Admin)", () => {
  let editor: ReportEditorPage;
  let selectedInitiativeNumberAndName = "";

  test.beforeEach(async ({ adminPage }) => {
    const result = await openReportSectionOrSkip(
      adminPage,
      "unsubmitted",
      INITIATIVES_SECTION,
      (reason) => test.skip(true, reason)
    );
    if (!result) {
      throw new Error(
        "openReportSectionOrSkip returned undefined without skipping the test"
      );
    }

    editor = result;
    await openReportFromDashboard(editor, REPORT_PERIOD);

    const table = editor.page.getByRole("table");
    await expect(table).toBeVisible({ timeout: TIMEOUT_UI });
    selectedInitiativeNumberAndName = await openInitiativeFromList(
      editor,
      table
    );
  });

  test("should identify annual report context from header text for admin users @regression", async () => {
    await verifyReportContextFromHeader(editor, REPORT_PERIOD_LABEL);
  });

  test("should display the selected initiative heading for admin users @regression", async () => {
    await verifyReportContextFromHeader(editor, REPORT_PERIOD_LABEL);

    const openInitiativeHeading = await getOpenInitiativeHeadingText(editor);
    expect(openInitiativeHeading).toBe(selectedInitiativeNumberAndName);
  });

  test("should display admin-only metric controls for admin users @regression", async () => {
    await verifyReportContextFromHeader(editor, REPORT_PERIOD_LABEL);
    await verifyAdminMetricControls(editor, "visible");
  });
});
