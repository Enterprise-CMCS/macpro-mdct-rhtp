import s3 from "../../libs/s3-lib";
import { ok } from "../../libs/response-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import JSZip from "jszip";
import { Readable } from "node:stream";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { ReportType, StateAbbr } from "@rhtp/shared";
import { getReport } from "../../storage/reports";
import { formatS3ReportZipKey } from "./buildZip";

export const getPSURL = async (
  reportType: ReportType,
  state: StateAbbr,
  id: string
) => {
  const key = formatS3ReportZipKey(reportType, state, id);
  const exists = await s3
    .headObject({ Bucket: process.env.attachmentsBucketName, Key: key })
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    return ok({ status: "pending" });
  }

  const report = await getReport(reportType, state, id);
  let psurl = await s3.getSignedDownloadUrl({
    Bucket: process.env.attachmentsBucketName,
    Key: key,
    ResponseContentDisposition: `attachment; filename=RHTP_${state}_${report?.subTypeKey}.zip`,
  });
  psurl = fixLocalstackUrl(psurl);

  return ok({ status: "ready", psurl });
};

export const zipBuffer = async (key: string, zip: JSZip) => {
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  await s3.putObject({
    Bucket: process.env.attachmentsBucketName,
    Key: key,
    Body: Readable.from(zipBuffer),
    ContentLength: zipBuffer.byteLength,
    ContentType: "application/zip",
    Tagging: "auto_delete_category=generated_zip",
  });
};

export const startZipWorker = async (
  lambdaClient: LambdaClient,
  reportType: ReportType,
  state: StateAbbr,
  id: string
) => {
  //remove previous zip file
  await s3
    .deleteObject({
      Bucket: process.env.attachmentsBucketName,
      Key: formatS3ReportZipKey(reportType, state, id),
    })
    .catch(() => {});

  await lambdaClient.send(
    new InvokeCommand({
      FunctionName: process.env.zipWorkerFunctionName,
      InvocationType: "Event",
      Payload: JSON.stringify({ reportType, state, id }),
    })
  );
};
