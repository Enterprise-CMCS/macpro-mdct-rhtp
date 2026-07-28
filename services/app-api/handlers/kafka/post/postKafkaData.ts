import { kafkaTables, kafkaTopics } from "../../../utils/constants";
import KafkaSourceLib, {
  SourceTopicMapping,
} from "../../../utils/kafka/kafka-source-lib";
import { transformReport } from "./transforms";

const topicPrefix = "aws.mdct.rhtp";
const version = "v0";
const tables: SourceTopicMapping[] = [
  {
    sourceName: kafkaTables.RHTP,
    topicName: kafkaTopics.RHTP,
    transform: transformReport,
  },
  {
    sourceName: kafkaTables.RHTP_COMMENTS,
    topicName: kafkaTopics.RHTP_COMMENTS,
  },
];

const postKafkaData = new KafkaSourceLib(topicPrefix, version, tables);

exports.handler = postKafkaData.handler.bind(postKafkaData);
