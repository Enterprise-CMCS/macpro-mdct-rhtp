import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { putNotification } from "./notifications";
import { StateAbbr } from "@rhtp/shared";

const mockDynamo = mockClient(DynamoDBDocumentClient);

const mockNotificationData = {
  recipient: "email@test.com",
  created: Date.now(),
  contextId: "123",
  emailId: "3-2-1",
  state: "PA" as StateAbbr,
  recipients: {
    to: ["email@test.com, test@email.com"],
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

describe("Notification storage helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDynamo.reset();
  });

  describe("putReport", () => {
    test("should call DynamoDB to put notification data", async () => {
      const mockPut = vi.fn();
      mockDynamo.on(PutCommand).callsFake(mockPut);

      await putNotification(mockNotificationData);

      expect(mockPut).toHaveBeenCalledWith(
        {
          TableName: "local-notifications",
          Item: mockNotificationData,
        },
        expect.any(Function)
      );
    });
  });
});
