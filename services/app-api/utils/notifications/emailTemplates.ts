import { ReportStatus } from "@rhtp/shared";
import { EMAIL_TRIGGERS } from "./email";

const FROM_ADDRESS = "MDCT_NoReply@cms.hhs.gov";

export const getEmailTemplate = (emailTrigger: EMAIL_TRIGGERS, data: any) => {
  switch (emailTrigger) {
    case EMAIL_TRIGGERS.REPORT_COMMENT:
      return getReportCommentTemplate(data);
    case EMAIL_TRIGGERS.REPORT_STATUS_CHANGE:
      return getReportStatusChangeTemplate(data);
    case EMAIL_TRIGGERS.ATTACHMENT_COMMENT:
      return getAttachmentCommentTemplate(data);
    case EMAIL_TRIGGERS.ATTACHMENT_STATUS_CHANGE_LOCKED:
      return getAttachmentStatusLockedChangeTemplate(data);
    case EMAIL_TRIGGERS.ATTACHMENT_STATUS_CHANGE_NEEDS_REVISION:
      return getAttachmentStatusRevisionChangeTemplate(data);
  }
};

const getReportCommentTemplate = ({
  reportName,
  recipients,
}: {
  reportName: string;
  recipients: string[];
}) => ({
  Source: FROM_ADDRESS,
  Destination: {
    ToAddresses: recipients,
  },
  Message: {
    Subject: { Data: `RHTP: New comment on ${reportName}` },
    Body: {
      Text: {
        Data: `
This is an automated notification that a comment has been added to a report within the MDCT Rural Health Transformation Program (RHTP) platform.

Update summary

    Report name: ${reportName}

    Activity: New report comment added

    Date of change: ${new Date().toDateString()}

    Please follow the steps below to navigate to the comment within the portal:

    1. Log in to the RHTP Portal: https://mdctrhtp.cms.gov
    2. Find ${reportName}
    3. Select Manage.

    If you believe this notification was sent in error, or if you have questions, please reach out to the RHTP support desk.

    Sincerely,

    The RHTP Team
`,
      },
    },
  },
});

const getReportStatusChangeTemplate = ({
  reportName,
  recipients,
  status,
}: {
  reportName: string;
  recipients: string[];
  status: ReportStatus;
}) => ({
  Source: FROM_ADDRESS,
  Destination: {
    ToAddresses: recipients,
  },
  Message: {
    Subject: { Data: `RHTP: Status update for ${reportName}` },
    Body: {
      Text: {
        Data: `Dear User,

This is an automated notification to inform you that there has been a change in the status of a report within the Rural Health Transformation Program (RHTP) platform on MDCT.

Please find the details of the update below:

Update summary

    Report name: ${reportName}

    New status: ${status}

    Date of change: ${new Date().toDateString()}

If you believe this status change was made in error, or if you have questions regarding the requirements for this new status, please contact your system administrator or reach out to the RHTP support desk.
`,
      },
    },
  },
});

const getAttachmentCommentTemplate = ({
  reportName,
  recipients,
  attachmentName,
}: {
  reportName: string;
  recipients: string[];
  attachmentName: string;
}) => ({
  Source: FROM_ADDRESS,
  Destination: {
    ToAddresses: recipients,
  },
  Message: {
    Subject: { Data: `RHTP: Attachment ${attachmentName} has a new comment` },
    Body: {
      Text: {
        Data: `
This is an automated notification that a comment has been added to an attachment within the MDCT Rural Health Transformation Program (RHTP) platform.

Update Summary

    Report name: ${reportName}

    Attachment name: ${attachmentName}

    Activity: New comment added

    Date of Change: ${new Date().toDateString()}

    Please follow the steps below to navigate to the comment within the portal:

    1. Log in to the RHTP Portal: https://mdctrhtp.cms.gov
    2. Open ${reportName}
    3. Select Initiative Attachments.
    4. Find ${attachmentName} and select Manage.

    If you believe this notification was sent in error, or if you have questions, please reach out to the RHTP support desk.

    Sincerely,

    The RHTP Team
`,
      },
    },
  },
});

const getAttachmentStatusLockedChangeTemplate = ({
  reportName,
  recipients,
  attachmentName,
}: {
  reportName: string;
  recipients: string[];
  attachmentName: string;
}) => ({
  Source: FROM_ADDRESS,
  Destination: {
    ToAddresses: recipients,
  },
  Message: {
    Subject: {
      Data: `RHTP: Attachment ${attachmentName} status changed to Locked for Scoring`,
    },
    Body: {
      Text: {
        Data: `
This is an automated notification that the status of an attachment has changed within the MDCT Rural Health Transformation Program (RHTP) platform. CMS has locked this document for scoring. When in this status, attachments are locked and cannot be edited or deleted.

Update Summary

    Report name: ${reportName}

    Attachment name: ${attachmentName}

    New status: Locked for Scoring

    Date of Change: ${new Date().toDateString()}

    No further action is required for this attachment. If you wish to view the locked attachment within the portal, please follow the steps below:

    1. Log in to the RHTP Portal: https://mdctrhtp.cms.gov
    2. Find ${reportName}
    3. Select Initiative Attachments.
    4. Find ${attachmentName} to view its status.

    If you believe this status change was made in error or have questions, please reach out to the RHTP support desk.

    Sincerely,

    The RHTP Team
`,
      },
    },
  },
});

const getAttachmentStatusRevisionChangeTemplate = ({
  reportName,
  recipients,
  attachmentName,
}: {
  reportName: string;
  recipients: string[];
  attachmentName: string;
}) => ({
  Source: FROM_ADDRESS,
  Destination: {
    ToAddresses: recipients,
  },
  Message: {
    Subject: {
      Data: `RHTP: Attachment ${attachmentName} status changed to Needs Revision`,
    },
    Body: {
      Text: {
        Data: `
This is an automated notification that the status of an attachment has changed within the MDCT Rural Health Transformation Program (RHTP) platform. CMS has determined that this attachment requires updates or corrections.

Update Summary

    Report name: ${reportName}

    Attachment name: ${attachmentName}

    New status: Needs Revision

    Date of Change: ${new Date().toDateString()}

    Please follow the steps below to review the feedback and upload a revised version within the portal:

    1. Log in to the RHTP Portal: https://mdctrhtp.cms.gov
    2. Find ${reportName}
    3. Select Initiative Attachments.
    4. Find ${attachmentName} and select Manage to review CMS feedback.

    If you believe this status change was made in error, or if you have questions regarding the requirements for this attachment, please reach out to the RHTP support desk.

    Sincerely,

    The RHTP Team
`,
      },
    },
  },
});
