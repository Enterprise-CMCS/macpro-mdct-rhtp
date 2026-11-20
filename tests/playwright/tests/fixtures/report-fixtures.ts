import { test as base } from "./base";

export { expect } from "./base";

type ReportFixtures = {
  annualReport: { id: string; state: string };
};

export const test = base.extend<ReportFixtures>({
  annualReport: async ({ baseURL }, use, testInfo) => {
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

    const [
      { buildAnnualReport },
      { deleteReport, putReport },
      { stateAbbreviation },
    ] = await Promise.all([
      import("../../../seeds/fixtures/annual-report.js"),
      import("../../../../services/app-api/storage/reports.js"),
      import("../../utils/consts.js"),
    ]);

    const report = await buildAnnualReport(stateAbbreviation);
    if (!report) {
      throw new Error("The A1 builder did not return a report");
    }

    await putReport(report);
    await use({ id: report.id, state: report.state });

    if (testInfo.status === "passed") {
      await deleteReport(report.type, report.state, report.id);
    }
  },
});
