import { handler } from "../../libs/handler-lib";
import { parseFileUploadDownloadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { getReport } from "../../storage/reports";
import { ReportType, StateAbbr } from "@rhtp/shared";
import { LambdaClient } from "@aws-sdk/client-lambda";
import JSZip from "jszip";
import {
  addReportFilesToZip,
  formatS3ReportZipKey,
} from "../../utils/zips/buildZip";
import { getPSURL, zipBuffer, startZipWorker } from "../../utils/zips/polling";

const lambdaClient = new LambdaClient({ region: "us-east-1" });

interface ZipWorkerEvent {
  reportType: ReportType;
  state: StateAbbr;
  id: string;
}

export const triggerZipGeneration = handler(
  parseFileUploadDownloadParameters,
  async (request) => {
    const { state, reportType, id } = request.parameters;
    await startZipWorker(lambdaClient, reportType, state, id);
    return ok({ status: "pending" });
  }
);

export const getZipStatus = handler(
  parseFileUploadDownloadParameters,
  async (request) => {
    const { state, reportType, id } = request.parameters;
    return await getPSURL(reportType, state, id);
  }
);

export const zipWorker = async (event: ZipWorkerEvent) => {
  const { reportType, state, id } = event;
  const report = await getReport(reportType, state, id);
  if (!report) return;

  const zip = new JSZip();
  await addReportFilesToZip(report, zip);
  await zipBuffer(formatS3ReportZipKey(reportType, state, id), zip);
};
