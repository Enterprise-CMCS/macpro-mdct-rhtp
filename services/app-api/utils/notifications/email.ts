import { Report, ReportPages, ReportStatus } from "@rhtp/shared";
import sesLib from "../../libs/ses-lib";
import { logger } from "../../libs/debug-lib";
import { isLocalStack } from "../../libs/localstack";
import { User } from "../../types/types";
import { saveNotification } from "./notifications";

const FROM_ADDRESS = "MDCT_NoReply@cms.hhs.gov";

const getTemplate = (
  name: string,
  status: ReportStatus,
  recipients: string[]
) => ({
  Source: FROM_ADDRESS,
  Destination: {
    ToAddresses: recipients,
  },
  Message: {
    Subject: { Data: `MDCT RHTP Status Update for: ${name}` },
    Body: {
      Text: {
        Data: `Dear User,

This is an automated notification to inform you that there has been a change in the status of a report within the Rural Health Transformation Program (RHTP) platform on MDCT.

Please find the details of the update below:

Update Summary

    Report Name: ${name}

    New Status: ${status}

    Date of Change: ${new Date().toDateString()}

If you believe this status change was made in error, or if you have questions regarding the requirements for this new status, please contact your system administrator or reach out to the RHTP support desk.
`,
      },
    },
  },
});

const getRecipients = (pages: ReportPages) => {
  const generalInformationPage = pages.find(
    (page) => page.id === "general-information"
  );
  const emailFields = generalInformationPage?.elements?.filter(
    (element) =>
      element.id.includes("email") &&
      "answer" in element &&
      element.answer !== ""
  );
  const emails = emailFields?.map((field) =>
    "answer" in field ? field.answer : undefined
  ) as string[];
  return emails || [];
};

export const sendEmail = async (report: Report, user: User) => {
  const { name, pages, status } = report;
  const recipients = getRecipients(pages);
  if (recipients.length === 0) return;
  const emailTemplate = getTemplate(name, status, recipients);
  logger.info(
    "Sending email to: ",
    recipients,
    "with content: ",
    emailTemplate
  );
  if (!isLocalStack()) {
    const res = await sesLib.sendSesEmail(emailTemplate);
    await saveNotification(res, emailTemplate, report, user);
  } else {
    logger.info("Skipping email in dev env");
  }
};
