import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { createClient } from "./dynamo/dynamodb-lib";
import { SendEmailRequest } from "@aws-sdk/client-ses";

const notificationsTableName = process.env.NotificationsTable!;
const client = createClient();

export const putNotification = async (body: NotificationBody) => {
  await client.send(
    new PutCommand({
      TableName: notificationsTableName,
      Item: body,
    })
  );
};

type NotificationBody = {
  contextId: string;
  emailId: string;
  created: number;
  recipients: {
    to?: string[];
    cc?: string[];
    bcc?: string[];
  };
  message: SendEmailRequest["Message"];
  triggeredByUser: string;
  triggeredByUserEmail: string;
};
