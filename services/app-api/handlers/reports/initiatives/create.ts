import { logger } from "../../../libs/debug-lib";
import { handler } from "../../../libs/handler-lib";
import { parseReportParameters } from "../../../libs/param-lib";
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
import { buildInitiativePages } from "../../../utils/reports/initiatives/initiatives";
import {
  isCreateInitiativeBody,
  validateReportPayload,
} from "../../../utils/reportValidation";

export const createInitiative = handler(
  parseReportParameters,
  async (request) => {
    const { reportType, state, id } = request.parameters;
    const { user, body } = request;

    if (!canWriteInitiatives(user)) {
      return forbidden(error.UNAUTHORIZED);
    }

    if (!body) {
      return badRequest("Invalid request");
    }

    if (!isCreateInitiativeBody(body)) {
      return badRequest("Invalid request");
    }

    let report = await getReport(reportType, state, id);
    if (!report) return notFound();
    if (report.status === ReportStatus.SUBMITTED) {
      return badRequest("Invalid request");
    }

    // handle adding initiative
    const { initiativeName, initiativeNumber } = body;
    const newInitiative = [
      {
        id: crypto.randomUUID(),
        name: initiativeName,
        initiativeNumber,
      },
    ];
    buildInitiativePages(report, newInitiative);

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
