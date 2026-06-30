import {
  PutCommand,
  BatchWriteCommand,
  paginateQuery,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { collectPageItems, createClient } from "./dynamo/dynamodb-lib";
import { Comment } from "@rhtp/shared";

const commentsTableName = process.env.CommentsTable!;
const client = createClient();

export const putComment = async (comment: Comment) => {
  await client.send(
    new PutCommand({
      TableName: commentsTableName,
      Item: comment,
    })
  );
};

export const batchPutComments = async (comments: Comment[]) => {
  const BATCH_SIZE = 25;
  for (let i = 0; i < comments.length; i += BATCH_SIZE) {
    const batch = comments.slice(i, i + BATCH_SIZE);
    await client.send(
      new BatchWriteCommand({
        RequestItems: {
          [commentsTableName]: batch.map((comment) => ({
            PutRequest: { Item: comment },
          })),
        },
      })
    );
  }
};

export const queryComments = async (
  contextId: string,
  includeInternal: boolean
): Promise<Comment[]> => {
  const params: QueryCommandInput = {
    TableName: commentsTableName,
    KeyConditionExpression: "contextId = :contextId",
    ExpressionAttributeValues: {
      ":contextId": contextId,
    },
    ScanIndexForward: false, // latest first
  };

  if (!includeInternal) {
    params.FilterExpression = "isInternal = :isInternal";
    params.ExpressionAttributeValues![":isInternal"] = false;
  }

  const response = paginateQuery({ client }, params);
  const items = await collectPageItems(response);
  return items as Comment[];
};
