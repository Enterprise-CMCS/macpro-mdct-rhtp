import { paginateScan, PutCommand } from "@aws-sdk/lib-dynamodb";
import { createClient } from "./dynamo/dynamodb-lib";

export type DataSetType = {
  key: string;
  name: string;
  status: string;
  createdAt: string;
  createdBy: string;
};

const bannerTableName = process.env.DataSetsTable;
const client = createClient();

export const putDataSet = async (banner: DataSetType) => {
  await client.send(
    new PutCommand({
      TableName: bannerTableName,
      Item: banner,
    })
  );
};

export const scanAllDataSets = async () => {
  const pages = paginateScan({ client }, { TableName: bannerTableName });
  const items: Record<string, any>[] = [];
  for await (const page of pages) {
    items.push(...(page.Items ?? []));
  }
  return items as DataSetType[];
};
