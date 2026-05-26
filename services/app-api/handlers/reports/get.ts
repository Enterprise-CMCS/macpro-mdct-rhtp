import { handler } from "../../libs/handler-lib";
import {
  parseReportParameters,
  parseReportType,
  parseReportTypeAndState,
} from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import {
  getReport as getReportFromDatabase,
  queryReportsByType,
  queryReportsForState,
} from "../../storage/reports";
import { canReadState, canReadType } from "../../utils/authorization";
import { error } from "../../utils/constants";

export const getReport = handler(parseReportParameters, async (request) => {
  const { reportType, state, id } = request.parameters;
  const user = request.user;

  if (!canReadState(user, state)) {
    return forbidden(error.UNAUTHORIZED);
  }

  const report = await getReportFromDatabase(reportType, state, id);

  return ok(report);
});

export const getReportsForState = handler(
  parseReportTypeAndState,
  async (request) => {
    const { reportType, state } = request.parameters;
    const user = request.user;

    if (!canReadState(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const reports = await queryReportsForState(reportType, state);

    return ok(reports);
  }
);

export const getReportsByType = handler(parseReportType, async (request) => {
  const { reportType } = request.parameters;
  const user = request.user;

  if (!canReadType(user)) {
    return forbidden(error.UNAUTHORIZED);
  }

  const reports = await queryReportsByType(reportType);

  return ok(reports);
});
