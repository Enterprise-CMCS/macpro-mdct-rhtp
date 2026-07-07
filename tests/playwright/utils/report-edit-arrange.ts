import { DashboardPage } from "../tests/pageObjects/dashboard.page";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import { ReportModalPage } from "../tests/pageObjects/report-modal.page";
import { reportType, stateAbbreviation } from "./consts";

const REPORT_TYPE = reportType;
const STATE = stateAbbreviation;

export type OpenReportSectionResult =
  | { ok: true; editor: ReportEditorPage }
  | { ok: false; reason: string };

const getHasAnyReportButton = async (statePage: any): Promise<boolean> =>
  statePage.page
    .getByRole("button", { name: /^View .* report$/i })
    .first()
    .isVisible()
    .catch(() => false);

const refreshDashboardState = async (
  dashboard: DashboardPage,
  statePage: any,
  targetState: "unsubmitted" | "submitted"
): Promise<"empty" | "unsubmitted" | "submitted"> => {
  let dashboardState = await dashboard.getDashboardState();

  if (dashboardState !== "empty") {
    return dashboardState;
  }

  const isStartEnabled = await dashboard.isStartButtonAvailable();
  if (!isStartEnabled) {
    for (let attempt = 0; attempt < 3; attempt++) {
      dashboardState = await dashboard.getDashboardState();
      if (dashboardState !== "empty") {
        return dashboardState;
      }
    }
  }

  const [editableCount, hasAnyReportButton, hasCopyButton] = await Promise.all([
    dashboard.getEditableReportCount().catch(() => 0),
    getHasAnyReportButton(statePage),
    dashboard.isCopyButtonVisible(),
  ]);

  if (editableCount > 0) {
    return "unsubmitted";
  }

  if (hasAnyReportButton || hasCopyButton) {
    return targetState === "unsubmitted" ? "submitted" : "submitted";
  }

  return "empty";
};

const openDashboardModal = async (
  openModal: () => Promise<void>,
  dashboard: DashboardPage
): Promise<boolean> => {
  try {
    await openModal();
    return true;
  } catch {
    try {
      await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
      await openModal();
      return true;
    } catch {
      return false;
    }
  }
};

export const openReportSection = async (
  statePage: any,
  targetState: "unsubmitted" | "submitted",
  sectionId: string,
  unsubmittedCandidateIndex = 0
): Promise<OpenReportSectionResult> => {
  const dashboard = new DashboardPage(statePage.page);
  const editor = new ReportEditorPage(statePage.page);
  const modal = new ReportModalPage(statePage.page);

  await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
  let dashboardState = await refreshDashboardState(
    dashboard,
    statePage,
    targetState
  );

  if (targetState === "unsubmitted" && dashboardState === "empty") {
    const canCreate = await dashboard.isStartButtonAvailable();
    if (!canCreate) {
      const hasReports =
        (await dashboard.isCopyButtonVisible()) ||
        (await getHasAnyReportButton(statePage));

      if (hasReports) {
        dashboardState = "submitted";
      } else {
        return { ok: false, reason: "No creatable or existing reports found" };
      }
    } else {
      const openedCreateModal = await openDashboardModal(
        () => dashboard.openCreateModal(),
        dashboard
      );
      if (!openedCreateModal) {
        return { ok: false, reason: "Create report modal unavailable" };
      }

      const createOutcome = await modal.submitCreateModal();
      if (createOutcome !== "created") {
        await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
        dashboardState = await refreshDashboardState(
          dashboard,
          statePage,
          targetState
        );
        if (dashboardState === "empty") {
          return {
            ok: false,
            reason: "Report creation blocked by business rules",
          };
        }
      }

      await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
      dashboardState = await refreshDashboardState(
        dashboard,
        statePage,
        targetState
      );
    }
  }

  if (targetState === "unsubmitted" && dashboardState === "submitted") {
    const openedCopyModal = await openDashboardModal(
      () => dashboard.openCopyModal(),
      dashboard
    );
    if (!openedCopyModal) {
      return { ok: false, reason: "Copy report modal unavailable" };
    }

    const copyOutcome = await modal.submitCopyModal();
    if (copyOutcome !== "copied") {
      await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
      dashboardState = await refreshDashboardState(
        dashboard,
        statePage,
        targetState
      );
      if (dashboardState !== "unsubmitted") {
        return { ok: false, reason: "Report copy blocked by business rules" };
      }
    }

    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
    dashboardState = await refreshDashboardState(
      dashboard,
      statePage,
      targetState
    );
  }

  if (dashboardState !== targetState) {
    return {
      ok: false,
      reason: `Required dashboard state not available: expected ${targetState}, got ${dashboardState}`,
    };
  }

  if (targetState === "unsubmitted") {
    try {
      await dashboard.openEditableReportByIndex(unsubmittedCandidateIndex);
    } catch {
      return {
        ok: false,
        reason: "Unable to open an editable report from dashboard",
      };
    }
  } else {
    try {
      await dashboard.openFirstSubmittedReport();
    } catch {
      return {
        ok: false,
        reason: "Unable to open a submitted report from dashboard",
      };
    }
  }

  const {
    reportType: currentReportType,
    state,
    reportId,
  } = editor.getCurrentRouteParams();

  try {
    await editor.navigateToSection(
      currentReportType,
      state,
      reportId,
      sectionId
    );
  } catch {
    return {
      ok: false,
      reason: `Unable to navigate to section ${sectionId}`,
    };
  }

  return { ok: true, editor };
};
