import { sendEmail } from "./email";
import sesLib from "../../libs/ses-lib";
import { validReport } from "../tests/mockReport";
import { User } from "../../types/types";
import { saveNotifications } from "./notifications";
import { queryRecipientsByState } from "../../storage/notificationRecipients";
import {
  AttachmentStatus,
  CommentType,
  NotificationRecipientRecord,
  UserRoles,
} from "@rhtp/shared";
import { queryUpload } from "../../storage/upload";
import { getReport } from "../../storage/reports";
import { getEmailTemplate } from "./emailTemplates";
import { Mock } from "vitest";
import { logger } from "../../libs/debug-lib";

vi.mock("../../libs/ses-lib", () => ({
  default: {
    sendSesEmail: vi.fn(),
  },
}));

vi.mock("./notifications");
const mockSaveNotifications = vi.mocked(saveNotifications);

vi.mock("../../storage/notificationRecipients");
const mockQueryRecipients = vi.mocked(queryRecipientsByState);
mockQueryRecipients.mockResolvedValue([
  {
    state: "NJ",
    email: "njrecipient@user.com",
  } as NotificationRecipientRecord,
]);

vi.mock("../../storage/upload");
const mockQueryUpload = vi.mocked(queryUpload);

vi.mock("../../storage/reports");
const mockGetReport = vi.mocked(getReport);

vi.mock("./emailTemplates");
const mockGetEmailTemplate = vi.mocked(getEmailTemplate);
mockGetEmailTemplate.mockReturnValue({
  Source: "MOCK@CMS.GOV",
  Destination: {
    ToAddresses: ["test1@cms.gov", "test2@cms.gov"],
  },
  Message: {
    Subject: { Data: `Mock email` },
    Body: {
      Text: {
        Data: `This is a mock email`,
      },
    },
  },
});

vi.mock("../../libs/debug-lib");
const mockLogger = vi.mocked(logger);

const mockReportWithRecipients: any = structuredClone(validReport);
mockReportWithRecipients.pages[1].elements[2].answer = "email@test.com"; // aor email field

const mockAdminUser = {
  fullName: "Mock Admin",
  email: "mockadmin@user.com",
  role: UserRoles.ADMIN,
} as User;

const mockStateUser = {
  fullName: "Mock State User",
  email: "mockstate@user.com",
  role: UserRoles.STATE_USER,
} as User;

const mockAttachmentComment = {
  contextId: "file-1",
  created: Date.now(),
  id: "comment-id",
  author: "mock user",
  authorEmail: "mockuser@email.com",
  isInternal: false,
  type: CommentType.ATTACHMENT,
  parentReportId: validReport.id,
  comment: "New attachment comment",
};

const mockReportComment = {
  contextId: validReport.id,
  created: Date.now(),
  id: "comment-id",
  author: "mock user",
  authorEmail: "mockuser@email.com",
  isInternal: false,
  type: CommentType.REPORT,
  comment: "New report comment",
};

describe("email utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendEmail", () => {
    test("should not issue a send email command when no email trigger identified", async () => {
      await sendEmail({ state: "PA", user: mockAdminUser });
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should not issue a send email command for file with no record", async () => {
      mockQueryUpload.mockResolvedValue({ Items: [] } as any);
      await sendEmail({
        state: "PA",
        user: mockAdminUser,
        comment: mockAttachmentComment,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should not issue a send email command when no report found", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [{ filename: "mockfile.pdf" }],
      } as any);
      mockGetReport.mockResolvedValue(undefined);
      await sendEmail({
        state: "PA",
        user: mockAdminUser,
        comment: mockAttachmentComment,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(mockGetReport).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should not issue a send email command when no recipients found for admin user", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [{ filename: "mockfile.pdf" }],
      } as any);
      mockGetReport.mockResolvedValue(validReport);
      await sendEmail({
        state: "PA",
        user: mockAdminUser,
        comment: mockAttachmentComment,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(mockGetReport).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should not issue a send email command when no recipients found for state user", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [{ filename: "mockfile.pdf" }],
      } as any);
      mockGetReport.mockResolvedValue(validReport);
      mockQueryRecipients.mockResolvedValueOnce([]);
      await sendEmail({
        state: "PA",
        user: mockStateUser,
        comment: mockAttachmentComment,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(mockGetReport).toHaveBeenCalled();
      expect(mockQueryRecipients).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should send an email for report comment", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [{ filename: "mockfile.pdf" }],
      } as any);
      mockGetReport.mockResolvedValue(validReport);
      mockQueryRecipients.mockResolvedValueOnce([
        { email: "cms.user@test.com" } as NotificationRecipientRecord,
      ]);
      await sendEmail({
        state: "PA",
        user: mockStateUser,
        comment: mockReportComment,
      });
      expect(mockQueryUpload).not.toHaveBeenCalled();
      expect(mockGetReport).toHaveBeenCalled();
      expect(mockQueryRecipients).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).toHaveBeenCalled();
      expect(mockSaveNotifications).toHaveBeenCalled();
    });

    test("should send an email for report status change", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [{ filename: "mockfile.pdf" }],
      } as any);
      mockGetReport.mockResolvedValue(validReport);
      mockQueryRecipients.mockResolvedValueOnce([
        { email: "cms.user@test.com" } as NotificationRecipientRecord,
      ]);
      await sendEmail({
        state: "PA",
        user: mockStateUser,
        reportId: validReport.id,
      });
      expect(mockQueryUpload).not.toHaveBeenCalled();
      expect(mockGetReport).toHaveBeenCalled();
      expect(mockQueryRecipients).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).toHaveBeenCalled();
      expect(mockSaveNotifications).toHaveBeenCalled();
    });

    test("should send an email for attachment comment", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [{ filename: "mockfile.pdf" }],
      } as any);
      mockGetReport.mockResolvedValue(validReport);
      mockQueryRecipients.mockResolvedValueOnce([
        { email: "cms.user@test.com" } as NotificationRecipientRecord,
      ]);
      await sendEmail({
        state: "PA",
        user: mockStateUser,
        comment: mockAttachmentComment,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(mockGetReport).toHaveBeenCalled();
      expect(mockQueryRecipients).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).toHaveBeenCalled();
      expect(mockSaveNotifications).toHaveBeenCalled();
    });

    test("should send an email for attachment status changed to locked for scoring", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [{ filename: "mockfile.pdf" }],
      } as any);
      mockGetReport.mockResolvedValue(mockReportWithRecipients);
      mockQueryRecipients.mockResolvedValueOnce([
        { email: "cms.user@test.com" } as NotificationRecipientRecord,
      ]);
      const mockAttachmentStatusChange = {
        ...mockAttachmentComment,
        comment: undefined,
        statusChange: AttachmentStatus.LOCKED_FOR_SCORING,
      };
      await sendEmail({
        state: "PA",
        user: mockAdminUser,
        comment: mockAttachmentStatusChange,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(mockGetReport).toHaveBeenCalled();
      expect(mockQueryRecipients).not.toHaveBeenCalled();
      expect(sesLib.sendSesEmail).toHaveBeenCalled();
      expect(mockSaveNotifications).toHaveBeenCalled();
    });

    test("should send an email for attachment status changed to needs revision", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [{ filename: "mockfile.pdf" }],
      } as any);
      mockGetReport.mockResolvedValue(mockReportWithRecipients);
      mockQueryRecipients.mockResolvedValueOnce([
        { email: "cms.user@test.com" } as NotificationRecipientRecord,
      ]);
      const mockAttachmentStatusChange = {
        ...mockAttachmentComment,
        comment: undefined,
        statusChange: AttachmentStatus.NEEDS_REVISION,
      };
      await sendEmail({
        state: "PA",
        user: mockAdminUser,
        comment: mockAttachmentStatusChange,
      });
      expect(mockQueryUpload).toHaveBeenCalled();
      expect(mockGetReport).toHaveBeenCalled();
      expect(mockQueryRecipients).not.toHaveBeenCalled();
      expect(sesLib.sendSesEmail).toHaveBeenCalled();
      expect(mockSaveNotifications).toHaveBeenCalled();
    });

    test("should not send an email for attachment status changed to informational", async () => {
      mockQueryUpload.mockResolvedValue({
        Items: [{ filename: "mockfile.pdf" }],
      } as any);
      mockGetReport.mockResolvedValue(validReport);
      mockQueryRecipients.mockResolvedValueOnce([
        { email: "cms.user@test.com" } as NotificationRecipientRecord,
      ]);
      const mockAttachmentStatusChange = {
        ...mockAttachmentComment,
        comment: undefined,
        statusChange: AttachmentStatus.INFORMATIONAL,
      };
      await sendEmail({
        state: "PA",
        user: mockStateUser,
        comment: mockAttachmentStatusChange,
      });
      expect(mockQueryUpload).not.toHaveBeenCalled();
      expect(mockGetReport).not.toHaveBeenCalled();
      expect(mockQueryRecipients).not.toHaveBeenCalled();
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should log an error if email command fails", async () => {
      (sesLib.sendSesEmail as Mock).mockThrowOnce("Error!");
      mockQueryUpload.mockResolvedValue({
        Items: [{ filename: "mockfile.pdf" }],
      } as any);
      mockGetReport.mockResolvedValue(validReport);
      mockQueryRecipients.mockResolvedValueOnce([
        { email: "cms.user@test.com" } as NotificationRecipientRecord,
      ]);
      await sendEmail({
        state: "PA",
        user: mockStateUser,
        reportId: validReport.id,
      });
      expect(mockQueryUpload).not.toHaveBeenCalled();
      expect(mockGetReport).toHaveBeenCalled();
      expect(mockQueryRecipients).toHaveBeenCalled();
      expect(sesLib.sendSesEmail).toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
