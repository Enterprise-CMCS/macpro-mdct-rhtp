import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import { parseReportType } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { ReportType } from "@rhtp/shared";
import JSZip from "jszip";
import { getPSURL, zipBuffer, runZipWorker } from "../../utils/zips/polling";
import { LambdaClient } from "@aws-sdk/client-lambda";

const lambdaClient = new LambdaClient({ region: "us-east-1" });

const S3ZipKey = (reportType: string) => `zips/${reportType}.zip`;

interface ZipWorkerEvent {
  reportType: ReportType;
  files: { state: string; reportId: string; fileId: string; name: string }[];
}

export const triggerZipByFilesGeneration = handler(
  parseReportType,
  async (request) => {
    const { reportType } = request.parameters;
    const { files } = request.body as any;

    await runZipWorker(lambdaClient, S3ZipKey(reportType), {
      reportType,
      files,
    });
    return ok({ status: "pending" });
  }
);

export const getZipByFilesStatus = handler(parseReportType, async (request) => {
  const { reportType } = request.parameters;
  const key = S3ZipKey(reportType);

  return await getPSURL(key, `attachment; filename=${reportType}.zip`);
});

export const zipByFilesWorker = async (event: ZipWorkerEvent) => {
  const { reportType, files } = event;

  const zip = new JSZip();
  for (const file of files) {
    const item = await s3.getObject({
      Bucket: process.env.attachmentsBucketName,
      Key: `${reportType}/${file.state}/${file.reportId}/${file.fileId}`,
    });
    const bytes = await item.Body?.transformToByteArray();
    if (bytes) {
      zip.file(`${file.state}/${file.name}`, bytes);
    }
  }

  await zipBuffer(S3ZipKey(reportType), zip);
};
