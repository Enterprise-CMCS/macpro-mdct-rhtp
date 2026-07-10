import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DashboardPage, DashboardState } from "../../pages/dashboard.page";
import { reportType, stateAbbreviation } from "../shared/consts";

export type ReportBootstrapState = {
  createScenarioUnsubmittedReportId?: string;
  createScenarioSubmittedReportId?: string;
};

export type ScenarioCheckResult =
  | { ok: true; dashboardState?: DashboardState }
  | { ok: false; reason: string; dashboardState?: DashboardState };

const BOOTSTRAP_STATE_PATH = resolve(
  process.cwd(),
  "test-results/report-bootstrap-state.json"
);

export const readCreateBootstrapState = (): ReportBootstrapState | null => {
  try {
    const raw = readFileSync(BOOTSTRAP_STATE_PATH, "utf8");
    return JSON.parse(raw) as ReportBootstrapState;
  } catch {
    return null;
  }
};

export const navigateAndGetDashboardState = async (
  dashboard: DashboardPage
): Promise<DashboardState> => {
  await dashboard.navigateToDashboard(reportType, stateAbbreviation);
  return dashboard.getDashboardState();
};

export const requireBootstrapScenarioId = (
  value: string | undefined,
  missingReason: string
): ScenarioCheckResult => {
  if (!value) {
    return { ok: false, reason: missingReason };
  }

  return { ok: true };
};

export const ensureStableEmptyCreateScenario = async (
  dashboard: DashboardPage
): Promise<ScenarioCheckResult> => {
  const dashboardState = await navigateAndGetDashboardState(dashboard);

  if (dashboardState !== "empty") {
    return {
      ok: false,
      reason:
        "Empty-dashboard create scenario not available in this shared state run",
      dashboardState,
    };
  }

  const hasStartButton = await dashboard.isStartButtonAvailable();
  if (hasStartButton) {
    return { ok: true, dashboardState };
  }

  // Dashboard can transition from "empty" while data hydration completes.
  const refreshedState = await navigateAndGetDashboardState(dashboard);
  if (
    refreshedState !== "empty" ||
    !(await dashboard.isStartButtonAvailable())
  ) {
    return {
      ok: false,
      reason: "Empty-dashboard create scenario transitioned before assertion",
      dashboardState: refreshedState,
    };
  }

  return { ok: true, dashboardState: refreshedState };
};

export const ensureSubmittedCopyScenario = async (
  dashboard: DashboardPage
): Promise<ScenarioCheckResult> => {
  const dashboardState = await navigateAndGetDashboardState(dashboard);

  if (!(await dashboard.isCopyButtonAvailable())) {
    return {
      ok: false,
      reason: `Submitted copy scenario not currently actionable (dashboard state: ${dashboardState})`,
      dashboardState,
    };
  }

  if (dashboardState !== "submitted") {
    return {
      ok: false,
      reason: `Submitted copy scenario not active (dashboard state: ${dashboardState})`,
      dashboardState,
    };
  }

  return { ok: true, dashboardState };
};
