import { Report, ReportPages, ReportStatus, UserRoles } from "@rhtp/shared";
import sesLib from "../../libs/ses-lib";
import { logger } from "../../libs/debug-lib";
import { isLocalStack } from "../../libs/localstack";
import { User } from "../../types/types";
import { saveNotifications } from "./notifications";
import { queryRecipientsByState } from "../../storage/notificationRecipients";

const FROM_ADDRESS = "MDCT_NoReply@cms.hhs.gov";

const getReportStatusChangeTemplate = (
  reportName: string,
  status: ReportStatus,
  recipients: string[]
) => ({
  Source: FROM_ADDRESS,
  Destination: {
    ToAddresses: recipients,
  },
  Message: {
    Subject: { Data: `MDCT RHTP Status Update for: ${reportName}` },
    Body: {
      Text: {
        Data: `Dear User,

This is an automated notification to inform you that there has been a change in the status of a report within the Rural Health Transformation Program (RHTP) platform on MDCT.

Please find the details of the update below:

Update Summary

    Report Name: ${reportName}

    New Status: ${status}

    Date of Change: ${new Date().toDateString()}

If you believe this status change was made in error, or if you have questions regarding the requirements for this new status, please contact your system administrator or reach out to the RHTP support desk.
`,
      },
    },
  },
});

const getRecipients = async (
  pages: ReportPages,
  userRole: UserRoles,
  state: string
) => {
  let recipientEmails: string[] = [];
  if (userRole !== UserRoles.STATE_USER) {
    const generalInformationPage = pages.find(
      (page) => page.id === "general-information"
    );
    const emailFields = generalInformationPage?.elements?.filter(
      (element) =>
        element.id.includes("email") &&
        "answer" in element &&
        element.answer !== ""
    );
    recipientEmails = emailFields?.map((field) =>
      "answer" in field ? field.answer : undefined
    ) as string[];
  } else {
    const assignedUsers = await queryRecipientsByState(state);
    recipientEmails = assignedUsers?.map((user) => user.email);
  }
  return recipientEmails;
};

export const sendReportStatusChangeEmail = async (
  report: Report,
  user: User
) => {
  const { name, pages, state, status } = report;
  const recipients = await getRecipients(pages, user.role, state);
  if (recipients.length === 0) return;
  const emailTemplate = getReportStatusChangeTemplate(name, status, recipients);
  logger.info(
    "Sending email to: ",
    recipients,
    "with content: ",
    emailTemplate
  );
  if (!isLocalStack()) {
    const res = await sesLib.sendSesEmail(emailTemplate);
    await saveNotifications(res, emailTemplate, report, user);
  } else {
    logger.info("Skipping email in dev env");
  }
};

const getReportCommentTemplate = (
  reportName: string,
  recipients: string[]
) => ({
  Source: FROM_ADDRESS,
  Destination: {
    ToAddresses: recipients,
  },
  Message: {
    Subject: { Data: `Subject: RHTP: New comment on ${reportName}` },
    Body: {
      Text: {
        Data: `
This is an automated notification that a comment has been added to a report within the MDCT Rural Health Transformation Program (RHTP) platform.

Update Summary

    Report Name: ${reportName}

    Activity: New report comment added

    Date of Change: ${new Date().toDateString()}

    Please follow the steps below to navigate to the comment within the portal:

    1. Log in to the [MDCT Portal](https://mdctrhtp.cms.gov)
    2. Find ${reportName}
    3. Select Status/Comments.

    If you believe this notification was sent in error, or if you have questions, please reach out to the RHTP support desk.

    Sincerely,

    The RHTP Team
`,
      },
    },
  },
});

export const sendReportCommentEmail = async (report: Report, user: User) => {
  const { name, pages, state } = report;
  const recipients = await getRecipients(pages, user.role, state);
  if (recipients.length === 0) return;
  const emailTemplate = getReportCommentTemplate(name, recipients);
  logger.info(
    "Sending email to: ",
    recipients,
    "with content: ",
    emailTemplate
  );
  if (!isLocalStack()) {
    const res = await sesLib.sendSesEmail(emailTemplate);
    await saveNotifications(res, emailTemplate, report, user);
  } else {
    logger.info("Skipping email in dev env");
  }
};
