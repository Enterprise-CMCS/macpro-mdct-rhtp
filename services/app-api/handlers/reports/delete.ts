import { handler } from "../../libs/handler-lib";
import {
  parseReportParameters,
  parseReportTypeAndState,
} from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import {
  deleteReport as deleteReportFromDatabase,
  queryReportsForState,
} from "../../storage/reports";
import { isFeatureFlagEnabled } from "../../utils/featureFlags";

//should not be callable if dev tool is not enabled
export const deleteReport = handler(parseReportParameters, async (request) => {
  const { reportType, state, id } = request.parameters;

  const useDevTools = await isFeatureFlagEnabled("devTools");
  if (useDevTools) {
    await deleteReportFromDatabase(reportType, state, id);
  }
  return ok();
});

export const deleteReportsForState = handler(
  parseReportTypeAndState,
  async (request) => {
    const { reportType, state } = request.parameters;

    const useDevTools = await isFeatureFlagEnabled("devTools");
    if (useDevTools) {
      const reports = await queryReportsForState(reportType, state);
      for (var i = 0; i < reports.length; i++) {
        await deleteReportFromDatabase(reportType, state, reports[i].id);
      }
    }

    return ok();
  }
);
