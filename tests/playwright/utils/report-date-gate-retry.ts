import { DashboardPage } from "../tests/pageObjects/dashboard.page";
import type { Route } from "@playwright/test";

export type DateBlockedOutcome = {
  status: string;
  errorText?: string;
};

const getBlockedUntilTimestamp = (message?: string): string | undefined => {
  const blockedDate = message?.match(/until\s+(\d{1,2}\/\d{1,2}\/\d{4})/i)?.[1];
  if (!blockedDate) {
    return undefined;
  }

  const timestamp = new Date(blockedDate).getTime();
  if (!Number.isFinite(timestamp)) {
    return undefined;
  }

  return String(timestamp);
};

export const isNextReportDateBlockedError = (message?: string): boolean =>
  /The next report cannot be created until/i.test(message ?? "");

export const determineRetryAfterDateBlock = async <
  T extends DateBlockedOutcome,
>(
  outcome: T,
  dashboard: DashboardPage,
  retry: () => Promise<T>
): Promise<T> => {
  if (outcome.status !== "blocked") {
    return outcome;
  }

  if (!isNextReportDateBlockedError(outcome.errorText)) {
    return outcome;
  }

  // Try the UI path first; we'll still enforce mockDate on the retry to make
  // recovery deterministic when the UI toggle is visible but state propagation lags.
  await dashboard.setDevToolsDateToLatestOpenDate();

  const fallbackMockDate = getBlockedUntilTimestamp(outcome.errorText);
  if (!fallbackMockDate) {
    return retry();
  }

  const createReportRoute = "**/reports/*/*";
  const routeHandler = async (route: Route) => {
    const url = route.request().url();
    const isCreateOrCopyReportRequest =
      route.request().method() === "POST" &&
      /\/reports\/[^/]+\/[^/]+/i.test(url);

    if (!isCreateOrCopyReportRequest) {
      await route.continue();
      return;
    }

    let body: Record<string, unknown> = {};
    try {
      body = route.request().postDataJSON?.() ?? {};
    } catch {
      body = {};
    }

    await route.continue({
      postData: JSON.stringify({
        ...body,
        mockDate:
          typeof body.mockDate === "string" && body.mockDate.length > 0
            ? body.mockDate
            : fallbackMockDate,
      }),
    });
  };

  await dashboard.page.route(createReportRoute, routeHandler);
  try {
    return retry();
  } finally {
    await dashboard.page.unroute(createReportRoute, routeHandler);
  }
};
