import {
  DeleteCommand,
  GetCommand,
  QueryCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { createClient } from "./dynamo/dynamodb-lib";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import s3 from "../libs/s3-lib";
import { convertToDynamoExpression } from "../utils/convertToDynamoExpressionVars";

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
  const date = new Date();
  const uploadEntry = {
    uploadedUsername: username,
    uploadedDate: date.toString(),
    filename: uploadedFileName,
    awsFilename: awsFilename,
  };

  const params = {
    TableName: uploadTableName,
    Key: {
      uploadedState: state,
      fileId: fileId,
    },
    ...convertToDynamoExpression(uploadEntry, "post"),
  };

  await client.send(new UpdateCommand(params));
};

export const queryUpload = async (fileId: string, state: string) => {
  const documentParams: QueryCommandInput = {
    TableName: uploadTableName,
    KeyConditionExpression:
      "uploadedState = :uploadedState AND fileId = :fileId",
    ExpressionAttributeNames: {
      "#uploadedState": "uploadedState",
      "#fileId": "fileId",
    },
    ExpressionAttributeValues: {
      ":uploadedState": state,
      ":fileId": fileId,
    },
  };

  return await client.send(new QueryCommand(documentParams));
};

export const queryViewUpload = async (fileId: string, state: string) => {
  const response = await client.send(
    new GetCommand({
      TableName: uploadTableName,
      Key: {
        uploadedState: state,
      },
    }),
  );
  return response.Item as UploadData | undefined;
};
