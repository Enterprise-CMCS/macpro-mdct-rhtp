/*
 * Takes a reportId, and filename.
 * Re-opens the given report without triggering an email, removes the entry from the report, and dynamo.
 * The upload already is missing in s3 in these scenarios
 *
 * Export AWS Credentials first, make sure stage is included
 *
 * STAGE="main" npx tsx scripts/reopenMissingUploads.ts {{state}} {{reportId}} {{fileId}}
 */
import { createDynamoClient } from "./utils/dynamo.ts";
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = createDynamoClient();
const logPrefix = () => new Date().toISOString() + " | ";
const uploadTableName = `${process.env.STAGE}-uploads`;
const reportTableName = `${process.env.STAGE}-reports`;
const state = process.argv[2];
const reportId = process.argv[3];
const fileId = process.argv[4];

async function main() {
  console.info(`${logPrefix()}Correcting upload ${fileId} on ${reportId}`);
  const reportPages = await getReportPages();

  const root = reportPages.find((page) => page.id === reportId) as Report;
  root.status = "In progress";

  for (const page of reportPages) {
    // skip root
    if (page.id === reportId || !page.elements) {
      continue;
    }
    cleanElements(page.elements);
  }

  await removeUploadEntry();
  await saveReport(reportPages);
}

/**
 * Check each element in the page, or elements in accordion groups for uploads.
 * If there's a match, splice it out
 */
function cleanElements(elements: PageElement[]) {
  for (const element of elements) {
    switch (element.type) {
      case "attachmentTable":
        if (!element.answer) continue;
        const tableAttachmentIndex = (
          element.answer as UploadTableAnswer[]
        ).findIndex((upload) => upload.attachment.fileId === fileId);
        if (tableAttachmentIndex != undefined && tableAttachmentIndex !== -1) {
          element.answer.splice(tableAttachmentIndex, 1);
          console.info(
            `${logPrefix()}Found and removed ${fileId} on ${reportId}`
          );
        }
        continue;
      case "attachmentArea":
      case "obligatedAndSpentFundsAttachment":
        if (!element.answer) continue;
        const attachmentIndex = (element.answer as UploadAnswer[]).findIndex(
          (upload) => upload.fileId === fileId
        );
        if (attachmentIndex != undefined && attachmentIndex !== -1) {
          element.answer.splice(attachmentIndex, 1);
          console.info(
            `${logPrefix()}Found and removed ${fileId} on ${reportId}`
          );
        }
        continue;
      case "accordionGroup":
        for (const accordion of element.accordions!) {
          cleanElements(accordion.elements);
        }
        continue;
      default:
        continue;
    }
  }
}

async function getReportPages() {
  const command = new QueryCommand({
    TableName: reportTableName,
    ConsistentRead: true,
    KeyConditionExpression: "pKey = :pKey AND begins_with(sortKey, :id)",
    ExpressionAttributeValues: {
      ":pKey": `RHTP#${state}`,
      ":id": reportId,
    },
  });
  const response = await client.send(command);
  if (!response.Items || response.Items?.length == 0) {
    throw new Error(
      `${logPrefix()}Failed to retrieve a report by id - ${reportId}`
    );
  }
  return response.Items as ReportPage[];
}

async function saveReport(reportPages: ReportPage[]) {
  let updatedCount = 0;
  try {
    for await (const batch of createBatches(reportPages)) {
      await sendBatch(batch);
      updatedCount += Object.values(batch.RequestItems).flat().length;
    }

    console.info(
      `${logPrefix()}Success. Updated ${updatedCount} report pages.`
    );
  } catch (error) {
    console.error(error);
    console.info(
      `${logPrefix()}Updated at least ${updatedCount} report pages.`
    );
  }
}

async function removeUploadEntry() {
  await client.send(
    new DeleteCommand({
      TableName: uploadTableName,
      Key: {
        uploadedState: state,
        fileId,
      },
    })
  );
  console.info(`${logPrefix()}Removed ${state} ${fileId} from uploads table`);
}

/**
 * Collect reports that need to be updated into batches of <= 25 items.
 */
async function* createBatches(pages: ReportPage[]) {
  /**
   * Dynamo BatchWriteCommand allows up to 25 items, but also has a size cap.
   * Limiting each batch to 5 items should be safe.
   */
  const MAX_BATCH_SIZE = 5;
  let batchNumber = 0;
  let currentBatchSize = 0;
  let RequestItems: Record<string, { PutRequest: { Item: any } }[]> = {};

  for (const Item of pages) {
    RequestItems[reportTableName] ??= [];
    RequestItems[reportTableName].push({ PutRequest: { Item } });
    currentBatchSize += 1;

    if (currentBatchSize >= MAX_BATCH_SIZE) {
      batchNumber += 1;
      console.debug(`Saving batch ${batchNumber}...`);

      yield { RequestItems };

      currentBatchSize = 0;
      RequestItems = {};
    }
  }

  if (currentBatchSize > 0) {
    yield { RequestItems };
  }
}

/** Send a BatchWriteCommand containing the given reports. */
async function sendBatch(params: BatchWriteCommandInput) {
  const command = new BatchWriteCommand(params);
  const response = await client.send(command);
  const unprocessedIds = Object.entries(response.UnprocessedItems ?? {}).map(
    ([table, reqs]) => reqs.map((req) => `${table}:${req.PutRequest!.Item!.id}`)
  );
  if (unprocessedIds.length > 0) {
    const message = `Batch write failed! The following reports were not updated: ${unprocessedIds.join(", ")}`;
    throw new Error(message);
  }
}

export type UploadEntry = {
  uploadedState: string;
  fileId: string;
  filename: string;
  filesize: number;
  uploadedDate: string;
  uploadedUsername: string;
};

/** An RHTP report. */
type Report = {
  id: string;
  status: string;
};

type ReportPage = {
  id: string;
  status: string;
  elements?: PageElement[];
};

/** An element on a report page. Imitates the real type used in the app. */
type PageElement = {
  type: string;
  fields?: unknown;
  categories?: unknown;
  choices?: {
    checkedChildren?: PageElement[];
  }[];
  answer?: (UploadAnswer | UploadTableAnswer)[];
  accordions?: {
    elements: PageElement[];
  }[];
};

type UploadAnswer = {
  fileId: string;
};

type UploadTableAnswer = {
  attachment: UploadAnswer;
};
main();
