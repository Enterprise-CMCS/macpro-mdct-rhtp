import { handler } from "../../libs/handler-lib";
import { parseReportTypeAndState } from "../../libs/param-lib";
import { badRequest, forbidden, ok } from "../../libs/response-lib";
import { canWriteState } from "../../utils/authorization";
import { error, RhtpSubTypeTemplateMap } from "../../utils/constants";
import { buildReport } from "../../utils/reports/buildReport";
import { putReport, queryReportsForState } from "../../storage/reports";
import { RhtpSubType, ReportStatus, ReportOptions } from "@rhtp/shared";
import { isCreateReportOptions } from "../../utils/reportValidation";
import { isFeatureFlagEnabled } from "../../utils/featureFlags";

export const createReport = handler(
  parseReportTypeAndState,
  async (request) => {
    const { reportType, state } = request.parameters;
    const { user, body } = request;
    const { mockDate } = body as any;

    if (!canWriteState(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    if (!isCreateReportOptions(body)) {
      return badRequest("Invalid request");
    }

    let nextReportKey = "A1"; // default first report key
    const reports = await queryReportsForState(reportType, state);
    let latestReportId;

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

      latestReportId = latestReport.id;
      nextReportKey =
        RhtpSubTypeTemplateMap[latestReport.subTypeKey].nextReportSubType;
    }

    const {
      name,
      dateRangeString,
      type,
      budgetPeriod,
      openDate,
      reportTemplateBuilder,
    } = RhtpSubTypeTemplateMap[nextReportKey];

    //using launchdarkly to control how we want to generate reports
    const useDevTools = await isFeatureFlagEnabled("devTools");
    const userDate = useDevTools && mockDate ? mockDate : Date.now();

    if (userDate < openDate) {
      return badRequest(
        `The next report cannot be created until ${new Date(
          openDate
        ).toLocaleDateString()}.`
      );
    }

    const reportOptions: ReportOptions = {
      subType: type,
      subTypeKey: nextReportKey,
      name: `${state} - ${name} - ${dateRangeString}`,
      budgetPeriod,
      pages: reportTemplateBuilder!(state),
      copyFromReportId: latestReportId,
    };

    const report = await buildReport(reportType, state, reportOptions, user);

    await putReport(report);
    return ok(report);
  }
);
