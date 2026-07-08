import { kafkaTables, kafkaTopics } from "../../../utils/constants";
import KafkaSourceLib from "../../../utils/kafka/kafka-source-lib";

const topicPrefix = "aws.mdct.rhtp";
const version = "v0";
const tables = [
  { sourceName: kafkaTables.RHTP, topicName: kafkaTopics.RHTP },
  {
    sourceName: kafkaTables.RHTP_COMMENTS,
    topicName: kafkaTopics.RHTP_COMMENTS,
  },
];

const postKafkaData = new KafkaSourceLib(topicPrefix, version, tables);

exports.handler = postKafkaData.handler.bind(postKafkaData);
