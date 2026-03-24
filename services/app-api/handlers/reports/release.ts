import { handler } from "../../libs/handler-lib";
import { parseReportParameters } from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import { canReleaseReport } from "../../utils/authorization";
import { error } from "../../utils/constants";
import { getReport, putReport } from "../../storage/reports";
import { ReportStatus } from "../../types/reports";

export const releaseReport = handler(parseReportParameters, async (request) => {
  const { reportType, state, id } = request.parameters;
  const user = request.user;

  if (!canReleaseReport(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  const report = await getReport(reportType, state, id);

  // Report is not locked.
  if (report?.status !== ReportStatus.SUBMITTED) {
    return ok(report);
  }

  report.status = ReportStatus.IN_PROGRESS;
  report.submitted = undefined;
  report.submittedBy = undefined;
  report.submittedByEmail = undefined;

  // save the report that's being submitted (with the new information on top of it)
  await putReport(report);

  return ok();
});
