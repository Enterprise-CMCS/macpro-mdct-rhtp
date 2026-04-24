import { handler } from "../../libs/handler-lib";
import { parseReportTypeAndState } from "../../libs/param-lib";
import { badRequest, forbidden, ok } from "../../libs/response-lib";
import { canWriteState } from "../../utils/authorization";
import { error, RhtpSubTypeMap } from "../../utils/constants";
import { buildReport } from "../../utils/reports/buildReport";
import { putReport, queryReportsForState } from "../../storage/reports";
import { RhtpSubType, ReportStatus, ReportOptions } from "@rhtp/shared";
import { isCreateReportOptions } from "../../utils/reportValidation";

export const createReport = handler(
  parseReportTypeAndState,
  async (request) => {
    const { reportType, state } = request.parameters;
    const { user, body } = request;

    if (!canWriteState(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    if (!isCreateReportOptions(body)) {
      return badRequest("Invalid request");
    }

    const reports = await queryReportsForState(reportType, state);

    // Report options for very first report
    const { name, dateRangeString, type, budgetPeriod } = RhtpSubTypeMap.A1;
    let reportOptions: ReportOptions = {
      year: 2026,
      subType: type,
      subTypeKey: "A1",
      name: `${state} - ${name} - ${dateRangeString}`,
      budgetPeriod,
    };
    if (reports.length > 0) {
      const latestReport = reports.reduce((latest, current) => {
        if (latest.created > current.created) {
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

      if (latestReport.subType === RhtpSubType.FINAL) {
        return badRequest(
          "End of reporting cycle. Cannot create more reports."
        );
      }

      const nextReportKey =
        RhtpSubTypeMap[latestReport.subTypeKey].nextReportSubType;
      const { name, dateRangeString, type, startDate, budgetPeriod } =
        RhtpSubTypeMap[nextReportKey];

      if (Date.now() < startDate) {
        return badRequest(
          `The next report cannot be created until ${new Date(
            startDate
          ).toLocaleDateString()}.`
        );
      }

      reportOptions = {
        year: 2026, // TODO: figure out year assignment and filtering for reports that span years
        subType: type,
        subTypeKey: nextReportKey,
        name: `${state} - ${name} - ${dateRangeString}`,
        budgetPeriod,
        copyFromReportId: body?.copyFromReportId,
      };
    }

    const report = await buildReport(reportType, state, reportOptions, user);

    await putReport(report);
    return ok(report);
  }
);
