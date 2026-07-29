import {
  deleteReport,
  getReport,
  putReport,
  scanLiteReports,
  queryReportsForState,
  scanAndCompileReports,
} from "./reports";
import { ElementType, Report, ReportType } from "@rhtp/shared";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);

/** The shape of the report as the rest of the app sees it */
const mockReport = {
  type: "RHTP",
  subTypeKey: "A1",
  id: "mock-report-id",
  state: "CO",
  pages: [
    { id: "root", childPageIds: ["pageA", "pageB"] },
    { id: "pageA", elements: [{ type: ElementType.Header, text: "Page A" }] },
    { id: "pageB", elements: [{ type: ElementType.Header, text: "Page B" }] },
  ],
} as Report;

const liteReport = {
  type: "RHTP",
  subTypeKey: "A1",
  id: "mock-report-id",
  state: "CO",
};

/** The shape of the report as it is stored in the database */
const mockStoredReport = [
  {
    type: "RHTP",
    subTypeKey: "A1",
    id: "mock-report-id",
    state: "CO",
    pKey: "RHTP#CO",
    sortKey: "mock-report-id",
    pages: [
      "mock-report-id#root",
      "mock-report-id#pageA",
      "mock-report-id#pageB",
    ],
  },
  {
    id: "root",
    childPageIds: ["pageA", "pageB"],
    pKey: "RHTP#CO",
    sortKey: "mock-report-id#root",
  },
  {
    id: "pageA",
    elements: [{ type: ElementType.Header, text: "Page A" }],
    pKey: "RHTP#CO",
    sortKey: "mock-report-id#pageA",
  },
  {
    id: "pageB",
    elements: [{ type: ElementType.Header, text: "Page B" }],
    pKey: "RHTP#CO",
    sortKey: "mock-report-id#pageB",
  },
];

const mockReport2 = {
  type: "RHTP",
  subTypeKey: "Q1",
  id: "mock-report-id2",
  state: "PA",
  pages: [
    { id: "root", childPageIds: ["pageA", "pageB"] },
    { id: "pageA", elements: [{ type: ElementType.Header, text: "Page A" }] },
    { id: "pageB", elements: [{ type: ElementType.Header, text: "Page B" }] },
  ],
} as Report;

const mockStoredReport2 = [
  {
    type: "RHTP",
    subTypeKey: "Q1",
    id: "mock-report-id2",
    state: "PA",
    pKey: "RHTP#PA",
    sortKey: "mock-report-id2",
    pages: [
      "mock-report-id2#root",
      "mock-report-id2#pageA",
      "mock-report-id2#pageB",
    ],
  },
  {
    id: "root",
    childPageIds: ["pageA", "pageB"],
    pKey: "RHTP#PA",
    sortKey: "mock-report-id2#root",
  },
  {
    id: "pageA",
    elements: [{ type: ElementType.Header, text: "Page A" }],
    pKey: "RHTP#PA",
    sortKey: "mock-report-id2#pageA",
  },
  {
    id: "pageB",
    elements: [{ type: ElementType.Header, text: "Page B" }],
    pKey: "RHTP#PA",
    sortKey: "mock-report-id2#pageB",
  },
];

describe("Report storage helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDynamo.reset();
  });

  describe("putReport", () => {
    test("should call DynamoDB to put report data", async () => {
      const mockBatchWrite = vi.fn().mockResolvedValue({});
      mockDynamo.on(BatchWriteCommand).callsFake(mockBatchWrite);

      await putReport(mockReport);

      expect(mockBatchWrite).toHaveBeenCalledWith(
        {
          RequestItems: {
            "local-reports": [
              { PutRequest: { Item: mockStoredReport[0] } },
              { PutRequest: { Item: mockStoredReport[1] } },
              { PutRequest: { Item: mockStoredReport[2] } },
              { PutRequest: { Item: mockStoredReport[3] } },
            ],
          },
        },
        expect.any(Function)
      );
    });
  });

  describe("getReport", () => {
    test("should call DynamoDB to get report data", async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        Items: structuredClone(mockStoredReport),
      });
      mockDynamo.on(QueryCommand).callsFake(mockQuery);

      const report = await getReport(ReportType.RHTP, "CO", "mock-report-id");

      expect(report).toEqual(mockReport);
      expect(mockQuery).toHaveBeenCalledWith(
        {
          TableName: "local-reports",
          KeyConditionExpression: "pKey = :pKey AND begins_with(sortKey, :id)",
          ExpressionAttributeValues: {
            ":pKey": "RHTP#CO",
            ":id": "mock-report-id",
          },
        },
        expect.any(Function)
      );
    });

    test("should return undefined if report is not found", async () => {
      mockDynamo.on(QueryCommand).resolvesOnce({});
      const report = await getReport(ReportType.RHTP, "CO", "mock-report-id");
      expect(report).toBe(undefined);
    });
  });

  describe("deleteReport", () => {
    test("should call DynamoDB to delete report data", async () => {
      const mockBatchWrite = vi.fn().mockResolvedValue({});
      mockDynamo.on(BatchWriteCommand).callsFake(mockBatchWrite);

      const mockQuery = vi.fn().mockResolvedValue({
        Items: structuredClone(mockStoredReport),
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(QueryCommand).callsFake(mockQuery);

      await deleteReport(ReportType.RHTP, "CO", "mock-report-id");

      expect(mockBatchWrite).toHaveBeenCalledWith(
        {
          RequestItems: {
            "local-reports": [
              {
                DeleteRequest: {
                  Key: { pKey: "RHTP#CO", sortKey: "mock-report-id" },
                },
              },
              {
                DeleteRequest: {
                  Key: { pKey: "RHTP#CO", sortKey: "mock-report-id#root" },
                },
              },
              {
                DeleteRequest: {
                  Key: { pKey: "RHTP#CO", sortKey: "mock-report-id#pageA" },
                },
              },
              {
                DeleteRequest: {
                  Key: { pKey: "RHTP#CO", sortKey: "mock-report-id#pageB" },
                },
              },
            ],
          },
        },
        expect.any(Function)
      );
    });
  });

  describe("queryReportsForState", () => {
    it("should call DynamoDB to get multiple reports", async () => {
      const mockLiteReport = structuredClone(mockReport) as any;
      delete mockLiteReport.pages;
      const mockQuery = vi.fn().mockResolvedValue({
        Items: structuredClone(mockStoredReport),
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(QueryCommand).callsFake(mockQuery);

      const reports = await queryReportsForState(ReportType.RHTP, "CO");

      expect(reports).toEqual([mockLiteReport]);
      expect(mockQuery).toHaveBeenCalledWith(
        {
          TableName: "local-reports",
          KeyConditionExpression: "pKey = :pKey",
          ExpressionAttributeValues: { ":pKey": "RHTP#CO" },
        },
        expect.any(Function)
      );
    });
  });

  describe("scanLiteReports", () => {
    test("should call DynamoDB to get report data", async () => {
      const mockScan = vi.fn().mockResolvedValue({
        Items: structuredClone(mockStoredReport),
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(ScanCommand).callsFake(mockScan);

      const reports = await scanLiteReports();

      expect(reports.length).toEqual(1);
      expect(reports[0]).toEqual(liteReport);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-reports",
        }),
        expect.any(Function)
      );
    });
  });

  describe("scanAndCompileReports", () => {
    test("should call DynamoDB to get report data", async () => {
      const reportItems = [
        ...structuredClone(mockStoredReport),
        ...structuredClone(mockStoredReport2),
      ];
      const mockScan = vi.fn().mockResolvedValue({
        Items: reportItems,
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(ScanCommand).callsFake(mockScan);

      const reports = await scanAndCompileReports(undefined, undefined);

      expect(reports.length).toEqual(2);
      expect(reports[0]).toEqual(mockReport);
      expect(reports[1]).toEqual(mockReport2);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-reports",
        }),
        expect.any(Function)
      );
    });

    test("should filter for subKey and state", async () => {
      const reportItems = [
        ...structuredClone(mockStoredReport),
        ...structuredClone(mockStoredReport2),
      ];
      const mockScan = vi.fn().mockResolvedValue({
        Items: reportItems,
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(ScanCommand).callsFake(mockScan);

      const reportsByState = await scanAndCompileReports(undefined, "PA");

      expect(reportsByState.length).toEqual(1);
      expect(reportsByState[0]).toEqual(mockReport2);
    });

    test("should filter for state", async () => {
      const reportItems = [
        ...structuredClone(mockStoredReport),
        ...structuredClone(mockStoredReport2),
      ];
      const mockScan = vi.fn().mockResolvedValue({
        Items: reportItems,
        LastEvaluatedKey: undefined,
      });
      mockDynamo.on(ScanCommand).callsFake(mockScan);

      const reportsBySubType = await scanAndCompileReports(["Q1"], undefined);

      expect(reportsBySubType.length).toEqual(1);
      expect(reportsBySubType[0]).toEqual(mockReport2);
    });
  });
});
