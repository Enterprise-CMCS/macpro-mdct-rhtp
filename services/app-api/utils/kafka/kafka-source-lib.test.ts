import KafkaSourceLib from "./kafka-source-lib";

let tempNamespace: string | undefined;
let tempBrokers: string | undefined;

const mockSendBatch = vi.fn();
const mockProducer = vi.fn().mockImplementation(() => {
  return {
    disconnect: () => {},
    removeListener: () => {},
    connect: () => {},
    sendBatch: mockSendBatch,
  };
});

vi.mock("kafkajs", () => {
  const Kafka = vi.fn(
    class {
      producer = () => mockProducer();
    }
  );
  return { Kafka };
});

const stage = "testing";
const namespace = "--rhtp--test-stage--";
const table = { sourceName: `${stage}-aTable`, topicName: "aTable-reports" };
const brokerString = "brokerA,brokerB,brokerC";
const dynamoEvent = {
  Records: [
    {
      eventID: "2",
      eventName: "MODIFY",
      eventVersion: "1.0",
      eventSource: "aws:dynamodb",
      awsRegion: "us-east-1",
      dynamodb: {
        Keys: {
          Id: {
            N: "101",
          },
        },
        NewImage: {
          Message: {
            S: "This item has changed",
          },
          Id: {
            N: "101",
          },
        },
        OldImage: {
          Message: {
            S: "New item!",
          },
          Id: {
            N: "101",
          },
        },
        SequenceNumber: "222",
        SizeBytes: 59,
        StreamViewType: "NEW_AND_OLD_IMAGES",
      },
      eventSourceARN: `somePrefix/${table.sourceName}/someSuffix`,
    },
  ],
};

describe("Test Kafka Lib", () => {
  beforeAll(() => {
    // suppress logs in tests
    vi.spyOn(console, "log").mockImplementation(vi.fn());
    tempNamespace = process.env.topicNamespace;
    tempBrokers = process.env.brokerString;

    process.env.topicNamespace = namespace;
    process.env.brokerString = brokerString;
  });

  afterAll(() => {
    process.env.topicNamespace = tempNamespace;
    process.env.brokerString = tempBrokers;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Handles a dynamo event", async () => {
    const sourceLib = new KafkaSourceLib("rhtp", "v0", [table]);
    await sourceLib.handler(dynamoEvent);
    expect(mockSendBatch).toBeCalledTimes(1);
  });

  test("Handles events without versions", async () => {
    const sourceLib = new KafkaSourceLib("rhtp", null, [table]);
    await sourceLib.handler(dynamoEvent);
    expect(mockSendBatch).toBeCalledTimes(1);
  });

  test("Does not pass through events from unrelated tables", async () => {
    const sourceLib = new KafkaSourceLib("rhtp", "v0", [
      { sourceName: "unrelated-table", topicName: "unrelated-topic" },
    ]);
    await sourceLib.handler(dynamoEvent);
    expect(mockSendBatch).toBeCalledTimes(0);
  });

  test("Ignores items with bad keys or missing events", async () => {
    const sourceLib = new KafkaSourceLib("rhtp", "v0", [table]);
    await sourceLib.handler({});
    expect(mockSendBatch).toBeCalledTimes(0);
  });

  test("Handles dynamo events with no OldImage", async () => {
    const dynamoInsertEvent = {
      Records: [
        {
          eventSourceARN: `/${table.sourceName}/`,
          eventID: "test-event-id",
          eventName: "INSERT",
          dynamodb: {
            Keys: { foo: { S: "bar" } },
            NewImage: { foo: { S: "bar" } },
            StreamViewType: "NEW_AND_OLD_IMAGES",
          },
        },
      ],
    };
    const sourceLib = new KafkaSourceLib("rhtp", "v0", [table]);
    await sourceLib.handler(dynamoInsertEvent);
    expect(mockSendBatch).toBeCalledWith({
      topicMessages: [
        {
          messages: [
            expect.objectContaining({
              headers: {
                eventID: "test-event-id",
                eventName: "INSERT",
              },
              key: "bar",
              value: `{"NewImage":{"foo":"bar"},"OldImage":{},"Keys":{"foo":"bar"}}`,
            }),
          ],
          topic: "--rhtp--test-stage--rhtp.aTable-reports.v0",
        },
      ],
    });
  });
});
