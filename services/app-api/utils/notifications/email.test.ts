import { sendReportCommentEmail, sendReportStatusChangeEmail } from "./email";
import sesLib from "../../libs/ses-lib";
import { validReport } from "../tests/mockReport";
import { User } from "../../types/types";
import { saveNotifications } from "./notifications";
import { queryRecipientsByState } from "../../storage/notificationRecipients";
import { NotificationRecipientRecord, UserRoles } from "@rhtp/shared";

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

describe("email utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendReportStatusChangeEmail", () => {
    test("should not issue a send email command when no email recipient found", async () => {
      await sendReportStatusChangeEmail(validReport, mockAdminUser);
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should issue a send email command to report emails when initiated by cms user", async () => {
      // any type so it doesn't complain about accessing .answer on generic PageElement
      const reportWithEmail: any = structuredClone(validReport);
      reportWithEmail.pages[1].elements[2].answer = "test@email.com";
      await sendReportStatusChangeEmail(reportWithEmail, mockAdminUser);
      expect(sesLib.sendSesEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          Destination: { ToAddresses: ["test@email.com"] },
        })
      );
      expect(mockQueryRecipients).not.toHaveBeenCalled();
      expect(mockSaveNotifications).toHaveBeenCalled();
    });

    test("should issue a send email command to assigned users when initiated by state user", async () => {
      await sendReportStatusChangeEmail(validReport, mockStateUser);
      expect(sesLib.sendSesEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          Destination: { ToAddresses: ["njrecipient@user.com"] },
        })
      );
      expect(mockQueryRecipients).toHaveBeenCalled();
      expect(mockSaveNotifications).toHaveBeenCalled();
    });

    test("should not issue a send email command when answers are not valid email addresses", async () => {
      const reportWithEmail: any = structuredClone(validReport);
      reportWithEmail.pages[1].elements[2].answer = "not-an-email";
      await sendReportStatusChangeEmail(reportWithEmail, mockAdminUser);
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should dedupe repeated email answers", async () => {
      const reportWithEmail: any = structuredClone(validReport);
      const emailElements = reportWithEmail.pages
        .find((page: any) => page.id === "general-information")
        .elements.filter((element: any) => element.id.includes("email"));
      for (const element of emailElements) {
        element.answer = "test@email.com";
      }
      await sendReportStatusChangeEmail(reportWithEmail, mockAdminUser);
      expect(sesLib.sendSesEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          Destination: { ToAddresses: ["test@email.com"] },
        })
      );
    });
  });

  describe("sendReportCommentEmail", () => {
    test("should not issue a send email command when no email recipient found", async () => {
      await sendReportCommentEmail(validReport, mockAdminUser);
      expect(sesLib.sendSesEmail).not.toHaveBeenCalled();
      expect(mockSaveNotifications).not.toHaveBeenCalled();
    });

    test("should issue a send email command to report emails when initiated by cms user", async () => {
      // any type so it doesn't complain about accessing .answer on generic PageElement
      const reportWithEmail: any = structuredClone(validReport);
      reportWithEmail.pages[1].elements[2].answer = "test@email.com";
      await sendReportCommentEmail(reportWithEmail, mockAdminUser);
      expect(sesLib.sendSesEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          Destination: { ToAddresses: ["test@email.com"] },
        })
      );
      expect(mockQueryRecipients).not.toHaveBeenCalled();
      expect(mockSaveNotifications).toHaveBeenCalled();
    });

    test("should issue a send email command to assigned users when initiated by state user", async () => {
      await sendReportCommentEmail(validReport, mockStateUser);
      expect(sesLib.sendSesEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          Destination: { ToAddresses: ["njrecipient@user.com"] },
        })
      );
      expect(mockQueryRecipients).toHaveBeenCalled();
      expect(mockSaveNotifications).toHaveBeenCalled();
    });
  });
});
