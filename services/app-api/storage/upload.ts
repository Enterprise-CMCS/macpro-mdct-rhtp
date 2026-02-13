import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { createClient } from "./dynamo/dynamodb-lib";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import s3 from "../libs/s3-lib";

const uploadTableName = process.env.attachmentsBucketName;
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

export const queryUpload = async (decodedFileId: string, state: string) => {
  const documentParams: QueryCommandInput = {
    TableName: uploadTableName,
    KeyConditionExpression:
      "uploadedState = :uploadedState AND fileId = :fileId",
    ExpressionAttributeValues: {
      ":uploadedState": state,
      ":fileId": decodedFileId,
    },
  };

  return await client.send(new QueryCommand(documentParams));
};
