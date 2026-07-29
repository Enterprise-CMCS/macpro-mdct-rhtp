import { handler } from "./postKafkaData";
import { Kafka } from "kafkajs";
import { mockClient } from "aws-sdk-client-mock";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { ElementType, Report } from "@rhtp/shared";
import { getReport } from "../../storage/reports";

vi.spyOn(console, "debug").mockImplementation(vi.fn());
vi.spyOn(console, "info").mockImplementation(vi.fn());
vi.spyOn(console, "warn").mockImplementation(vi.fn());
vi.spyOn(console, "error").mockImplementation(vi.fn());
const { mockConnect, mockSendBatch, mockDisconnect, mockOn } = vi.hoisted(
  () => ({
    mockConnect: vi.fn(),
    mockSendBatch: vi.fn(),
    mockDisconnect: vi.fn(),
    mockOn: vi.fn(),
  })
);

vi.mock("kafkajs", () => ({
  Kafka: vi.fn(
    class {
      producer = vi.fn().mockReturnValue({
        disconnect: mockDisconnect,
        connect: mockConnect,
        sendBatch: mockSendBatch,
        on: mockOn,
      });
    }
  ),
}));

const mockS3Client = mockClient(S3Client);
const mockS3Get = vi.fn();
mockS3Client.on(GetObjectCommand).callsFake(mockS3Get);

const mockReportEvent = {
  eventSourceARN: "aaa/local-reports/bbb",
  eventID: "eid-123",
  eventName: "en-123",
  dynamodb: {
    Keys: {
      pKey: { S: "RHTP#CO" },
      sortKey: { S: "report123" },
    },
    NewImage: {
      state: { S: "CO" },
      id: { S: "report123" },
      pKey: { S: "RHTP#CO" },
      sortKey: { S: "report123" },
      status: { S: "In progress" },
    },
    OldImage: {
      state: { S: "CO" },
      id: { S: "report123" },
      pKey: { S: "RHTP#CO" },
      status: { S: "Not started" },
    },
  },
};

const mockCommentEvent = {
  eventSourceARN: "aaa/local-comments/bbb",
  eventID: "eid-123",
  eventName: "en-123",
  dynamodb: {
    Keys: {
      contextId: { S: "reportId123" },
      number: { N: 1234552525 },
    },
    NewImage: {
      contextId: { S: "reportId123" },
      number: { N: 1234552525 },
      comment: { S: "Hello World" },
    },
    OldImage: {},
  },
} as any;

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

vi.mock("../../storage/reports");
const mockGetReport = vi.mocked(getReport);

describe("Kafka message sending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should convert AWS Dynamo Stream Events to Kafka Messages", async () => {
    const event = { Records: [mockReportEvent] };
    mockGetReport.mockResolvedValue(mockReport);
    // kafkalib.ts calls producer.connect() only once.
    // Reload the file to make sure we capture that call in this test.
    // Otherwise, assertions on producer.connect() would rely on test order.
    vi.resetModules();
    expect(mockConnect).not.toHaveBeenCalled();

    await handler(event);

    expect(Kafka).toHaveBeenCalledWith({
      clientId: "rhtp-local",
      brokers: ["broker1", "broker2"],
      retry: { initialRetryTime: 300, retries: 8 },
      ssl: { rejectUnauthorized: false },
    });
    expect(mockConnect).toHaveBeenCalled();

    expect(mockSendBatch).toHaveBeenCalledWith({
      topicMessages: [
        {
          topic: "aws.mdct.rhtp.rhtp-reports.v0",
          messages: [
            {
              headers: {
                eventID: "eid-123",
                eventName: "en-123",
              },
              key: "RHTP#CO#report123",
              partition: 0,
              value: JSON.stringify({
                NewImage: mockReport,
                Keys: {
                  pKey: "RHTP#CO",
                  sortKey: "report123",
                },
              }),
            },
          ],
        },
      ],
    });
  });

  it("should successfully process events for newly-created records", async () => {
    const record = structuredClone(mockReportEvent);
    mockGetReport.mockResolvedValue(mockReport);

    delete (record.dynamodb as any).OldImage;
    const event = { Records: [record] };
    await handler(event);
    expect(mockSendBatch).toHaveBeenCalledWith({
      topicMessages: [
        {
          topic: "aws.mdct.rhtp.rhtp-reports.v0",
          messages: [
            {
              headers: {
                eventID: "eid-123",
                eventName: "en-123",
              },
              key: "RHTP#CO#report123",
              partition: 0,
              value: JSON.stringify({
                NewImage: mockReport,
                Keys: {
                  pKey: "RHTP#CO",
                  sortKey: "report123",
                },
              }),
            },
          ],
        },
      ],
    });
  });

  it("should ignore events for changed report pages", async () => {
    mockGetReport.mockResolvedValue(mockReport);
    const record = structuredClone(mockReportEvent);
    record.dynamodb.NewImage.sortKey = { S: "report123#pageABC" };
    const event = { Records: [record] };
    await handler(event);
    expect(mockSendBatch).not.toHaveBeenCalled();
  });

  it("should ignore events from tables with no associated topic", async () => {
    const record = structuredClone(mockReportEvent);
    record.eventSourceARN = "aaa/local-unknown-table/bbb";
    const event = { Records: [record] };
    await handler(event);
    expect(mockSendBatch).not.toHaveBeenCalled();
  });

  it("should group messages by topic", async () => {
    mockGetReport.mockResolvedValue(mockReport);
    const reportRecord = structuredClone(mockReportEvent);
    const commentRecord = structuredClone(mockCommentEvent);

    const event = { Records: [reportRecord, commentRecord] };
    await handler(event);

    expect(mockSendBatch).toHaveBeenCalledWith({
      topicMessages: [
        {
          topic: "aws.mdct.rhtp.rhtp-reports.v0",
          messages: [expect.objectContaining({ key: "RHTP#CO#report123" })],
        },
        {
          topic: "aws.mdct.rhtp.rhtp-comments.v0",
          messages: [
            expect.objectContaining({ key: "reportId123#1234552525" }),
          ],
        },
      ],
    });
  });

  it("should ignore empty events", async () => {
    await handler({});
    expect(mockSendBatch).not.toHaveBeenCalled();
  });

  it("should ignore events from unknown sources", async () => {
    const nonDynamoNonS3Record = {} as any;
    await handler({ Records: [nonDynamoNonS3Record] });
    expect(mockSendBatch).not.toHaveBeenCalled();
  });

  describe("when environment variables are not typical", () => {
    let originalEnv: any;

    beforeEach(() => {
      const keys = ["brokerString", "STAGE", "topicNamespace"];
      originalEnv = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
      vi.resetModules();
      vi.clearAllMocks();
    });

    afterEach(() => {
      for (let [key, value] of Object.entries(originalEnv)) {
        process.env[key] = value as string;
      }
    });

    it("should ignore all events when running in localstack", async () => {
      process.env.brokerString = "localstack";
      const event = { Records: [mockReportEvent] };
      await handler(event);
      expect(mockSendBatch).not.toHaveBeenCalled();
    });

    it("should error immediately if brokerString is missing", async () => {
      delete process.env.brokerString;
      const event = { Records: [mockReportEvent] };
      await expect(() => handler(event)).rejects.toThrow("Missing config");
      expect(mockSendBatch).not.toHaveBeenCalled();
    });

    it("should error immediately if STAGE is missing", async () => {
      delete process.env.STAGE;
      const event = { Records: [mockReportEvent] };
      await expect(() => handler(event)).rejects.toThrow("Missing config");
      expect(mockSendBatch).not.toHaveBeenCalled();
    });

    it("should respect topic namespace for dynamo events", async () => {
      process.env.topicNamespace = "--rhtp--my-branch--";
      const event = { Records: [mockReportEvent] };
      await handler(event);
      expect(mockSendBatch).toHaveBeenCalledWith(
        expect.objectContaining({
          topicMessages: [
            expect.objectContaining({
              topic: "--rhtp--my-branch--aws.mdct.rhtp.rhtp-reports.v0",
            }),
          ],
        })
      );
    });
  });

  it("should disconnect the kafka producer before exiting", async () => {
    const event = { Records: [mockReportEvent] };

    await handler(event);
    expect(mockSendBatch).toHaveBeenCalled();
    expect(mockDisconnect).not.toHaveBeenCalled();

    process.emit("beforeExit", 0);
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it.skip("should connect only as needed", async () => {
    // Delay connect to ensure the two calls will be in progress simultaneously
    const delay = () => new Promise((res) => setTimeout(res, 200));
    mockConnect.mockImplementationOnce(delay).mockImplementationOnce(delay);
    const event = { Records: [mockReportEvent] };

    vi.resetModules();
    expect(mockConnect).not.toHaveBeenCalled();

    // Kick off both calls at once
    await Promise.all([handler(event), handler(event)]);

    // The first event starts a connection; the second event awaits it.
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it("should reconnect as needed", async () => {
    const event = { Records: [mockReportEvent] };

    vi.resetModules();
    expect(mockOn).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();

    await handler(event);
    await handler(event);

    // The first event makes the connection; the second event reuses it.
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockOn).toHaveBeenCalledWith(
      "producer.disconnect",
      expect.any(Function)
    );
    const disconnectListener = mockOn.mock.calls[0][1];

    // The other end disconnects. A Kafka server error, say.
    await disconnectListener("mock disconnect reason");
    await handler(event);

    // The third event establishes a new connection.
    expect(mockConnect).toHaveBeenCalledTimes(2);
  });
});
