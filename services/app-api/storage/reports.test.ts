import {
  getReport,
  putReport,
  queryReportsForState,
  updateFields,
} from "./reports";
import { Report, ReportType } from "../types/reports";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockReport = {
  type: "RHTP",
  id: "mock-report-id",
  state: "CO",
} as Report;

describe("Report storage helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDynamo.reset();
  });

  describe("putReport", () => {
    test("should call DynamoDB to put report data", async () => {
      const mockPut = vi.fn();
      mockDynamo.on(PutCommand).callsFake(mockPut);

      await putReport(mockReport);

      expect(mockPut).toHaveBeenCalledWith(
        {
          TableName: "local-rhtp-reports",
          Item: mockReport,
        },
        expect.any(Function)
      );
    });
  });

  describe("getReport", () => {
    test("should call DynamoDB to get report data", async () => {
      const mockGet = vi.fn().mockResolvedValue({
        Item: mockReport,
      });
      mockDynamo.on(GetCommand).callsFake(mockGet);

      const report = await getReport(ReportType.RHTP, "CO", "mock-report-id");

      expect(report).toBe(mockReport);
      expect(mockGet).toHaveBeenCalledWith(
        {
          TableName: "local-rhtp-reports",
          Key: { state: "CO", id: "mock-report-id" },
        },
        expect.any(Function)
      );
    });

    test("should return undefined if report is not found", async () => {
      mockDynamo.on(GetCommand).resolvesOnce({});
      const report = await getReport(ReportType.RHTP, "CO", "mock-report-id");
      expect(report).toBe(undefined);
    });
  });

  describe("queryReportsForState", () => {
    test("should call DynamoDB to get report data", async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        Items: [mockReport],
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(QueryCommand).callsFake(mockQuery);

      const reports = await queryReportsForState(ReportType.RHTP, "CO");

      expect(reports).toEqual([mockReport]);
      expect(mockQuery).toHaveBeenCalledWith(
        {
          TableName: "local-rhtp-reports",
          KeyConditionExpression: "#state = :state",
          ExpressionAttributeValues: { ":state": "CO" },
          ExpressionAttributeNames: {
            "#id": "id",
            "#name": "name",
            "#state": "state",
            "#created": "created",
            "#status": "status",
            "#submissionCount": "submissionCount",
            "#archived": "archived",
            "#lastEdited": "lastEdited",
            "#lastEditedBy": "lastEditedBy",
            "#type": "type",
            "#year": "year",
            "#lastEditedByEmail": "lastEditedByEmail",
            "#subType": "subType",
          },
          ProjectionExpression:
            "#id, #name, #state, #created, #status, #submissionCount, #archived, #lastEdited, #lastEditedBy, #type, #year, #lastEditedByEmail, #subType",
        },
        expect.any(Function)
      );
    });
  });

  describe("updateFields", () => {
    test("should call DynamoDB to update report data", async () => {
      const mockUpdate = vi.fn();
      mockDynamo.on(UpdateCommand).callsFake(mockUpdate);

      await updateFields(
        { name: "Updated Name" },
        ReportType.RHTP,
        "CO",
        "mock-report-id"
      );

      expect(mockUpdate).toHaveBeenCalledWith(
        {
          TableName: "local-rhtp-reports",
          Key: { state: "CO", id: "mock-report-id" },
          UpdateExpression: "set #updateField = :updateValue",
          ExpressionAttributeNames: {
            "#updateField": "name",
          },
          ExpressionAttributeValues: {
            ":updateValue": "Updated Name",
          },
        },
        expect.any(Function)
      );
    });
  });
});
