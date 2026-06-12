import { saveNotifications } from "./notifications";
import { Report } from "@rhtp/shared";
import { putNotification } from "../../storage/notifications";
import { SendEmailCommandOutput } from "@aws-sdk/client-ses";
import { User } from "../../types/types";

vi.mock("../../storage/notifications");
const mockPutNotification = vi.mocked(putNotification);

const mockNotificationData = {
  emailResponse: {
    MessageId: "3-2-1",
  } as SendEmailCommandOutput,
  emailTemplate: {
    Source: "from@test.com",
    Destination: {
      ToAddresses: ["email@test.com", "test@email.com"],
    },
    Message: {
      Subject: { Data: "Test Email" },
      Body: {
        Text: {
          Data: "Sending a test email",
        },
      },
    },
  },
  report: {
    id: "123",
    state: "AK",
  } as Report,
  user: {
    fullName: "Mock User",
    email: "mock@user.com",
  } as User,
};

const mockExpectedNotificationBody = {
  contextId: "123",
  emailId: "3-2-1",
  state: "AK",
  recipients: {
    to: ["email@test.com", "test@email.com"],
    cc: [],
    bcc: [],
  },
  message: {
    Subject: { Data: "Test Email" },
    Body: {
      Text: {
        Data: "Sending a test email",
      },
    },
  },
  triggeredByUser: "Mock User",
  triggeredByUserEmail: "mock@user.com",
};

describe("Notification utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveNotifications", () => {
    test("should trigger save command to notifications table", async () => {
      const { emailResponse, emailTemplate, report, user } =
        mockNotificationData;

      await saveNotifications(emailResponse, emailTemplate, report, user);

      expect(mockPutNotification).toHaveBeenCalledTimes(2);
      // where n is 1-indexed
      expect(mockPutNotification).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          ...mockExpectedNotificationBody,
          recipient: mockExpectedNotificationBody.recipients.to[0],
        })
      );
      expect(mockPutNotification).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          ...mockExpectedNotificationBody,
          recipient: mockExpectedNotificationBody.recipients.to[1],
        })
      );
    });
  });
});
