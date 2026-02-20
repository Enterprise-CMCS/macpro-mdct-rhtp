import { handler } from "../../libs/handler-lib";
import { parseReportTypeAndState } from "../../libs/param-lib";
import { badRequest, forbidden, ok } from "../../libs/response-lib";
import { canWriteState } from "../../utils/authorization";
import { error } from "../../utils/constants";
import { buildReport } from "../../utils/reports/buildReport";
import { putReport, queryReportsForState } from "../../storage/reports";
import { ReportSubType, ReportStatus } from "../../types/reports";
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
        subType: ReportSubType.Annual,
        name: `${state} - Annual Report - 2026`,
      };
      const report = await buildReport(reportType, state, reportOptions, user);
      await putReport(report);
      return ok(report);
    }

    const latestReport = reports.reduce((latest, current) => {
      return current.created && current.created > (latest.created ?? 0)
        ? current
        : latest;
    }, reports[0]);

    if (latestReport.status !== ReportStatus.SUBMITTED) {
      return badRequest(
        "A new report cannot be created until the previous report is submitted."
      );
    }

    const reportOptions = getNextReportOptions(latestReport);

    // if (!isReportOptions(body)) {
    //   return badRequest("Invalid request");
    // }

    const report = await buildReport(reportType, state, reportOptions, user);
    await putReport(report);
    return ok(report);
  }
);
