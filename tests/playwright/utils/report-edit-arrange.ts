import { DashboardPage } from "../tests/pageObjects/dashboard.page";
import { ReportEditorPage } from "../tests/pageObjects/report-editor.page";
import { ReportModalPage } from "../tests/pageObjects/report-modal.page";
import type { StatePage } from "../tests/pageObjects/state.page";
import { reportType, stateAbbreviation } from "./consts";
import { determineRetryAfterDateBlock } from "./report-date-gate-retry";
import { TIMEOUT_OPEN_REPORT_SECTION } from "./timeouts";

const REPORT_TYPE = reportType;
const STATE = stateAbbreviation;

export type OpenReportSectionResult =
  | { ok: true; editor: ReportEditorPage }
  | { ok: false; reason: string };

type OpenReportSectionOptions = {
  timeoutMs?: number;
  timeoutReason?: string;
};

type SkipHandler = (reason: string) => void;

const getHasAnyReportButton = async (statePage: StatePage): Promise<boolean> =>
  statePage.page
    .getByRole("button", { name: /^View .* report$/i })
    .first()
    .isVisible()
    .catch(() => false);

const refreshDashboardState = async (
  dashboard: DashboardPage,
  statePage: StatePage
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
      await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
      await openModal();
      return true;
    } catch {
      return false;
    }
  }
};

const isEnvironmentInterruptionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /Target page, context or browser has been closed/i.test(message) ||
    /Dashboard page closed before state settled/i.test(message)
  );
};

export const openReportSection = async (
  statePage: StatePage,
  targetState: "unsubmitted" | "submitted",
  sectionId: string,
  unsubmittedCandidateIndex = 0
): Promise<OpenReportSectionResult> => {
  const dashboard = new DashboardPage(statePage.page);
  const editor = new ReportEditorPage(statePage.page);
  const modal = new ReportModalPage(statePage.page);

  try {
    await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
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
          return {
            ok: false,
            reason: "No creatable or existing reports found",
          };
        }
      } else {
        const openedCreateModal = await openDashboardModal(
          () => dashboard.openCreateModal(),
          dashboard
        );
        if (!openedCreateModal) {
          return { ok: false, reason: "Create report modal unavailable" };
        }

        let createOutcome = await modal.submitCreateModal();
        createOutcome = await determineRetryAfterDateBlock(
          createOutcome,
          dashboard,
          async () => {
            await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
            const reopenedCreateModal = await openDashboardModal(
              () => dashboard.openCreateModal(),
              dashboard
            );

            return reopenedCreateModal
              ? modal.submitCreateModal()
              : createOutcome;
          }
        );

        if (createOutcome.status !== "created") {
          await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
          dashboardState = await refreshDashboardState(dashboard, statePage);
          if (dashboardState === "empty") {
            return {
              ok: false,
              reason: "Report creation blocked by business rules",
            };
          }
        }

        await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
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

      let copyOutcome = await modal.submitCopyModal();
      copyOutcome = await determineRetryAfterDateBlock(
        copyOutcome,
        dashboard,
        async () => {
          await modal.closeModalIfOpen();
          await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
          const reopenedCopyModal = await openDashboardModal(
            () => dashboard.openCopyModal(),
            dashboard
          );

          return reopenedCopyModal ? modal.submitCopyModal() : copyOutcome;
        }
      );

      if (copyOutcome.status !== "copied") {
        await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
        dashboardState = await refreshDashboardState(dashboard, statePage);
        if (dashboardState !== "unsubmitted") {
          const resetSucceeded = await dashboard
            .deleteAllReportsViaDevTools(STATE)
            .catch(() => false);

          if (!resetSucceeded) {
            return {
              ok: false,
              reason: "Report copy blocked by business rules",
            };
          }

          await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
          dashboardState = await refreshDashboardState(dashboard, statePage);

          if (dashboardState === "empty") {
            const openedCreateModal = await openDashboardModal(
              () => dashboard.openCreateModal(),
              dashboard
            );
            if (!openedCreateModal) {
              return { ok: false, reason: "Create report modal unavailable" };
            }

            let createOutcome = await modal.submitCreateModal();
            createOutcome = await determineRetryAfterDateBlock(
              createOutcome,
              dashboard,
              async () => {
                await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
                const reopenedCreateModal = await openDashboardModal(
                  () => dashboard.openCreateModal(),
                  dashboard
                );

                return reopenedCreateModal
                  ? modal.submitCreateModal()
                  : createOutcome;
              }
            );

            if (createOutcome.status !== "created") {
              return {
                ok: false,
                reason: "Report creation blocked by business rules",
              };
            }

            await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
            dashboardState = await refreshDashboardState(dashboard, statePage);
          }

          if (dashboardState !== "unsubmitted") {
            return {
              ok: false,
              reason: "Report copy blocked by business rules",
            };
          }
        }
      }

      await dashboard.navigateToDashboard(REPORT_TYPE, STATE);
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
  } catch (error) {
    if (isEnvironmentInterruptionError(error)) {
      return {
        ok: false,
        reason: "Section open interrupted by local environment restart",
      };
    }

    throw error;
  }
};

export const openReportSectionWithTimeout = async (
  statePage: StatePage,
  targetState: "unsubmitted" | "submitted",
  sectionId: string,
  options: OpenReportSectionOptions = {},
  unsubmittedCandidateIndex = 0
): Promise<OpenReportSectionResult> => {
  const timeoutMs = options.timeoutMs ?? TIMEOUT_OPEN_REPORT_SECTION;
  const timeoutReason =
    options.timeoutReason ?? "Timed out opening report section";

  try {
    return await Promise.race([
      openReportSection(
        statePage,
        targetState,
        sectionId,
        unsubmittedCandidateIndex
      ),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(timeoutReason)), timeoutMs);
      }),
    ]);
  } catch (error) {
    if (isEnvironmentInterruptionError(error)) {
      return {
        ok: false,
        reason: "Section open interrupted by local environment restart",
      };
    }

    const message = error instanceof Error ? error.message : String(error);
    if (message === timeoutReason) {
      return { ok: false, reason: timeoutReason };
    }

    throw error;
  }
};

export const openReportSectionOrSkip = async (
  statePage: StatePage,
  targetState: "unsubmitted" | "submitted",
  sectionId: string,
  skip: SkipHandler,
  unsubmittedCandidateIndex = 0
): Promise<ReportEditorPage | undefined> => {
  const section = await openReportSection(
    statePage,
    targetState,
    sectionId,
    unsubmittedCandidateIndex
  );

  if (!section.ok) {
    skip(section.reason);
    return undefined;
  }

  return section.editor;
};

export const openReportSectionWithTimeoutOrSkip = async (
  statePage: StatePage,
  targetState: "unsubmitted" | "submitted",
  sectionId: string,
  skip: SkipHandler,
  options: OpenReportSectionOptions = {},
  unsubmittedCandidateIndex = 0
): Promise<ReportEditorPage | undefined> => {
  const section = await openReportSectionWithTimeout(
    statePage,
    targetState,
    sectionId,
    options,
    unsubmittedCandidateIndex
  );

  if (!section.ok) {
    skip(section.reason);
    return undefined;
  }

  return section.editor;
};
