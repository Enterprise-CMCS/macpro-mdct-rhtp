import { saveNotification } from "./notifications";
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
  } as Report,
  user: {
    fullName: "Mock User",
    email: "mock@user.com",
  } as User,
};

const mockExpectedNotificationBody = {
  contextId: "123",
  emailId: "3-2-1",
  recipients: {
    to: ["email@test.com", "test@email.com"],
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

  describe("saveNotification", () => {
    test("should trigger save command to notifications table", async () => {
      const { emailResponse, emailTemplate, report, user } =
        mockNotificationData;

      await saveNotification(emailResponse, emailTemplate, report, user);

      expect(mockPutNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockExpectedNotificationBody,
        })
      );
    });
  });
});
