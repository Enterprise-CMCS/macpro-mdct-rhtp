import { putNotification } from "../../storage/notifications";
import { SendEmailCommandOutput, SendEmailRequest } from "@aws-sdk/client-ses";
import { User } from "../../types/types";
import { Report } from "@rhtp/shared";

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
    contextId: report.id,
    emailId: emailResponse.MessageId,
    created: Date.now(),
    recipients,
    message: emailTemplate.Message,
    triggeredByUser: user.fullName,
    triggeredByUserEmail: user.email,
  };
  await putNotification(body);
};
