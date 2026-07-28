import { unmarshall } from "@aws-sdk/util-dynamodb";
import { Kafka, Producer } from "kafkajs";

/**
 * Mapping entry relating a data source to its output topic.
 *
 * The provided `transform` function is applied and awaited after
 * the data is unmarsharlled into a js object. If it returns undefined
 * the entry will be skipped.
 */
export type SourceTopicMapping = {
  sourceName: string;
  topicName: string;
  transform?: Function;
};

type KafkaPayload = {
  key: string;
  value: string;
  partition: number;
  headers: {
    eventName: string;
    eventTime?: string;
    eventID?: string;
  };
};

let kafka: Kafka;
let producer: Producer;

class KafkaSourceLib {
  /*
   * Event types:
   * cmd – command; restful publish
   * cdc – change data capture; record upsert/delete in data store
   * sys – system event; send email, archive logs
   * fct – fact; user activity, notifications, logs
   *
   * topicPrefix = "[data_center].[system_of_record].[business_domain].[event_type]";
   * version = "some version";
   * tables = [list of table mappings] When ;
   */

  topicPrefix: string;
  version: string | null;
  tables: SourceTopicMapping[];
  connected: boolean;
  topicNamespace: string;
  stage: string;
  constructor(
    topicPrefix: string,
    version: string | null,
    tables: SourceTopicMapping[]
  ) {
    if (!process.env.brokerString) {
      throw new Error("Missing Broker Config. ");
    }
    // Setup vars
    this.stage = process.env.STAGE ?? "";
    this.topicNamespace = process.env.topicNamespace!;
    this.topicPrefix = topicPrefix;
    this.version = version;
    this.tables = tables;

    const brokerStrings = process.env.brokerString;
    kafka = new Kafka({
      clientId: `rhtp-${this.stage}`,
      brokers: brokerStrings!.split(","),
      retry: {
        initialRetryTime: 300,
        retries: 8,
      },
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Attach Events
    producer = kafka.producer();
    this.connected = false;
    const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2", "beforeExit"];
    signalTraps.map((type) => {
      process.removeListener(type, producer.disconnect);
    });
    signalTraps.map((type) => {
      process.once(type, producer.disconnect);
    });
  }

  stringify(e: any, prettyPrint?: boolean) {
    if (prettyPrint === true) return JSON.stringify(e, null, 2);
    return JSON.stringify(e);
  }

  /**
   * Checks if a streamArn is a valid topic. Returns undefined otherwise
   * @param streamARN - DynamoDB streamARN
   * @returns table - SourceTopicMapping
   */
  determineDynamoMapping(streamARN: string) {
    for (const table of this.tables) {
      if (streamARN.includes(`/${table.sourceName}/`)) return table;
    }
    console.log(`Topic not found for table arn: ${streamARN}`);
  }

  unmarshall(r: any) {
    return unmarshall(r);
  }

  async createDynamoPayload(
    record: any,
    transform?: Function
  ): Promise<KafkaPayload | undefined> {
    const dynamodb = record.dynamodb;
    const { eventID, eventName } = record;

    const keys = this.unmarshall(dynamodb.Keys);
    let newImage = this.unmarshall(dynamodb.NewImage);

    if (transform) {
      newImage = await transform(keys, newImage);
    }

    if (!newImage) return undefined;

    const dynamoRecord = {
      NewImage: newImage,
      Keys: keys,
    };

    return {
      key: Object.values(dynamoRecord.Keys).join("#"),
      value: this.stringify(dynamoRecord),
      partition: 0,
      headers: { eventID: eventID, eventName: eventName },
    };
  }

  topic(t: string) {
    if (this.version) {
      return `${this.topicNamespace}${this.topicPrefix}.${t}.${this.version}`;
    } else {
      return `${this.topicNamespace}${this.topicPrefix}.${t}`;
    }
  }

  async createOutboundEvents(records: any[]) {
    let outboundEvents: { [key: string]: any } = {};
    for (const record of records) {
      let payload, topicName, table;

      // DYNAMO
      table = this.determineDynamoMapping(
        String(record.eventSourceARN.toString())
      );
      if (!table) continue;

      topicName = this.topic(table.topicName);
      payload = await this.createDynamoPayload(record, table.transform);
      if (!payload) continue;

      //initialize configuration object keyed to topic for quick lookup
      if (!(outboundEvents[topicName] instanceof Object))
        outboundEvents[topicName] = {
          topic: topicName,
          messages: [],
        };

      //add messages to messages array for corresponding topic
      outboundEvents[topicName].messages.push(payload);
    }
    return outboundEvents;
  }

  async handler(event: any) {
    if (process.env.brokerString === "localstack") {
      return;
    }

    if (!this.connected) {
      await producer.connect();
      this.connected = true;
    }

    // Warmup events have no records.
    if (!event.Records) {
      console.log("No records to process. Exiting.");
      return;
    }

    const outboundEvents = await this.createOutboundEvents(event.Records);

    const topicMessages = Object.values(outboundEvents);
    console.log(`Batch configuration: ${this.stringify(topicMessages, true)}`);

    if (topicMessages.length > 0) await producer.sendBatch({ topicMessages });
    console.log(`Successfully processed ${event.Records.length} records.`);
  }
}

export default KafkaSourceLib;
