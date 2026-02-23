import { handler } from "../../libs/handler-lib";
import { parseReportTypeAndState } from "../../libs/param-lib";
import { badRequest, forbidden, ok } from "../../libs/response-lib";
import { canWriteState } from "../../utils/authorization";
import { error, reportStartDates } from "../../utils/constants";
import { buildReport } from "../../utils/reports/buildReport";
import { putReport, queryReportsForState } from "../../storage/reports";
import { RhtpSubType, ReportStatus } from "../../types/reports";
import { getNextReportOptions } from "../../utils/reports/reportOptions";

export const createReport = handler(
  parseReportTypeAndState,
  async (request) => {
    const { reportType, state } = request.parameters;
    const { user } = request;

    if (!canWriteState(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const reports = await queryReportsForState(reportType, state);

    if (reports.length < 1) {
      // Report options for very first report
      const reportOptions = {
        year: 2026,
        subType: RhtpSubType.ANNUAL,
        name: `${state} - Annual Report - 2026`,
      };
      const report = await buildReport(reportType, state, reportOptions, user);
      await putReport(report);
      return ok(report);
    }

    const latestReport = reports.reduce((latest, current) => {
      if (latest.year > current.year) {
        return latest;
      } else if (
        latest.year === current.year &&
        latest.subType! > current.subType!
      ) {
        return latest;
      } else {
        return current;
      }
    }, reports[0]);

    if (latestReport.status !== ReportStatus.SUBMITTED) {
      return badRequest(
        "A new report cannot be created until the previous report is submitted."
      );
    }

    const nextReportOptions = getNextReportOptions(latestReport);

    const report = await buildReport(
      reportType,
      state,
      nextReportOptions,
      user
    );

    const reportStartDate = reportStartDates[report.subType!](report.year);

    if (Date.now() < reportStartDate) {
      return badRequest(
        `The next report cannot be created until ${new Date(
          reportStartDate
        ).toLocaleDateString()}.`
      );
    }

    await putReport(report);
    return ok(report);
  }
);
