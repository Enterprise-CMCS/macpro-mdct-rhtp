import {
  DynamoDbStreamRecord,
  GetDynamoMapping,
  GetKafkaConfig,
  kafkaHandler,
  SourceTopicMapping,
} from "./kafkaLib";
import { transformReport } from "./transforms";

const simpleRoute = (_record: DynamoDbStreamRecord, topicName: string) => {
  const namespace = process.env.topicNamespace ?? "";
  return `${namespace}aws.mdct.rhtp.${topicName}.v0`;
};

const tables: SourceTopicMapping[] = [
  {
    sourceName: "reports",
    transform: transformReport,
    topicRouting: (record) => simpleRoute(record, "rhtp-reports"),
  },
  {
    sourceName: "comments",
    topicRouting: (record) => simpleRoute(record, "rhtp-comments"),
  },
];

const getConfig: GetKafkaConfig = () => {
  const { brokerString, STAGE } = process.env;

  if (!brokerString) {
    throw new Error("Missing config! Must specify brokerString");
  } else if (brokerString === "localstack") {
    console.debug("Ignoring event: Localstack should not talk to Kafka");
    return undefined;
  }

  if (!STAGE) {
    throw new Error("Missing config! Must specify STAGE");
  }

  return {
    clientId: `rhtp-${STAGE}`,
    brokers: brokerString.split(","),
    retry: {
      initialRetryTime: 300,
      retries: 8,
    },
    ssl: {
      rejectUnauthorized: false,
    },
  };
};

const getDynamoMapping: GetDynamoMapping = (record) => {
  const table = tables.find((t) =>
    record.eventSourceARN.includes(`/${process.env.STAGE}-${t.sourceName}/`)
  );
  if (!table) {
    console.warn(`Ignoring record: no matching table mapping`);
    return undefined;
  }

  return table;
};

export const handler = kafkaHandler({
  getConfig,
  getDynamoMapping,
});
