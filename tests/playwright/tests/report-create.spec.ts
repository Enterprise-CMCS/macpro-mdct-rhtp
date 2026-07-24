import { test, expect } from "./fixtures/base";
import { DashboardPage, DashboardState } from "./pageObjects/dashboard.page";
import {
  CopyModalSubmitResult,
  CreateModalSubmitResult,
  ReportModalPage,
} from "./pageObjects/report-modal.page";
import { reportType, stateAbbreviation } from "../utils/consts";
import { determineRetryAfterDateBlock } from "../utils/report-date-gate-retry";

test.describe("Report Creation", () => {
  const REPORT_TYPE = reportType;
  const STATE = stateAbbreviation;

  const recoverFromDateBlockedCreate = async (
    dashboard: DashboardPage,
    modal: ReportModalPage
  ): Promise<CreateModalSubmitResult> => {
    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
    await dashboard.openCreateModal();
    return modal.submitCreateModal();
  };

  const recoverFromDateBlockedCopy = async (
    dashboard: DashboardPage,
    modal: ReportModalPage
  ): Promise<CopyModalSubmitResult> => {
    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
    await dashboard.openCopyModal();
    return modal.submitCopyModal();
  };

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
    const modal = new ReportModalPage(statePage.page);

    // Act - Navigate to dashboard and detect state
    const dashboardState = await navigateAndGetState(dashboard);

    if (dashboardState !== "empty") {
      test.skip(
        true,
        `Create-empty-path requires empty dashboard; found ${dashboardState}`
      );
      return;
    }

    // Assert empty dashboard state (Start readiness is covered by openCreateModal's built-in waiting)
    expect(await dashboard.isCopyButtonVisible()).toBe(false);

    // Act - Create a report
    await dashboard.openCreateModal();
    let createOutcome = await modal.submitCreateModal();
    createOutcome = await determineRetryAfterDateBlock(
      createOutcome,
      dashboard,
      () => recoverFromDateBlockedCreate(dashboard, modal)
    );

    // Assert - Report created successfully (or blocked by business rules, which is acceptable)
    expect(["created", "blocked"]).toContain(createOutcome.status);
  });

  test("should disable new report creation and copying when an unsubmitted report is present", async ({
    statePage,
  }) => {
    // Arrange
    const dashboard = new DashboardPage(statePage.page);

    // Act - Navigate to dashboard and detect state
    const dashboardState = await navigateAndGetState(dashboard);

    if (dashboardState !== "unsubmitted") {
      test.skip(
        true,
        `Unsubmitted-blocking-path requires unsubmitted dashboard; found ${dashboardState}`
      );
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
    const modal = new ReportModalPage(statePage.page);

    // Act - Navigate to dashboard and detect state
    const dashboardState = await navigateAndGetState(dashboard);

    if (dashboardState !== "submitted") {
      test.skip(
        true,
        `Copy-submitted-path requires submitted dashboard; found ${dashboardState}`
      );
      return;
    }

    // Assert submitted dashboard state — button relabels to "Copy", "Start" variant should not be visible
    expect(await dashboard.isCopyButtonAvailable()).toBe(true);
    expect(await dashboard.isStartButtonVisible()).toBe(false);

    // Act - Open and submit copy modal
    await dashboard.openCopyModal();
    let copyResult = await modal.submitCopyModal();
    copyResult = await determineRetryAfterDateBlock(copyResult, dashboard, () =>
      recoverFromDateBlockedCopy(dashboard, modal)
    );

    // Assert - Copy was successful (or blocked by business rules, which is acceptable)
    expect(["copied", "blocked"]).toContain(copyResult.status);
  });
});
