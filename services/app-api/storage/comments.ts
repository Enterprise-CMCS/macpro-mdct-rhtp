import { PutCommand, paginateQuery, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
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

export const queryComments = async (contextId: string): Promise<Comment[]> => {
  const params: QueryCommandInput = {
    TableName: commentsTableName,
    KeyConditionExpression: "contextId = :contextId",
    ExpressionAttributeValues: {
      ":contextId": contextId,
    },
    ScanIndexForward: true, // ascending by created (chronological)
  };

  const response = paginateQuery({ client }, params);
  const items = await collectPageItems(response);
  return items as Comment[];
};
