import {
  DeleteCommand,
  PutCommand,
  QueryCommandInput,
  paginateQuery,
  paginateScan,
} from "@aws-sdk/lib-dynamodb";
import { collectPageItems, createClient } from "./dynamo/dynamodb-lib";
import { NotificationRecipientRecord } from "@rhtp/shared";

const notificationRecipientsTable = process.env.NotificationRecipientsTable!;
const client = createClient();

export const putRecipient = async (item: NotificationRecipientRecord) => {
  await client.send(
    new PutCommand({
      TableName: notificationRecipientsTable,
      Item: item,
    })
  );
};

export const scanAllRecipients = async () => {
  const response = paginateScan(
    { client },
    { TableName: notificationRecipientsTable }
  );
  const items = await collectPageItems(response);
  return items as NotificationRecipientRecord[];
};

// No API endpoint for this query. Expected use only in backend to identify recipients for emails.
export const queryRecipientsByState = async (
  state: string
): Promise<NotificationRecipientRecord[]> => {
  const params: QueryCommandInput = {
    TableName: notificationRecipientsTable,
    KeyConditionExpression: "#state = :state",
    ExpressionAttributeValues: {
      ":state": state,
    },
    ExpressionAttributeNames: {
      "#state": "state",
    },
  };

  const response = paginateQuery({ client }, params);
  const items = await collectPageItems(response);
  return items as NotificationRecipientRecord[];
};

export const deleteRecipient = async (state: string, id: string) => {
  await client.send(
    new DeleteCommand({
      TableName: notificationRecipientsTable,
      Key: {
        state,
        id,
      },
    })
  );
};
