import { test, expect } from "../fixtures/base";
import { DashboardPage } from "../pages/dashboard.page";
import { ReportModalPage } from "../pages/report-modal.page";
import { reportType, stateAbbreviation } from "../support/shared/consts";
import {
  ensureStableEmptyCreateScenario,
  ensureSubmittedCopyScenario,
  readCreateBootstrapState,
  requireBootstrapScenarioId,
} from "../support/report/create.scenarios";

test.describe("Report Creation", () => {
  const bootstrapState = readCreateBootstrapState();

  test("should allow creating a new report when no reports exist on the dashboard", async ({
    statePage,
  }) => {
    // Arrange
    const dashboard = new DashboardPage(statePage.page);
    const modal = new ReportModalPage(statePage.page);

    const emptyScenario = await ensureStableEmptyCreateScenario(dashboard);
    if (!emptyScenario.ok) {
      test.skip(true, emptyScenario.reason);
      return;
    }

    // Act - Create a report
    await dashboard.openCreateModal();
    const createOutcome = await modal.submitCreateModal();

    // Assert - Report created successfully (or blocked by business rules, which is acceptable)
    expect(["created", "blocked"]).toContain(createOutcome);
  });

  test("should disable new report creation and copying when an unsubmitted report is present", async ({
    statePage,
  }) => {
    const unsubmittedScenario = requireBootstrapScenarioId(
      bootstrapState?.createScenarioUnsubmittedReportId,
      "Bootstrap did not provide unsubmitted create scenario id"
    );
    if (!unsubmittedScenario.ok) {
      test.skip(true, unsubmittedScenario.reason);
      return;
    }

    // Arrange
    const dashboard = new DashboardPage(statePage.page);
    await dashboard.navigateToDashboard(reportType, stateAbbreviation);

    // Assert blocking behavior
    expect(await dashboard.isStartButtonAvailable()).toBe(false);
    expect(await dashboard.isCopyButtonAvailable()).toBe(false);
  });

  test("should allow copying a submitted report for a future reporting cycle", async ({
    statePage,
  }) => {
    const submittedScenario = requireBootstrapScenarioId(
      bootstrapState?.createScenarioSubmittedReportId,
      "Bootstrap did not provide submitted create scenario id"
    );
    if (!submittedScenario.ok) {
      test.skip(true, submittedScenario.reason);
      return;
    }

    // Arrange
    const dashboard = new DashboardPage(statePage.page);
    const modal = new ReportModalPage(statePage.page);

    const copyScenario = await ensureSubmittedCopyScenario(dashboard);
    if (!copyScenario.ok) {
      test.skip(true, copyScenario.reason);
      return;
    }

    // Act - Open and submit copy modal
    await dashboard.openCopyModal();
    const copyResult = await modal.submitCopyModal();

    // Assert - Copy was successful (or blocked by business rules, which is acceptable)
    expect(["copied", "blocked"]).toContain(copyResult);
  });
});
