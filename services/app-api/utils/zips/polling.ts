import s3 from "../../libs/s3-lib";
import { ok } from "../../libs/response-lib";
import { fixLocalstackUrl } from "../../libs/localstack";
import JSZip from "jszip";
import { Readable } from "node:stream";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { StateAbbr, ZipRequestBody, ZipRequestTypes } from "@rhtp/shared";
import KSUID from "ksuid";
import { formatS3ZipKey } from "./buildZip";

const lambdaClient = new LambdaClient({ region: "us-east-1" });

const getFileName = async (key: string) => {
  const { TagSet } = await s3.getObjectTagging({
    Bucket: process.env.attachmentsBucketName,
    Key: key,
  });
  if (!TagSet) return "RHTP.zip";
  const state = TagSet.find((tag) => tag.Key === "state")?.Value as StateAbbr;
  const subTypeKeys = TagSet.find((tag) => tag.Key === "subTypeKeys")?.Value;
  return `RHTP_${state ?? "ALL_STATES"}_${subTypeKeys}.zip`;
};

export const getPSURL = async (zipId: string) => {
  const key = formatS3ZipKey(zipId);
  const exists = await s3
    .headObject({ Bucket: process.env.attachmentsBucketName, Key: key })
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    return ok({ status: "pending" });
  }

  const fileName = await getFileName(key);
  let psurl = await s3.getSignedDownloadUrl({
    Bucket: process.env.attachmentsBucketName,
    Key: key,
    ResponseContentDisposition: `attachment; filename=${fileName}`,
  });
  psurl = fixLocalstackUrl(psurl);

  return ok({ status: "ready", psurl });
};

export const zipBuffer = async (zipId: string, tags: string, zip: JSZip) => {
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  await s3.putObject({
    Bucket: process.env.attachmentsBucketName,
    Key: formatS3ZipKey(zipId),
    Body: Readable.from(zipBuffer),
    ContentLength: zipBuffer.byteLength,
    ContentType: "application/zip",
    Tagging: `auto_delete_category=generated_zip&${tags}`,
  });
};

export const startZipWorker = async (body: ZipRequestBody) => {
  const { type } = body;
  const zipId = KSUID.randomSync().string;
  let payload: any = { type, zipId };
  if (type === ZipRequestTypes.REPORT && body.report) {
    const { reportType, state, id } = body.report;
    payload = { ...payload, reportType, state, id };
  } else if (type === ZipRequestTypes.USE_OF_FUNDS) {
    const { state, reportSubTypeKeys } = body;
    payload = { ...payload, state, reportSubTypeKeys };
  } else {
    throw new Error("Type not recognized");
  }
  await lambdaClient.send(
    new InvokeCommand({
      FunctionName: process.env.zipWorkerFunctionName,
      InvocationType: "Event",
      Payload: JSON.stringify(payload),
    })
  );
  return zipId;
};
