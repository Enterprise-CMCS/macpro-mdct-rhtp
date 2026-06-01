import { DeleteCommand, paginateScan, PutCommand } from "@aws-sdk/lib-dynamodb";
import { createClient } from "./dynamo/dynamodb-lib";
import { BannerFormData, BannerShape } from "@rhtp/shared";

const bannerTableName = process.env.BannersTable;
const client = createClient();

export const putBanner = async (banner: BannerFormData) => {
  await client.send(
    new PutCommand({
      TableName: bannerTableName,
      Item: banner,
    })
  );
};

export const scanAllBanners = async () => {
  const pages = paginateScan({ client }, { TableName: bannerTableName });
  const items: Record<string, any>[] = [];
  for await (const page of pages) {
    items.push(...(page.Items ?? []));
  }
  return items as BannerShape[];
};

export const deleteBanner = async (bannerId: string) => {
  await client.send(
    new DeleteCommand({
      TableName: bannerTableName,
      Key: {
        key: bannerId,
      },
    })
  );
};
