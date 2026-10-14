/*
 * Export AWS Credentials first, then add UPLOAD_BUCKET and STAGE. The bucket isn't automatically pulled
 * in by branch alone.
 *
 * Export UPLOAD_BUCKET="...."
 * Export STAGE="dev"
 * npx tsx scripts/scanMissingUploads.ts
 */
import { createDynamoClient } from "./utils/dynamo.ts";
import { paginateScan } from "@aws-sdk/lib-dynamodb";
import { createS3Client } from "./utils/s3.ts";
import { paginateListObjectsV2 } from "@aws-sdk/client-s3";

const dynamoClient = createDynamoClient();
const s3Client = createS3Client();
const logPrefix = () => new Date().toISOString() + " | ";
const TableName = `${process.env.STAGE}-uploads`; // Note datasets will be datasets-uploads
const Bucket = `${process.env.UPLOAD_BUCKET}`; // Note this has a stack number pinned on it in each env

async function main() {
  console.info("Beginning Scan of DB Records");
  let count = 0;
  const missingUploads = [];
  const uploads = await checkS3();
  for await (const record of scanUploads()) {
    count++;
    const matchingUpload = uploads.find((upload) =>
      upload.Key!.includes(record.fileId)
    ); // Unique enough for us, right now
    if (!matchingUpload) {
      console.info(
        `${logPrefix()}Dynamo Record Missing s3 match: ${record.uploadedState}, ${record.fileId}, ${record.filename}, ${record.uploadedDate}`
      );
      missingUploads.push(record);
    }
  }

  console.info(
    `${logPrefix()} Scan Complete - Total Dynamo Records: ${count}"`
  );
  console.info(`${logPrefix()} Total S3 Entries: ${uploads.length}"`);
  console.info(
    `${logPrefix()} Dynamo Records Missing S3 Entries: ${missingUploads.length}"`
  );
}

/** Find all upload table records */
async function* scanUploads() {
  console.info(`${logPrefix()}Scanning table ${TableName}...`);
  let pageNumber = 0;
  for await (const page of paginateScan(
    { client: dynamoClient },
    { TableName }
  )) {
    pageNumber += 1;
    console.debug(`${logPrefix()}${TableName} page ${pageNumber}...`);
    yield* (page.Items ?? []) as UploadEntry[];
  }
}

async function checkS3() {
  const contents = [];
  const params = {
    Bucket,
  };
  for await (let page of paginateListObjectsV2({ client: s3Client }, params)) {
    contents.push(...(page.Contents ?? []));
  }

  return contents;
}

export type UploadEntry = {
  uploadedState: string;
  fileId: string;
  filename: string;
  filesize: number;
  uploadedDate: string;
  uploadedUsername: string;
};

main();
