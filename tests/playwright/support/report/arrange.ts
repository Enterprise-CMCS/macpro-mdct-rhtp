import { DashboardPage } from "../../pages/dashboard.page";
import { ReportEditorPage } from "../../pages/report-editor.page";
import { ReportModalPage } from "../../pages/report-modal.page";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { reportType, stateAbbreviation } from "../shared/consts";

export type OpenReportSectionResult =
  | { ok: true; editor: ReportEditorPage }
  | { ok: false; reason: string };

type ReportBootstrapState = {
  preferredEditableReportId?: string;
  preferredSubmittedReportId?: string;
  preferredSubmittableReportId?: string;
  preferredBlockedReportId?: string;
};

type LiteReportStatus = {
  id: string;
  status: string;
};

const BOOTSTRAP_STATE_PATH = resolve(
  process.cwd(),
  "test-results/report-bootstrap-state.json"
);

const readBootstrapState = (): ReportBootstrapState | null => {
  try {
    const raw = readFileSync(BOOTSTRAP_STATE_PATH, "utf8");
    return JSON.parse(raw) as ReportBootstrapState;
  } catch {
    return null;
  }
};

const EDITABLE_STATUS_PATTERN = /^(Not started|In progress|In revision)$/i;
const SUBMITTED_STATUS_PATTERN = /^(Submitted|Accepted)$/i;

const getReportStatuses = async (): Promise<LiteReportStatus[] | null> => {
  const apiUrl = process.env.API_URL;
  const stateToken = process.env.STATE_ID_TOKEN;
  if (!apiUrl || !stateToken) {
    return null;
  }

  const apiBase = apiUrl.replace(/\/$/, "");
  const reportsUrl = `${apiBase}/reports/${reportType}/${stateAbbreviation}`;

  try {
    const response = await fetch(reportsUrl, {
      method: "GET",
      headers: {
        "x-api-key": stateToken,
      },
    });
    if (!response.ok) {
      return null;
    }

    const reports = (await response.json()) as Array<{
      id?: unknown;
      status?: unknown;
    }>;

    return reports
      .filter(
        (report): report is { id: string; status: string } =>
          typeof report.id === "string" && typeof report.status === "string"
      )
      .map((report) => ({ id: report.id, status: report.status }));
  } catch {
    return null;
  }
};

const canUseBootstrapReportId = async (
  reportId: string,
  targetState: "unsubmitted" | "submitted"
): Promise<boolean> => {
  const statuses = await getReportStatuses();
  if (!statuses) {
    return false;
  }

  const report = statuses.find((item) => item.id === reportId);
  if (!report) {
    return false;
  }

  return targetState === "unsubmitted"
    ? EDITABLE_STATUS_PATTERN.test(report.status)
    : SUBMITTED_STATUS_PATTERN.test(report.status);
};

const getHasAnyReportButton = async (statePage: any): Promise<boolean> =>
  statePage.page
    .getByRole("button", { name: /^View .* report$/i })
    .first()
    .isVisible()
    .catch(() => false);

const refreshDashboardState = async (
  dashboard: DashboardPage,
  statePage: any
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
    return "submitted";
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
      await dashboard.navigateToDashboard(reportType, stateAbbreviation);
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
  unsubmittedCandidateIndex = 0,
  options?: {
    preferBootstrapId?: boolean;
    preferredEditableScenario?: "blocked" | "submittable";
  }
): Promise<OpenReportSectionResult> => {
  const dashboard = new DashboardPage(statePage.page);
  const editor = new ReportEditorPage(statePage.page);
  const modal = new ReportModalPage(statePage.page);
  const bootstrapState = readBootstrapState();

  if (targetState === "unsubmitted" && options?.preferBootstrapId) {
    let preferredEditableReportId: string | undefined;
    if (options.preferredEditableScenario === "submittable") {
      preferredEditableReportId =
        bootstrapState?.preferredSubmittableReportId ??
        bootstrapState?.preferredEditableReportId;
    } else if (options.preferredEditableScenario === "blocked") {
      preferredEditableReportId =
        bootstrapState?.preferredBlockedReportId ??
        bootstrapState?.preferredEditableReportId;
    } else {
      preferredEditableReportId = bootstrapState?.preferredEditableReportId;
    }

    if (
      preferredEditableReportId &&
      (await canUseBootstrapReportId(preferredEditableReportId, "unsubmitted"))
    ) {
      try {
        await editor.navigateToSection(
          reportType,
          stateAbbreviation,
          preferredEditableReportId,
          sectionId
        );
        return { ok: true, editor };
      } catch {
        // Fall through to dashboard-driven selection when cached ID is stale.
      }
    }
  }

  if (
    targetState === "submitted" &&
    bootstrapState?.preferredSubmittedReportId &&
    (await canUseBootstrapReportId(
      bootstrapState.preferredSubmittedReportId,
      "submitted"
    ))
  ) {
    try {
      await editor.navigateToSection(
        reportType,
        stateAbbreviation,
        bootstrapState.preferredSubmittedReportId,
        sectionId
      );
      return { ok: true, editor };
    } catch {
      // Fall through to dashboard-driven selection when cached ID is stale.
    }
  }

  await dashboard.navigateToDashboard(reportType, stateAbbreviation);
  let dashboardState = await refreshDashboardState(dashboard, statePage);

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
        await dashboard.navigateToDashboard(reportType, stateAbbreviation);
        dashboardState = await refreshDashboardState(dashboard, statePage);
        if (dashboardState === "empty") {
          return {
            ok: false,
            reason: "Report creation blocked by business rules",
          };
        }
      }

      await dashboard.navigateToDashboard(reportType, stateAbbreviation);
      dashboardState = await refreshDashboardState(dashboard, statePage);
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
      await dashboard.navigateToDashboard(reportType, stateAbbreviation);
      dashboardState = await refreshDashboardState(dashboard, statePage);
      if (dashboardState !== "unsubmitted") {
        return { ok: false, reason: "Report copy blocked by business rules" };
      }
    }

    await dashboard.navigateToDashboard(reportType, stateAbbreviation);
    dashboardState = await refreshDashboardState(dashboard, statePage);
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
