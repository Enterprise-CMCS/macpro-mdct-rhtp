import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { handler } from "../../libs/handler-lib";
import { parseReportParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";

const client = new SESClient({ region: "us-east-1" });
const FROM_ADDRESS = "MDCT_NoReply@cms.hhs.gov";

const createSendEmailCommand = () => {
  return new SendEmailCommand({
    Source: FROM_ADDRESS,
    Destination: {
      ToAddresses: [
        // testing multiple domain recipients, all owned by team members or client
        "petedunlap@gmail.com",
        "hi@canipush.com",
        "junni.rajbhandari1@cms.hhs.gov",
        "garrett.rabian@coforma.io",
      ],
    },
    Message: {
      Subject: { Data: "RHTP Notification" },
      Body: { Text: { Data: "This is a notification from the RHTP system." } },
    },
  });
};

export const sendEmail = handler(parseReportParameters, async () => {
  const sendEmailCommand = createSendEmailCommand();
  const response = await client.send(sendEmailCommand);

  return ok(response);
});
