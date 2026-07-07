import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import { parseFileUploadDownloadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { getReport } from "../../storage/reports";
import { ReportType, StateAbbr } from "@rhtp/shared";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import JSZip from "jszip";
import { Readable } from "node:stream";
import {
  sortElementsForZip,
  getInitativeFiles,
  getAccordionFiles,
  getSustainabilityAndHighlightFiles,
} from "../../utils/reports/buildZip";

const lambdaClient = new LambdaClient({ region: "us-east-1" });

const S3ZipKey = (reportType: string, state: string, id: string) =>
  `zips/${reportType}/${state}/${id}.zip`;

export const triggerZipGeneration = handler(
  parseFileUploadDownloadParameters,
  async (request) => {
    const { state, reportType, id } = request.parameters;

    await s3
      .deleteObject({
        Bucket: process.env.attachmentsBucketName,
        Key: S3ZipKey(reportType, state, id),
      })
      .catch(() => {});

    await lambdaClient.send(
      new InvokeCommand({
        FunctionName: process.env.zipWorkerFunctionName,
        InvocationType: "Event",
        Payload: JSON.stringify({ reportType, state, id }),
      })
    );

    return ok({ status: "pending" });
  }
);

export const getZipStatus = handler(
  parseFileUploadDownloadParameters,
  async (request) => {
    const { state, reportType, id } = request.parameters;
    const key = S3ZipKey(reportType, state, id);

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
  }
);

interface ZipWorkerEvent {
  reportType: ReportType;
  state: StateAbbr;
  id: string;
}

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

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  const key = S3ZipKey(reportType, state, id);
  await s3.putObject({
    Bucket: process.env.attachmentsBucketName,
    Key: key,
    Body: Readable.from(zipBuffer),
    ContentLength: zipBuffer.byteLength,
    ContentType: "application/zip",
    Tagging: "auto_delete_category=generated_zip",
  });
};

export const createZipByIds = handler(
  parseFileUploadDownloadParameters,
  async (request) => {
    const { body, parameters } = request;
    const { state, reportType, id } = parameters;
    const { fileIds } = body as any;

    const zip = new JSZip();
    for (const fileId in fileIds) {
      const item = await s3.getObject({
        Bucket: process.env.attachmentsBucketName,
        Key: `${reportType}/${state}/${id}/${fileId}`,
      });
      const bytes = await item.Body?.transformToByteArray();
      if (bytes) {
        zip.file(`${state}/"UseOfFunds"/${fileId}`, bytes);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const key = S3ZipKey(reportType, state, id);
    await s3.putObject({
      Bucket: process.env.attachmentsBucketName,
      Key: key,
      Body: Readable.from(zipBuffer),
      ContentLength: zipBuffer.byteLength,
      ContentType: "application/zip",
      Tagging: "auto_delete_category=generated_zip",
    });
    return ok();
  }
);
