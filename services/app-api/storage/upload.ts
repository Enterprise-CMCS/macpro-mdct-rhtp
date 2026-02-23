import {
  DeleteCommand,
  QueryCommandInput,
  UpdateCommand,
  paginateQuery,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { collectPageItems, createClient } from "./dynamo/dynamodb-lib";
import s3 from "../libs/s3-lib";

interface UploadData {
  uploadedState: string;
  awsFilename: string;
  filename: string;
  uploadedDate: string;
  uploadedUsername: string;
  fileId: string;
}

const uploadTableName = process.env.UploadsTable!;
const client = createClient();

export const deleteUpload = async (
  decodedFileId: string,
  state: string,
  document: Record<string, any>,
) => {
  var params = {
    Bucket: process.env.attachmentsBucketName,
    Key: document.awsFilename,
  };
  await s3.deleteObject(params);

  await client.send(
    new DeleteCommand({
      TableName: uploadTableName,
      Key: {
        uploadedState: state,
        fileId: decodedFileId,
      },
    }),
  );
};

export const updateUpload = async (
  state: string,
  username: string,
  uploadedFileName: string,
  awsFilename: string,
  fileId: string,
) => {
  const params = {
    TableName: uploadTableName,
    Key: {
      uploadedState: state,
      fileId: fileId,
    },
    UpdateExpression: "SET uploadedUsername = :uploadedUsername, uploadedDate = :uploadedDate, filename = :filename, awsFilename = :awsFilename",
    ExpressionAttributeValues: {
      ":uploadedUsername": username,
      ":uploadedDate": new Date().toISOString(),
      ":filename": uploadedFileName,
      ":awsFilename": awsFilename,
    },
  };

  await client.send(new UpdateCommand(params));
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

export const queryViewUpload = async (state: string) => {
  const params: QueryCommandInput = {
    TableName: uploadTableName,
    KeyConditionExpression: "uploadedState = :state",
    ExpressionAttributeValues: {
      ":state": state,
    },
  };

  const response = paginateQuery({ client }, params);
  const uploads = await collectPageItems(response);

  return uploads as UploadData[];
};
