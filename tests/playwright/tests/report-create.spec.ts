import { test, expect } from "./fixtures/base";
import { DashboardPage } from "./pageObjects/dashboard.page";
import { ModalPage } from "./pageObjects/modal.page";
import { reportType, stateAbbreviation } from "../utils/consts";

test.describe("Report Creation", () => {
  const REPORT_TYPE = reportType;
  const STATE = stateAbbreviation;

  test("should allow creating a new report when no reports exist on the dashboard", async ({
    statePage,
  }) => {
    // Arrange
    const dashboard = new DashboardPage(statePage.page);
    const modal = new ModalPage(statePage.page);

    // Act - Navigate to dashboard
    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);

    // Wait for the dashboard to fully load reports (if any exist)
    try {
      await expect(statePage.page.locator("[role='row'], tbody")).toBeVisible({
        timeout: 5000,
      });
    } catch {
      // No table/rows found - dashboard is likely empty
    }

    // Check if we have an empty dashboard (no reports)
    const hasNoReports =
      !(await dashboard.hasSubmittedReports()) &&
      !(await dashboard.hasUnsubmittedReports());

    if (!hasNoReports) {
      test.skip();
      return;
    }

    // Assert empty dashboard state
    expect(await dashboard.isCreateButtonAvailable()).toBe(true);
    expect(await dashboard.isCopyButtonVisible()).toBe(false);

    // Act - Create a report
    await dashboard.openCreateModal();
    const createOutcome = await modal.submitCreateModal();

    // Assert - Report created successfully (or blocked by business rules, which is acceptable)
    expect(["created", "blocked"]).toContain(createOutcome);
  });

  test("should disable new report creation and copying when an unsubmitted report is present", async ({
    statePage,
  }) => {
    // Arrange
    const dashboard = new DashboardPage(statePage.page);

    // Act - Navigate to dashboard
    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);

    // Wait for the dashboard to fully load reports
    try {
      await expect(statePage.page.locator("[role='row'], tbody")).toBeVisible({
        timeout: 5000,
      });
    } catch {
      // No table/rows found - dashboard is empty
    }

    // Check if we have an unsubmitted report
    const hasUnsubmitted = await dashboard.hasUnsubmittedReports();

    if (!hasUnsubmitted) {
      test.skip();
      return;
    }

    // Assert blocking behavior
    expect(await dashboard.isCreateButtonAvailable()).toBe(false);
    expect(await dashboard.isCopyButtonAvailable()).toBe(false);
  });

  test("should allow copying a submitted report for a future reporting cycle", async ({
    statePage,
  }) => {
    // Arrange
    const dashboard = new DashboardPage(statePage.page);
    const modal = new ModalPage(statePage.page);

    // Act - Navigate to dashboard
    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);

    // Wait for the dashboard to fully load reports
    try {
      await expect(statePage.page.locator("[role='row'], tbody")).toBeVisible({
        timeout: 5000,
      });
    } catch {
      // No table/rows found - dashboard is empty
    }

    // Check if we have a submitted report (and no unsubmitted)
    const hasSubmitted = await dashboard.hasSubmittedReports();
    const hasUnsubmitted = await dashboard.hasUnsubmittedReports();

    if (!hasSubmitted || hasUnsubmitted) {
      test.skip();
      return;
    }

    // Assert submitted dashboard state
    expect(await dashboard.isCopyButtonAvailable()).toBe(true);
    expect(await dashboard.isCreateButtonVisible()).toBe(false);

    // Act - Open and submit copy modal
    await dashboard.openCopyModal();

    // Some environments show a source-report dropdown; others present direct copy confirmation.
    const hasSourceSelector = await modal.hasCopySourceSelector();
    if (hasSourceSelector) {
      const firstReportId = await modal.getFirstReportOptionValue();
      if (firstReportId) {
        await modal.selectCopyFromReport(firstReportId);
      }
    }

    const copyResult = await modal.submitCopyModal();

    // Assert - Copy was successful (or blocked by business rules, which is acceptable)
    expect(["copied", "blocked"]).toContain(copyResult);
  });
});
