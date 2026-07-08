import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import { parseFileUploadDownloadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { getReport } from "../../storage/reports";
import { ReportType, StateAbbr } from "@rhtp/shared";
import { LambdaClient } from "@aws-sdk/client-lambda";
import JSZip from "jszip";
import {
  sortElementsForZip,
  getInitativeFiles,
  getAccordionFiles,
  getSustainabilityAndHighlightFiles,
} from "../../utils/zips/buildZip";

import { getPSURL, zipBuffer, runZipWorker } from "../../utils/zips/polling";

const lambdaClient = new LambdaClient({ region: "us-east-1" });

const S3ZipKey = (reportType: string, state: string, id: string) =>
  `zips/${reportType}/${state}/${id}.zip`;

interface ZipWorkerEvent {
  reportType: ReportType;
  state: StateAbbr;
  id: string;
}

export const triggerZipGeneration = handler(
  parseFileUploadDownloadParameters,
  async (request) => {
    const { state, reportType, id } = request.parameters;

    await runZipWorker(lambdaClient, S3ZipKey(reportType, state, id), {
      reportType,
      state,
      id,
    });

    return ok({ status: "pending" });
  }
);

export const getZipStatus = handler(
  parseFileUploadDownloadParameters,
  async (request) => {
    const { state, reportType, id } = request.parameters;
    const key = S3ZipKey(reportType, state, id);

    const report = await getReport(reportType, state, id);
    return await getPSURL(
      key,
      `attachment; filename=RHTP_${state}_${report?.subTypeKey}.zip`
    );
  }
);

export const zipWorker = async (event: ZipWorkerEvent) => {
  const { reportType, state, id } = event;

  const report = await getReport(reportType, state, id);

  if (!report) return;

  const sortedElements = sortElementsForZip(report);
  const zipFolders = [
    {
      name: "Initiatives",
      files: getInitativeFiles(sortedElements?.initiative),
    },
    {
      name: "State Policy Commitments",
      files: getAccordionFiles(sortedElements?.accordions ?? []),
    },
    {
      name: "Sustainability and Highlights",
      files: getSustainabilityAndHighlightFiles(sortedElements?.area ?? []),
    },
  ];

  const zip = new JSZip();
  for (const folder of zipFolders) {
    for (const file of folder.files) {
      const item = await s3.getObject({
        Bucket: process.env.attachmentsBucketName,
        Key: `${reportType}/${state}/${id}/${file?.fileId}`,
      });
      const bytes = await item.Body?.transformToByteArray();
      if (bytes && file?.name) {
        zip.file(
          `${state}/${report?.subType.toLowerCase()}/${folder.name}/${file.name}`,
          bytes
        );
      }
    }
  }

  await zipBuffer(S3ZipKey(reportType, state, id), zip);
};
