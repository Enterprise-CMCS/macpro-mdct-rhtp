import { handler } from "../../libs/handler-lib";
import { parseReportParameters } from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import { canReleaseReport } from "../../utils/authorization";
import { error } from "../../utils/constants";
import { getReport, putReport } from "../../storage/reports";
import { ReportStatus } from "@rhtp/shared";
import { sendEmail } from "../../utils/notifications/email";
import { logger } from "../../libs/debug-lib";

export const releaseReport = handler(parseReportParameters, async (request) => {
  const { reportType, state, id } = request.parameters;
  const user = request.user;

  if (!canReleaseReport(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  const report = await getReport(reportType, state, id);

  // Can only unlock from submitted status
  if (report?.status !== ReportStatus.SUBMITTED) {
    return ok(report);
  }

  report.status = ReportStatus.IN_PROGRESS;
  report.submitted = undefined;
  report.submittedBy = undefined;
  report.submittedByEmail = undefined;

  // save the report that's being submitted (with the new information on top of it)
  await putReport(report);

  try {
    await sendEmail(report, user);
  } catch (error) {
    // log and allow call to succeed even if email fails
    logger.error(error);
  }

  return ok();
});
