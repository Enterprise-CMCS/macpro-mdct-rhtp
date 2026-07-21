import {
  AttachmentStatus,
  Comment,
  Report,
  ReportPages,
  UserRoles,
} from "@rhtp/shared";
import sesLib from "../../libs/ses-lib";
import { logger } from "../../libs/debug-lib";
import { isLocalStack } from "../../libs/localstack";
import { User } from "../../types/types";
import { saveNotifications } from "./notifications";
import { queryRecipientsByState } from "../../storage/notificationRecipients";
import { getEmailTemplate } from "./emailTemplates";
import { queryUpload } from "../../storage/upload";

export enum EMAIL_TRIGGERS {
  REPORT_COMMENT = "REPORT_COMMENT",
  REPORT_STATUS_CHANGE = "REPORT_STATUS_CHANGE",
  ATTACHMENT_COMMENT = "ATTACHMENT_COMMENT",
  ATTACHMENT_STATUS_CHANGE_LOCKED = "ATTACHMENT_STATUS_CHANGE_LOCKED",
  ATTACHMENT_STATUS_CHANGE_NEEDS_REVISION = "ATTACHMENT_STATUS_CHANGE_NEEDS_REVISION",
}

const getRecipients = async (
  pages: ReportPages,
  userRole: UserRoles,
  state: string
) => {
  let recipientEmails: string[];
  if (userRole !== UserRoles.STATE_USER) {
    const generalInformationPage = pages.find(
      (page) => page.id === "general-information"
    );
    recipientEmails = (generalInformationPage?.elements ?? [])
      .filter((element) => element.id.includes("email"))
      .map((element) => ("answer" in element ? element.answer : undefined))
      .filter((answer) => typeof answer === "string");
  } else {
    const assignedUsers = await queryRecipientsByState(state);
    recipientEmails = assignedUsers.map((user) => user.email);
  }
  return [...new Set(recipientEmails)];
};

export const sendReportStatusChangeEmail = async (
  report: Report,
  user: User
) => {
  const { name: reportName, pages, state, status } = report;
  const recipients = await getRecipients(pages, user.role, state);
  if (recipients.length === 0) return;
  const emailTemplate = getEmailTemplate(EMAIL_TRIGGERS.REPORT_STATUS_CHANGE, {
    reportName,
    recipients,
    status,
  });
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

export const sendReportCommentEmail = async (report: Report, user: User) => {
  const { name: reportName, pages, state } = report;
  const recipients = await getRecipients(pages, user.role, state);
  if (recipients.length === 0) return;
  const emailTemplate = getEmailTemplate(EMAIL_TRIGGERS.REPORT_COMMENT, {
    reportName,
    recipients,
  });
  logger.info(
    "Sending email to: ",
    recipients,
    "with content: ",
    emailTemplate
  );
  if (!isLocalStack()) {
    try {
      const res = await sesLib.sendSesEmail(emailTemplate);
      await saveNotifications(res, emailTemplate, report, user);
    } catch (error) {
      logger.warn(
        "Email failed to send for report: ",
        report,
        " and template",
        emailTemplate,
        " with error ",
        error
      );
    }
  } else {
    logger.info("Skipping email in dev env");
  }
};

export const sendAttachmentCommentEmail = async (
  report: Report,
  user: User,
  comment: Comment
) => {
  const { name: reportName, pages, state } = report;
  const recipients = await getRecipients(pages, user.role, state);
  const results = await queryUpload(comment.contextId, state);
  if (!results.Items || results.Items.length === 0) {
    logger.error("Could not find matching file.");
    return;
  }
  const document = results.Items[0];
  const attachmentName = document.filename;
  if (recipients.length === 0) return;
  const emailTemplate = getEmailTemplate(EMAIL_TRIGGERS.ATTACHMENT_COMMENT, {
    reportName,
    recipients,
    attachmentName,
  });
  logger.info(
    "Sending email to: ",
    recipients,
    "with content: ",
    emailTemplate
  );
  if (!isLocalStack()) {
    try {
      const res = await sesLib.sendSesEmail(emailTemplate);
      await saveNotifications(res, emailTemplate, report, user);
    } catch (error) {
      logger.warn(
        "Email failed to send for report: ",
        report,
        " and template",
        emailTemplate,
        " with error ",
        error
      );
    }
  } else {
    logger.info("Skipping email in dev env");
  }
};

export const sendAttachmentStatusChangeEmail = async (
  report: Report,
  user: User,
  comment: Comment
) => {
  const { name: reportName, pages, state } = report;
  const recipients = await getRecipients(pages, user.role, state);
  const results = await queryUpload(comment.contextId, state);
  if (!results.Items || results.Items.length === 0) {
    logger.error("Could not find matching file.");
    return;
  }
  const document = results.Items[0];
  const attachmentName = document.filename;
  if (recipients.length === 0) return;
  let emailTemplate;
  if (comment.statusChange === AttachmentStatus.LOCKED_FOR_SCORING) {
    emailTemplate = getEmailTemplate(
      EMAIL_TRIGGERS.ATTACHMENT_STATUS_CHANGE_LOCKED,
      {
        reportName,
        recipients,
        attachmentName,
      }
    );
  } else {
    emailTemplate = getEmailTemplate(
      EMAIL_TRIGGERS.ATTACHMENT_STATUS_CHANGE_NEEDS_REVISION,
      {
        reportName,
        recipients,
        attachmentName,
      }
    );
  }
  logger.info(
    "Sending email to: ",
    recipients,
    "with content: ",
    emailTemplate
  );
  if (!isLocalStack()) {
    try {
      const res = await sesLib.sendSesEmail(emailTemplate);
      await saveNotifications(res, emailTemplate, report, user);
    } catch (error) {
      logger.warn(
        "Email failed to send for report: ",
        report,
        " and template",
        emailTemplate,
        " with error ",
        error
      );
    }
  } else {
    logger.info("Skipping email in dev env");
  }
};
