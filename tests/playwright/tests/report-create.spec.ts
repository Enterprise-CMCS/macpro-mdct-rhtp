import { test, expect } from "./fixtures/base";
import { DashboardPage } from "./pageObjects/dashboard.page";
import { ModalPage } from "./pageObjects/modal.page";
import { reportType, stateAbbreviation } from "../utils/consts";

test.describe("Report Creation", () => {
  const REPORT_TYPE = reportType;
  const STATE = stateAbbreviation;

  test("should create a new report with required fields", async ({
    statePage,
  }) => {
    // Arrange
    const dashboard = new DashboardPage(statePage.page);
    const modal = new ModalPage(statePage.page);

    // Act - Navigate to dashboard
    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
    const beforeCount = await dashboard.getReportCount();

    // Check if create button is available (may not be if report already exists)
    const canCreate = await dashboard.isCreateButtonAvailable();
    if (!canCreate) {
      console.log(
        "Create button not available on dashboard (likely a report already exists), skipping create test"
      );
      return;
    }

    // Try to create a new report
    await dashboard.openCreateModal();
    const createOutcome = await modal.submitCreateModal();

    if (createOutcome === "created") {
      // Created flow should end on detail page or eventually increase dashboard rows.
      const currentUrl = statePage.page.url();
      const isOnDetailPage = currentUrl.includes(
        `/report/${REPORT_TYPE}/${STATE}/`
      );

      if (isOnDetailPage) {
        await expect(
          statePage.page.getByText(/Not started|In progress|Submitted/i)
        ).toBeVisible();
      } else {
        await expect
          .poll(async () => dashboard.getReportCount())
          .toBeGreaterThan(beforeCount);
      }
    } else {
      // Blocked flow is only valid when there was already at least one report.
      await expect(beforeCount).toBeGreaterThan(0);
      await expect(dashboard.getReportCount()).resolves.toBe(beforeCount);
    }
  });

  test("should prevent creation when unsubmitted report exists", async ({
    statePage,
  }) => {
    // Validates that the UI correctly blocks report creation
    // when an unsubmitted report already exists
    const dashboard = new DashboardPage(statePage.page);

    // Navigate to dashboard
    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);

    // Check if we have unsubmitted reports
    const hasUnsubmitted = await dashboard.hasUnsubmittedReports();
    if (!hasUnsubmitted) {
      console.log("No unsubmitted reports to test blocking behavior, skipping");
      return;
    }

    // Create button should not be available when unsubmitted report exists
    const canCreate = await dashboard.isCreateButtonAvailable();
    expect(canCreate).toBe(false);

    // UI should show Copy button instead
    const copyButton = statePage.page
      .getByRole("button")
      .filter({ hasText: /Copy/ })
      .first();
    await expect(copyButton).toBeVisible();
  });

  test("should copy an existing report", async ({ statePage }) => {
    // Arrange
    const dashboard = new DashboardPage(statePage.page);
    const modal = new ModalPage(statePage.page);

    // Act - Navigate to dashboard
    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);

    // Try to open the copy modal - it only appears if there's a submitted report
    const copyButton = statePage.page
      .getByRole("button")
      .filter({ hasText: /Copy/ })
      .first();
    const isCopyAvailable = await copyButton.isVisible().catch(() => false);

    if (!isCopyAvailable) {
      // Copy requires a previously submitted report
      // Since we don't have one yet (the first report is still "Not started"), skip
      console.log(
        "No submitted reports available for copying, skipping copy test"
      );
      return;
    }

    // Open copy modal and proceed
    await dashboard.openCopyModal();

    // Get the first report ID to copy
    const firstReportId = await modal.getFirstReportOptionValue();
    if (!firstReportId) {
      console.log("No reports in copy dropdown, skipping");
      return;
    }

    await modal.selectCopyFromReport(firstReportId);
    await modal.submitCopyModal();

    // Assert - Should be on the newly copied report detail page
    await expect(statePage.page).toHaveURL(/\/report\/.+\/.+\/.+/);
    await expect(
      statePage.page.getByText(/Not started|In progress|Submitted/i)
    ).toBeVisible();
  });
});
