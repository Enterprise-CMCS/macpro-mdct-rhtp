import { test as base } from "./base";

export { expect } from "./base";

type ReportFixtures = {
  annualReport: { id: string; state: string };
};

export const test = base.extend<ReportFixtures>({
  annualReport: async ({ baseURL }, use) => {
    if (
      process.env.E2E_SEED_TARGET !== "localstack" ||
      baseURL !== "http://localhost:3000"
    ) {
      throw new Error(
        "annualReport requires E2E_SEED_TARGET=localstack and http://localhost:3000"
      );
    }
    process.env.AWS_ENDPOINT_URL = "http://localhost.localstack.cloud:4566";
    process.env.AWS_ACCESS_KEY_ID = "localstack";
    process.env.AWS_SECRET_ACCESS_KEY = "localstack"; // pragma: allowlist secret
    process.env.ReportsTable = "localstack-reports";
    process.env.attachmentsBucketName =
      "uploads-localstack-attachments-000000000000";

    const { buildAnnualReport } =
      await import("../../../seeds/fixtures/annual-report");
    const { putReport } =
      await import("../../../../services/app-api/storage/reports.js");
    const report = await buildAnnualReport();
    if (!report) {
      throw new Error("The A1 builder did not return a report");
    }

    await putReport(report);
    await use({ id: report.id, state: report.state });
  },
});
