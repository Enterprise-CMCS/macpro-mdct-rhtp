import { Construct } from "constructs";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { DynamoDBTable } from "../constructs/dynamodb-table.ts";

interface CreateDataComponentsProps {
  scope: Construct;
  stage: string;
  isDev: boolean;
}

export function createDataComponents(props: CreateDataComponentsProps) {
  const { scope, stage, isDev } = props;

  const tables = [
    new DynamoDBTable(scope, "Banners", {
      stage,
      isDev,
      name: "banners",
      partitionKey: {
        name: "key",
        type: dynamodb.AttributeType.STRING,
      },
    }),
    new DynamoDBTable(scope, "RhtpReports", {
      stage,
      isDev,
      name: "rhtp-reports",
      partitionKey: {
        name: "state",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
    }),
    new DynamoDBTable(scope, "Uploads", {
      stage,
      isDev,
      name: "uploads",
      partitionKey: {
        name: "uploadedState",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "fileId", type: dynamodb.AttributeType.STRING },
    }),
    new DynamoDBTable(scope, "Comments", {
      stage,
      isDev,
      name: "comments",
      partitionKey: {
        name: "contextId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "created", type: dynamodb.AttributeType.NUMBER },
    }),
    new DynamoDBTable(scope, "Notifications", {
      stage,
      isDev,
      name: "notifications",
      partitionKey: {
        name: "recipient",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "created", type: dynamodb.AttributeType.NUMBER },
    }),
  ];

  return { tables };
}
