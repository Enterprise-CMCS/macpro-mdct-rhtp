import { NotificationBody, putNotification } from "../../storage/notifications";
import { SendEmailCommandOutput, SendEmailRequest } from "@aws-sdk/client-ses";
import { User } from "../../types/types";
import { Report } from "@rhtp/shared";

const saveNotificationPerRecipient = async (
  recipients: {
    to: string[];
    cc: string[];
    bcc: string[];
  },
  body: Omit<NotificationBody, "recipient">
) => {
  const recipientList: string[] = [];
  Object.values(recipients).map((recipientGroup) =>
    recipientList.push(...recipientGroup)
  );

  for (const recipient of recipientList) {
    const recipientBody = {
      ...body,
      recipient,
    };
    await putNotification(recipientBody);
  }
};

export const saveNotification = async (
  emailResponse: SendEmailCommandOutput,
  emailTemplate: SendEmailRequest,
  report: Report,
  user: User
) => {
  if (!emailResponse?.MessageId) return;
  const { ToAddresses, CcAddresses, BccAddresses } =
    emailTemplate.Destination ?? {};
  const recipients = {
    to: ToAddresses ?? [],
    cc: CcAddresses ?? [],
    bcc: BccAddresses ?? [],
  };

  const body = {
    created: Date.now(),
    contextId: report.id,
    emailId: emailResponse.MessageId,
    state: report.state,
    recipients,
    message: emailTemplate.Message,
    triggeredByUser: user.fullName,
    triggeredByUserEmail: user.email,
  };

  await saveNotificationPerRecipient(recipients, body);
};
