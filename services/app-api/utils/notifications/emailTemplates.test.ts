import { EMAIL_TRIGGERS } from "./email";
import { getEmailTemplate } from "./emailTemplates";

const genericData = {
  reportName: "State Annual Report 1",
  recipients: ["user1@test.com", "user2@test.com"],
  status: "Report status",
  attachmentName: "Attachment name",
};

describe("emailTemplate util", () => {
  test("returns report comment template for report comment trigger", () => {
    const template = getEmailTemplate(
      EMAIL_TRIGGERS.REPORT_COMMENT,
      genericData
    );
    expect(template).toEqual(
      expect.objectContaining({
        Destination: {
          ToAddresses: genericData.recipients,
        },
        Message: expect.objectContaining({
          Subject: { Data: `RHTP: New comment on ${genericData.reportName}` },
        }),
      })
    );
  });

  test("returns report status template for report status trigger", () => {
    const template = getEmailTemplate(
      EMAIL_TRIGGERS.REPORT_STATUS_CHANGE,
      genericData
    );
    expect(template).toEqual(
      expect.objectContaining({
        Destination: {
          ToAddresses: genericData.recipients,
        },
        Message: expect.objectContaining({
          Subject: {
            Data: `RHTP: Status update for ${genericData.reportName}`,
          },
        }),
      })
    );
  });

  test("returns attachment comment template for attachment comment trigger", () => {
    const template = getEmailTemplate(
      EMAIL_TRIGGERS.ATTACHMENT_COMMENT,
      genericData
    );
    expect(template).toEqual(
      expect.objectContaining({
        Destination: {
          ToAddresses: genericData.recipients,
        },
        Message: expect.objectContaining({
          Subject: {
            Data: `RHTP: Attachment ${genericData.attachmentName} has a new comment`,
          },
        }),
      })
    );
  });

  test("returns attachment locked template for attachment locked trigger", () => {
    const template = getEmailTemplate(
      EMAIL_TRIGGERS.ATTACHMENT_STATUS_CHANGE_LOCKED,
      genericData
    );
    expect(template).toEqual(
      expect.objectContaining({
        Destination: {
          ToAddresses: genericData.recipients,
        },
        Message: expect.objectContaining({
          Subject: {
            Data: `RHTP: Attachment ${genericData.attachmentName} status changed to Locked for Scoring`,
          },
        }),
      })
    );
  });

  test("returns attachment needs revision template for attachment needs revision trigger", () => {
    const template = getEmailTemplate(
      EMAIL_TRIGGERS.ATTACHMENT_STATUS_CHANGE_NEEDS_REVISION,
      genericData
    );
    expect(template).toEqual(
      expect.objectContaining({
        Destination: {
          ToAddresses: genericData.recipients,
        },
        Message: expect.objectContaining({
          Subject: {
            Data: `RHTP: Attachment ${genericData.attachmentName} status changed to Needs Revision`,
          },
        }),
      })
    );
  });
});
