import { logger } from "../../../libs/debug-lib";
import { handler } from "../../../libs/handler-lib";
import { parseInitiativeUpdateParameters } from "../../../libs/param-lib";
import {
  badRequest,
  forbidden,
  notFound,
  ok,
} from "../../../libs/response-lib";
import { getReport, putReport } from "../../../storage/reports";
import { ReportStatus } from "../../../types/reports";
import { canWriteInitiatives } from "../../../utils/authorization";
import { error } from "../../../utils/constants";
import { updateInitiativeStatus } from "../../../utils/reports/initiatives/initiatives";
import {
  isUpdateInitiativeBody,
  validateReportPayload,
} from "../../../utils/reportValidation";

export const updateInitiative = handler(
  parseInitiativeUpdateParameters,
  async (request) => {
    const { reportType, state, id, initiativeId } = request.parameters;
    const { user, body } = request;

    if (!canWriteInitiatives(user)) {
      return forbidden(error.UNAUTHORIZED);
    }

    if (!body) {
      return badRequest("Invalid request");
    }

    if (!isUpdateInitiativeBody(body)) {
      return badRequest("Invalid request");
    }

    let report = await getReport(reportType, state, id);
    if (!report) return notFound();
    if (report.status === ReportStatus.SUBMITTED) {
      return badRequest("Invalid request");
    }

    // handle updating initiative
    updateInitiativeStatus(report, body, initiativeId);

    // validate new report
    try {
      report = await validateReportPayload(report);
    } catch (error) {
      logger.error(error);
      return badRequest("Invalid request");
    }

    report.status = ReportStatus.IN_PROGRESS;
    report.lastEdited = Date.now();
    report.lastEditedBy = user.fullName;

    await putReport(report);

    return ok();
  }
);
