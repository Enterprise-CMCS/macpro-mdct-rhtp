import {
  AttachmentStatus,
  Comment,
  CommentType,
  ReportPages,
  ReportType,
  StateAbbr,
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
import { getReport } from "../../storage/reports";

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
      .filter((answer) => typeof answer === "string")
      .filter((answer) => answer !== "");
  } else {
    const assignedUsers = await queryRecipientsByState(state);
    recipientEmails = assignedUsers.map((user) => user.email);
  }
  return [...new Set(recipientEmails)];
};

export const sendEmail = async ({
  state,
  user,
  comment,
  reportId: reportIdProp,
}: {
  state: StateAbbr;
  user: User;
  comment?: Comment;
  reportId?: string;
}) => {
  let reportId: string | undefined;
  let uploadId: string | undefined;
  let attachmentName: string | undefined;
  let emailTrigger: EMAIL_TRIGGERS | undefined;

  // New external comment on a report
  if (
    comment &&
    comment.type === CommentType.REPORT &&
    !comment.isInternal &&
    comment.comment
  ) {
    emailTrigger = EMAIL_TRIGGERS.REPORT_COMMENT;
    reportId = comment.contextId;
  }

  // New external comment on an attachment
  if (
    comment &&
    comment.type === CommentType.ATTACHMENT &&
    !comment.isInternal &&
    comment.parentReportId &&
    comment.comment
  ) {
    emailTrigger = EMAIL_TRIGGERS.ATTACHMENT_COMMENT;
    reportId = comment.parentReportId;
    uploadId = comment.contextId;
  }

  // Email-triggering status change on an attachment
  if (
    comment &&
    comment.type === CommentType.ATTACHMENT &&
    comment.parentReportId &&
    (comment.statusChange === AttachmentStatus.LOCKED_FOR_SCORING ||
      comment.statusChange === AttachmentStatus.NEEDS_REVISION)
  ) {
    if (comment.statusChange === AttachmentStatus.LOCKED_FOR_SCORING) {
      emailTrigger = EMAIL_TRIGGERS.ATTACHMENT_STATUS_CHANGE_LOCKED;
    } else {
      emailTrigger = EMAIL_TRIGGERS.ATTACHMENT_STATUS_CHANGE_NEEDS_REVISION;
    }
    reportId = comment.parentReportId;
    uploadId = comment.contextId;
  }

  // Email-triggering status change on a report
  if (!comment && reportIdProp) {
    emailTrigger = EMAIL_TRIGGERS.REPORT_STATUS_CHANGE;
    reportId = reportIdProp;
  }

  if (!emailTrigger) return;

  // If it's an attachment update, get the upload
  if (uploadId) {
    const results = await queryUpload(uploadId, state);
    if (!results.Items || results.Items.length === 0) {
      logger.error("Could not find matching file.");
      return;
    }
    const document = results.Items[0];
    attachmentName = document.filename;
  }

  // get the report
  if (!reportId) return;
  const report = await getReport(ReportType.RHTP, state, reportId);
  if (!report) return;

  // get recipients
  const { name: reportName, pages, status } = report;
  const recipients = await getRecipients(pages, user.role, state);
  if (recipients.length === 0) return;
  // get template based on trigger case
  const emailTemplate = getEmailTemplate(emailTrigger, {
    reportName,
    recipients,
    status,
    attachmentName,
  });

  // send email
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
