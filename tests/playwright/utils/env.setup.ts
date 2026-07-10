import { test as setup } from "@playwright/test";
import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  adminUser,
  adminPassword,
  stateUser,
  statePassword,
  reportType,
  stateAbbreviation,
  expectedAdminHeading,
  expectedStateUserHeading,
  adminAuthPath,
  stateUserAuthPath,
} from "./consts";
import {
  authenticateWithUI,
  extractAndStoreAuthData,
  extractAndStoreEnvironmentConfig,
} from "./env";

type LiteReport = {
  id: string;
  type: string;
  state: string;
  status: string;
  created?: number;
};

type FullReport = LiteReport & Record<string, unknown>;

const STATUS_SUBMITTED = "Submitted";
const STATUS_ACCEPTED = "Accepted";
const REPORTS_API_READY_RETRIES = 12;
const REPORTS_API_READY_DELAY_MS = 5000;

const normalizeApiBase = (apiUrl: string): string => apiUrl.replace(/\/$/, "");

const parseJsonBody = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

const delay = async (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const getLocalstackApiUrl = async (): Promise<string | undefined> => {
  const project = process.env.PROJECT || "rhtp";
  const stackName = `${project}-localstack`;

  const client = new CloudFormationClient({
    region: "us-east-1",
    endpoint: "http://localhost.localstack.cloud:4566",
    credentials: {
      accessKeyId: "localstack",
      secretAccessKey: "localstack", // pragma: allowlist secret
    },
  });

  const response = await client.send(
    new DescribeStacksCommand({ StackName: stackName })
  );
  const outputs = response.Stacks?.[0]?.Outputs ?? [];
  const apiUrl = outputs.find((o) => o.OutputKey === "ApiUrl")?.OutputValue;

  return apiUrl ? apiUrl.replace("https://", "http://") : undefined;
};

const syncUiEnvApiUrlFromStack = async (): Promise<void> => {
  const envConfigPath = resolve(
    process.cwd(),
    "../services/ui-src/public/env-config.js"
  );
  let desiredApiUrl: string | undefined;

  try {
    desiredApiUrl = await getLocalstackApiUrl();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `Env sync skipped: unable to read CloudFormation outputs (${message})`
    );
    return;
  }

  if (!desiredApiUrl) {
    console.warn(
      "Env sync skipped: ApiUrl output missing from localstack stack"
    );
    return;
  }

  try {
    const currentText = readFileSync(envConfigPath, "utf8");
    const nextText = currentText.replace(
      /API_URL:\s*"[^"]+"/,
      `API_URL: "${desiredApiUrl}"`
    );

    if (nextText !== currentText) {
      writeFileSync(envConfigPath, nextText, "utf8");
      console.log(`Env sync: updated UI API_URL to ${desiredApiUrl}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `Env sync skipped: unable to update env-config.js (${message})`
    );
  }
};

const apiGet = async <T>(url: string, idToken: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-key": idToken,
    },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed (${response.status})`);
  }

  return (await response.json()) as T;
};

const apiPost = async (
  url: string,
  idToken: string,
  body: Record<string, unknown>
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": idToken,
    },
    body: JSON.stringify(body),
  });

  return {
    ok: response.ok,
    status: response.status,
    body: await parseJsonBody(response),
  };
};

const apiPut = async (
  url: string,
  idToken: string,
  body?: Record<string, unknown>
) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      "x-api-key": idToken,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  return {
    ok: response.ok,
    status: response.status,
    body: await parseJsonBody(response),
  };
};

const sortNewestFirst = (reports: LiteReport[]): LiteReport[] =>
  reports.toSorted((a, b) => (b.created ?? 0) - (a.created ?? 0));

const isSubmittedLike = (report: LiteReport) =>
  report.status === STATUS_SUBMITTED || report.status === STATUS_ACCEPTED;

const isEditable = (report: LiteReport) => !isSubmittedLike(report);

const getReportsForConfiguredState = async (
  apiBase: string,
  stateToken: string
): Promise<LiteReport[]> => {
  const url = `${apiBase}/reports/${reportType}/${stateAbbreviation}`;
  const reports = await apiGet<LiteReport[]>(url, stateToken);
  return sortNewestFirst(Array.isArray(reports) ? reports : []);
};

const waitForReportsApiReady = async (
  apiBase: string,
  stateToken: string
): Promise<boolean> => {
  for (let attempt = 1; attempt <= REPORTS_API_READY_RETRIES; attempt++) {
    try {
      await getReportsForConfiguredState(apiBase, stateToken);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `Report bootstrap: reports API not ready (attempt ${attempt}/${REPORTS_API_READY_RETRIES}) - ${message}`
      );

      if (attempt < REPORTS_API_READY_RETRIES) {
        await delay(REPORTS_API_READY_DELAY_MS);
      }
    }
  }

  return false;
};

const tryCreateEditableReport = async (
  apiBase: string,
  stateToken: string
): Promise<boolean> => {
  const createUrl = `${apiBase}/reports/${reportType}/${stateAbbreviation}`;
  const farFutureIsoDate = new Date("2099-12-31T00:00:00.000Z").toISOString();
  const result = await apiPost(createUrl, stateToken, {
    mockDate: farFutureIsoDate,
  });

  if (!result.ok) {
    const message =
      typeof result.body === "string"
        ? result.body
        : JSON.stringify(result.body ?? "unknown error");
    console.warn(
      `Report bootstrap: create failed (${result.status}) ${message}`
    );
    return false;
  }

  return true;
};

const tryReleaseSubmittedReport = async (
  apiBase: string,
  adminToken: string,
  report: LiteReport
): Promise<boolean> => {
  const releaseUrl = `${apiBase}/reports/release/${report.type}/${report.state}/${report.id}`;
  const result = await apiPut(releaseUrl, adminToken);

  if (!result.ok) {
    const message =
      typeof result.body === "string"
        ? result.body
        : JSON.stringify(result.body ?? "unknown error");
    console.warn(
      `Report bootstrap: release failed for ${report.id} (${result.status}) ${message}`
    );
    return false;
  }

  return true;
};

const trySubmitEditableReport = async (
  apiBase: string,
  stateToken: string,
  report: LiteReport
): Promise<boolean> => {
  const reportUrl = `${apiBase}/reports/${report.type}/${report.state}/${report.id}`;
  const submitUrl = `${apiBase}/reports/submit/${report.type}/${report.state}/${report.id}`;

  let fullReport: FullReport;
  try {
    fullReport = await apiGet<FullReport>(reportUrl, stateToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `Report bootstrap: failed loading report ${report.id} (${message})`
    );
    return false;
  }

  const result = await apiPut(submitUrl, stateToken, fullReport);
  if (!result.ok) {
    const message =
      typeof result.body === "string"
        ? result.body
        : JSON.stringify(result.body ?? "unknown error");
    console.warn(
      `Report bootstrap: submit failed for ${report.id} (${result.status}) ${message}`
    );
    return false;
  }

  return true;
};

const ensureSubmittedReportExists = async (
  apiBase: string,
  stateToken: string,
  reports: LiteReport[]
): Promise<LiteReport[]> => {
  if (reports.some((r) => r.status === STATUS_SUBMITTED)) {
    return reports;
  }

  const editableCandidates = reports.filter(isEditable);
  for (const candidate of editableCandidates) {
    const submitted = await trySubmitEditableReport(
      apiBase,
      stateToken,
      candidate
    );
    if (!submitted) {
      continue;
    }

    const refreshed = await getReportsForConfiguredState(apiBase, stateToken);
    if (refreshed.some((r) => r.status === STATUS_SUBMITTED)) {
      return refreshed;
    }
  }

  return reports;
};

const bootstrapReportStates = async () => {
  const apiUrl = process.env.API_URL;
  const stateToken = process.env.STATE_ID_TOKEN;
  const adminToken = process.env.ADMIN_ID_TOKEN;

  if (!apiUrl || !stateToken || !adminToken) {
    console.warn("Report bootstrap skipped: missing API URL or auth tokens");
    return;
  }

  const apiBase = normalizeApiBase(apiUrl);
  const ready = await waitForReportsApiReady(apiBase, stateToken);
  if (!ready) {
    console.warn("Report bootstrap skipped: reports API never became ready");
    return;
  }

  let reports = await getReportsForConfiguredState(apiBase, stateToken);

  // Step 1: Ensure at least one submitted report exists.
  reports = await ensureSubmittedReportExists(apiBase, stateToken, reports);

  // Step 2: Ensure at least one editable report exists.
  if (!reports.some(isEditable)) {
    let created = await tryCreateEditableReport(apiBase, stateToken);

    if (!created) {
      const releasableSubmittedReport = reports.find(
        (r) => r.status === STATUS_SUBMITTED
      );
      if (releasableSubmittedReport) {
        created = await tryReleaseSubmittedReport(
          apiBase,
          adminToken,
          releasableSubmittedReport
        );
      }
    }

    if (created) {
      reports = await getReportsForConfiguredState(apiBase, stateToken);
    }
  }

  // Step 3: If releasing consumed our only submitted report, try to restore one.
  if (!reports.some((r) => r.status === STATUS_SUBMITTED)) {
    reports = await ensureSubmittedReportExists(apiBase, stateToken, reports);

    // Keep one editable report available for edit tests when possible.
    if (!reports.some(isEditable)) {
      const created = await tryCreateEditableReport(apiBase, stateToken);
      if (created) {
        reports = await getReportsForConfiguredState(apiBase, stateToken);
      }
    }
  }

  const finalEditable = reports.some(isEditable);
  const finalSubmitted = reports.some((r) => r.status === STATUS_SUBMITTED);

  if (!finalEditable) {
    console.warn("Report bootstrap: no editable report available after setup");
  }

  if (!finalSubmitted) {
    console.warn("Report bootstrap: no submitted report available after setup");
  }
};

setup("setup environment", async ({ page }) => {
  await syncUiEnvApiUrlFromStack();
  await extractAndStoreEnvironmentConfig(page);
});

setup("authenticate as admin user", async ({ page }) => {
  await authenticateWithUI(
    page,
    adminUser,
    adminPassword,
    expectedAdminHeading,
    "ADMIN"
  );
  await page.context().storageState({ path: adminAuthPath });
  await extractAndStoreAuthData(page, "ADMIN");
});

setup("authenticate as state user", async ({ page }) => {
  await authenticateWithUI(
    page,
    stateUser,
    statePassword,
    expectedStateUserHeading,
    "STATE"
  );
  await page.context().storageState({ path: stateUserAuthPath });
  await extractAndStoreAuthData(page, "STATE");
});

setup("bootstrap report states", async () => {
  try {
    await bootstrapReportStates();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Never fail setup because bootstrap is a best-effort reliability enhancer.
    console.warn(`Report bootstrap failed: ${message}`);
  }
});
