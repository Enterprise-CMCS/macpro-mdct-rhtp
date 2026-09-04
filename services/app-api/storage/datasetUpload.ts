import {
  BatchWriteCommand,
  DeleteCommand,
  QueryCommandInput,
  UpdateCommand,
  paginateQuery,
  QueryCommand,
  paginateScan,
} from "@aws-sdk/lib-dynamodb";
import { collectPageItems, createClient } from "./dynamo/dynamodb-lib";
import s3 from "../libs/s3-lib";
import { UploadData } from "../types/uploads";

const uploadTableName = process.env.DataSetUploadsTable!;
const client = createClient();

export const deleteUpload = async (
  decodedFileId: string,
  state: string,
  id: string,
  document: Record<string, any>
) => {
  var params = {
    Bucket: process.env.datasetBucketName,
    Key: `${id}/${state}/${document.fileId}`,
  };
  await s3.deleteObject(params);

  await client.send(
    new DeleteCommand({
      TableName: uploadTableName,
      Key: {
        uploadedState: state,
        fileId: decodedFileId,
      },
    })
  );
};

export const updateUpload = async (
  state: string,
  username: string,
  uploadedFileName: string,
  fileId: string,
  datasetId: string,
  uploadedFileSize: number
) => {
  const params = {
    TableName: uploadTableName,
    Key: {
      uploadedState: state,
      fileId: fileId,
    },
    UpdateExpression:
      "SET uploadedUsername = :uploadedUsername, uploadedDate = :uploadedDate, filename = :filename, filesize = :filesize, datasetId = :datasetId",
    ExpressionAttributeValues: {
      ":uploadedUsername": username,
      ":uploadedDate": new Date().toISOString(),
      ":filename": uploadedFileName,
      ":filesize": uploadedFileSize,
      ":datasetId": datasetId,
    },
  };

  await client.send(new UpdateCommand(params));
};

export const batchPutUploads = async (uploads: UploadData[]) => {
  const BATCH_SIZE = 25;
  for (let i = 0; i < uploads.length; i += BATCH_SIZE) {
    const batch = uploads.slice(i, i + BATCH_SIZE);
    await client.send(
      new BatchWriteCommand({
        RequestItems: {
          [uploadTableName]: batch.map((upload) => ({
            PutRequest: { Item: upload },
          })),
        },
      })
    );
  }
};

export const queryUpload = async (fileId: string, state: string) => {
  const documentParams: QueryCommandInput = {
    TableName: uploadTableName,
    KeyConditionExpression:
      "uploadedState = :uploadedState AND fileId = :fileId",
    ExpressionAttributeValues: {
      ":uploadedState": state,
      ":fileId": fileId,
    },
  };

  return await client.send(new QueryCommand(documentParams));
};

export const queryStateUpload = async () => {
  const pages = paginateScan({ client }, { TableName: uploadTableName });
  const items: Record<string, any>[] = [];
  for await (const page of pages) {
    items.push(...(page.Items ?? []));
  }
  return items as UploadData[];
};

export const queryViewUploads = async (state: string, fileId: string) => {
  const params: QueryCommandInput = {
    TableName: uploadTableName,
    KeyConditionExpression:
      "uploadedState = :state and begins_with(fileId, :fileId)",
    ExpressionAttributeValues: {
      ":state": state,
      ":fileId": fileId,
    },
  };

  const response = paginateQuery({ client }, params);
  const uploads = await collectPageItems(response);

  return uploads as UploadData[];
};
