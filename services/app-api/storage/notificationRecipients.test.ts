import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import {
  deleteRecipient,
  putRecipient,
  queryRecipientsByState,
  scanAllRecipients,
} from "./notificationRecipients";

const mockDynamo = mockClient(DynamoDBDocumentClient);

const mockNotificationRecipientData = {
  id: "123",
  email: "test@email.com",
  state: "PA",
  addedBy: "Approver User",
  created: Date.now(),
};

describe("Notification Recipient storage helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDynamo.reset();
  });

  describe("putRecipient", () => {
    test("should call DynamoDB to put notification recipient", async () => {
      const mockPut = vi.fn();
      mockDynamo.on(PutCommand).callsFake(mockPut);

      await putRecipient(mockNotificationRecipientData);

      expect(mockPut).toHaveBeenCalledWith(
        {
          TableName: "local-notifications-recipients",
          Item: mockNotificationRecipientData,
        },
        expect.any(Function)
      );
    });
  });

  describe("scanAllRecipients", () => {
    test("should scan DynamoDB for recipients", async () => {
      const mockScan = vi.fn().mockResolvedValue({
        Items: [mockNotificationRecipientData],
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(ScanCommand).callsFake(mockScan);

      const result = await scanAllRecipients();

      expect(result).toEqual([mockNotificationRecipientData]);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-notifications-recipients",
        }),
        expect.any(Function)
      );
    });
  });

  describe("queryRecipientsByState", () => {
    test("should query DynamoDB for notification recipients by state", async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        Items: [mockNotificationRecipientData],
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(QueryCommand).callsFake(mockQuery);

      const result = await queryRecipientsByState("PA");

      expect(result).toEqual([mockNotificationRecipientData]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-notifications-recipients",
        }),
        expect.any(Function)
      );
    });
  });

  describe("deleteRecipient", () => {
    test("should delete notification recipient", async () => {
      const mockDelete = vi.fn();
      mockDynamo.on(DeleteCommand).callsFake(mockDelete);

      await deleteRecipient("PA", "123");
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
