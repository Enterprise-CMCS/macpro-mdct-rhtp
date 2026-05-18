import { handler } from "../../libs/handler-lib";
import { parseReportParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import sesLib from "../../libs/ses-lib";

const FROM_ADDRESS = "MDCT_NoReply@cms.hhs.gov";

const emailTemplate = {
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
};

export const sendEmail = handler(parseReportParameters, async () => {
  const response = await sesLib.sendSesEmail(emailTemplate);
  return ok(response);
});
