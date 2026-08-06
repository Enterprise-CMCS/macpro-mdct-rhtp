import { logger } from "../../libs/debug-lib";
import { handler } from "../../libs/handler-lib";
import { parseReportParameters } from "../../libs/param-lib";
import { badRequest, forbidden, ok } from "../../libs/response-lib";
import { putReport } from "../../storage/reports";
import { isCompleteStatus } from "@rhtp/shared";
import { canPatchSubmittedReport, canWriteState } from "../../utils/authorization";
import { error } from "../../utils/constants";
import { validateReportPayload } from "../../utils/reportValidation";
import {
  updatePrivilegedFieldsOnly,
  updateReportAnswers,
} from "../../utils/reports/updateReport";

export const updateReport = handler(parseReportParameters, async (request) => {
  const { reportType, state, id } = request.parameters;
  const user = request.user;

  if (!canWriteState(user, state)) {
    return forbidden(error.UNAUTHORIZED);
  }

  if (!request?.body) {
    return badRequest("Invalid request");
  }

  let reportRequest;
  try {
    reportRequest = await validateReportPayload(request.body);
  } catch (error) {
    logger.error(error);
    return badRequest("Invalid request");
  }

  if (
    reportType !== reportRequest.type ||
    state !== reportRequest.state ||
    id !== reportRequest.id
  ) {
    return badRequest("Invalid request");
  }

  if (isCompleteStatus(reportRequest.status)) {
    if (!canPatchSubmittedReport(user)) {
      return forbidden(error.UNAUTHORIZED);
    }
    const updatedReport = await updatePrivilegedFieldsOnly(reportRequest, user);
    if (!updatedReport) {
      return badRequest("Invalid request");
    }
    await putReport(updatedReport);
    return ok();
  }

  const updatedReport = await updateReportAnswers(reportRequest, user);
  if (!updatedReport) {
    return badRequest("Invalid request");
  }

  await putReport(updatedReport);

  return ok();
});
