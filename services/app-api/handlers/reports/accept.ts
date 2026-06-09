import { handler } from "../../libs/handler-lib";
import { parseReportParameters } from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import { canReleaseReport } from "../../utils/authorization";
import { error } from "../../utils/constants";
import { getReport, putReport } from "../../storage/reports";
import { ReportStatus } from "@rhtp/shared";
import { sendEmail } from "../../utils/notifications/email";
import { logger } from "../../libs/debug-lib";

export const acceptReport = handler(parseReportParameters, async (request) => {
  const { reportType, state, id } = request.parameters;
  const user = request.user;

  // release and accept use the same roles
  if (!canReleaseReport(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  const report = await getReport(reportType, state, id);

  // Can only accept from submitted status
  if (report?.status !== ReportStatus.SUBMITTED) {
    return ok(report);
  }

  report.status = ReportStatus.ACCEPTED;

  // save the report that's being submitted (with the new information on top of it)
  await putReport(report);

  try {
    await sendEmail(report);
  } catch (error) {
    // log and allow call to succeed even if email fails
    logger.error(error);
  }

  return ok();
});
