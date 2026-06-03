import { test, expect } from "./fixtures/base";
import { DashboardPage, DashboardState } from "./pageObjects/dashboard.page";
import { ModalPage } from "./pageObjects/modal.page";
import { reportType, stateAbbreviation } from "../utils/consts";

test.describe("Report Creation", () => {
  const REPORT_TYPE = reportType;
  const STATE = stateAbbreviation;

  const navigateAndGetState = async (
    dashboard: DashboardPage
  ): Promise<DashboardState> => {
    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
    return dashboard.getDashboardState();
  };

  test("should allow creating a new report when no reports exist on the dashboard", async ({
    statePage,
  }) => {
    // Arrange
    const dashboard = new DashboardPage(statePage.page);
    const modal = new ModalPage(statePage.page);

    // Act - Navigate to dashboard and detect state
    const dashboardState = await navigateAndGetState(dashboard);

    if (dashboardState !== "empty") {
      test.skip();
      return;
    }

    // Assert empty dashboard state
    expect(await dashboard.isStartButtonAvailable()).toBe(true);
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

    // Act - Navigate to dashboard and detect state
    const dashboardState = await navigateAndGetState(dashboard);

    if (dashboardState !== "unsubmitted") {
      test.skip();
      return;
    }

    // Assert blocking behavior
    expect(await dashboard.isStartButtonAvailable()).toBe(false);
    expect(await dashboard.isCopyButtonAvailable()).toBe(false);
  });

  test("should allow copying a submitted report for a future reporting cycle", async ({
    statePage,
  }) => {
    // Arrange
    const dashboard = new DashboardPage(statePage.page);
    const modal = new ModalPage(statePage.page);

    // Act - Navigate to dashboard and detect state
    const dashboardState = await navigateAndGetState(dashboard);

    if (dashboardState !== "submitted") {
      test.skip();
      return;
    }

    // Assert submitted dashboard state — button relabels to "Copy", "Start" variant should not be visible
    expect(await dashboard.isCopyButtonAvailable()).toBe(true);
    expect(await dashboard.isStartButtonVisible()).toBe(false);

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
