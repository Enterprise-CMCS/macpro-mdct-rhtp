import {
  PutCommand,
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
