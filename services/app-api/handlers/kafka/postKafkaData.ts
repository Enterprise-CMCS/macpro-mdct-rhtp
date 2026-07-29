import { ReportType } from "@rhtp/shared";
import { GetDynamoInfo, GetKafkaConfig, kafkaHandler } from "./kafkaLib";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getReport } from "../../storage/reports";

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

const getDynamoInfo: GetDynamoInfo = async (record) => {
  const source = record.eventSourceARN;
  const stage = process.env.STAGE ?? "";
  const namespace = process.env.topicNamespace ?? "";
  const payload = unmarshall(record.dynamodb.NewImage);

  if (source.includes(`/${stage}-reports/`)) {
    const isPage = payload.sortKey.includes("#");
    if (isPage) {
      // This must be a Page item, not a Report metadata item. Don't send it.
      return;
    }
    // Fetch the pages and assemble the entire report before sending.
    const report = await getReport(ReportType.RHTP, payload.state, payload.id);
    return {
      topic: `${namespace}aws.mdct.rhtp.rhtp-reports.v0`,
      payload: report!,
    };
  } else if (source.includes(`/${stage}-comments/`)) {
    return {
      topic: `${namespace}aws.mdct.rhtp.rhtp-comments.v0`,
      payload,
    };
  } else {
    return;
  }
};

export const handler = kafkaHandler({
  getConfig,
  getDynamoInfo,
});
