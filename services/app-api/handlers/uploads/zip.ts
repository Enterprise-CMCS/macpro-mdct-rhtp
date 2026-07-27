import { handler } from "../../libs/handler-lib";
import { emptyParser, parseZipIdParameters } from "../../libs/param-lib";
import { badRequest, ok } from "../../libs/response-lib";
import { getReport } from "../../storage/reports";
import { ReportType, StateAbbr, ZipRequestTypes } from "@rhtp/shared";
import JSZip from "jszip";
import {
  addReportFilesToZip,
  addObligatedAndSpentFundsFilesToZip,
} from "../../utils/zips/buildZip";
import { getPSURL, zipBuffer, startZipWorker } from "../../utils/zips/polling";
import { isZipRequestBody } from "../../utils/reportValidation";

export interface ZipReportWorkerEvent {
  type: ZipRequestTypes.REPORT;
  zipId: string;
  reportType: ReportType;
  state: StateAbbr;
  id: string;
}

export interface ZipObligatedAndSpentFundsWorkerEvent {
  type: ZipRequestTypes.OBLIGATED_AND_SPENT_FUNDS;
  zipId: string;
  state?: StateAbbr;
  reportSubTypeKeys: string[];
}

export const triggerZipGeneration = handler(emptyParser, async (request) => {
  const { body } = request;
  if (!isZipRequestBody(body)) {
    return badRequest("Invalid request");
  }
  const zipId = await startZipWorker(body);
  return ok({ status: "pending", zipId });
});

export const getZipStatus = handler(parseZipIdParameters, async (request) => {
  const { id } = request.parameters;
  return await getPSURL(id);
});

export const zipWorker = async (
  event: ZipReportWorkerEvent | ZipObligatedAndSpentFundsWorkerEvent
) => {
  const zip = new JSZip();
  const { type, zipId } = event;
  let tags = `type=${type}`;
  if (type === ZipRequestTypes.REPORT) {
    const { reportType, state, id } = event;
    const report = await getReport(reportType, state, id);
    if (!report) return;

    await addReportFilesToZip(report, zip);
    tags = `${tags}&reportType=${reportType}&state=${state}&id=${id}&subTypeKeys=${report.subTypeKey}`;
  } else if (type === ZipRequestTypes.OBLIGATED_AND_SPENT_FUNDS) {
    const { reportSubTypeKeys, state } = event;
    await addObligatedAndSpentFundsFilesToZip(reportSubTypeKeys, zip, state);
    tags = `${tags}&subTypeKeys=${reportSubTypeKeys.join("-")}${state ? `&state=${state}` : ""}`;
  } else {
    return badRequest(`Unidentified type. Cannot proceed. Event: ${event}`);
  }
  await zipBuffer(zipId, tags, zip);
};
