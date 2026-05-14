import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { handler } from "../../libs/handler-lib";
import { parseReportParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";

const client = new SESClient({ region: "us-east-1" });
const FROM_ADDRESS = "MDCT_NoReply@cms.hhs.gov";

const createSendEmailCommand = (toAddress: string) => {
  return new SendEmailCommand({
    Source: FROM_ADDRESS,
    Destination: { ToAddresses: [toAddress] },
    Message: {
      Subject: { Data: "RHTP Notification" },
      Body: { Text: { Data: "This is a notification from the RHTP system." } },
    },
  });
};

export const sendEmail = handler(parseReportParameters, async () => {
  const sendEmailCommand = createSendEmailCommand("garrett.rabian@coforma.io");
  const response = await client.send(sendEmailCommand);

  return ok(response);
});
