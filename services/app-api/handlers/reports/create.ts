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

    let nextReportKey = "A1"; // default first report key
    const reports = await queryReportsForState(reportType, state);

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

      nextReportKey = RhtpSubTypeMap[latestReport.subTypeKey].nextReportSubType;
    }

    const {
      name,
      dateRangeString,
      type,
      startDate,
      budgetPeriod,
      reportTemplateBuilder,
    } = RhtpSubTypeMap[nextReportKey];

    if (Date.now() < startDate) {
      return badRequest(
        `The next report cannot be created until ${new Date(
          startDate
        ).toLocaleDateString()}.`
      );
    }

    const reportOptions: ReportOptions = {
      subType: type,
      subTypeKey: nextReportKey,
      name: `${state} - ${name} - ${dateRangeString}`,
      budgetPeriod,
      copyFromReportId: body?.copyFromReportId,
      pages: reportTemplateBuilder(state),
    };

    const report = await buildReport(reportType, state, reportOptions, user);

    await putReport(report);
    return ok(report);
  }
);
