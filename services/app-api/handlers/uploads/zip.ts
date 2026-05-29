import s3 from "../../libs/s3-lib";
import { handler } from "../../libs/handler-lib";
import { parseFileUploadDownloadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import { getReport } from "../../storage/reports";
import { ElementType, ReportType, StateAbbr } from "@rhtp/shared";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import JSZip from "jszip";
import { Readable } from "node:stream";

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
  const flattenElements = report?.pages.flatMap((page) => page.elements);

  const initAttachment = flattenElements?.find(
    (element) => element?.type === ElementType.AttachmentTable
  );
  const initAttachmentFiles =
    initAttachment?.answer?.map((answer) => answer.attachment) ?? [];

  const accordionGroups = flattenElements
    ?.filter((element) => element?.type === ElementType.AccordionGroup)
    .flatMap((group) =>
      group.accordions.flatMap((accordions) => accordions.children)
    )
    .filter((element) => element.type === ElementType.AttachmentArea);

  const accordionFiles =
    accordionGroups?.flatMap((group) => group.answer) ?? [];

  const files = [...initAttachmentFiles, ...accordionFiles].filter(
    (file) => file != undefined
  );

  const zip = new JSZip();
  for (const file of files) {
    const item = await s3.getObject({
      Bucket: process.env.attachmentsBucketName,
      Key: `${reportType}/${state}/${id}/${file?.fileId}`,
    });
    const bytes = await item.Body?.transformToByteArray();
    if (bytes && file?.name) {
      zip.file(`${state}/${report?.subTypeKey}/${file.name}`, bytes);
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
